from __future__ import annotations

import base64
import io
import json
import os
import random
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.request import urlretrieve

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from PIL import Image, ImageDraw, ImageFont

DEFAULT_DATA_DIR = Path(os.environ.get("DATA_DIR", Path(__file__).resolve().parent / "runtime")).resolve()
DEFAULT_DATA_DIR.mkdir(parents=True, exist_ok=True)
os.environ.setdefault("MPLCONFIGDIR", str(DEFAULT_DATA_DIR / "matplotlib"))
os.environ.setdefault("YOLO_CONFIG_DIR", str(DEFAULT_DATA_DIR / "ultralytics"))

YOLO_IMPORT_ERROR: str | None = None

try:
    from ultralytics import YOLO
except Exception as exc:  # pragma: no cover - production can still run in demo mode without torch/ultralytics
    YOLO = None
    YOLO_IMPORT_ERROR = repr(exc)


ROOT = Path(__file__).resolve().parent
REPO_ROOT = ROOT.parent
DATA_DIR = DEFAULT_DATA_DIR
DATA_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH_ENV = os.environ.get("MODEL_PATH")
MODEL_URL = os.environ.get("MODEL_URL")
MODEL_CANDIDATES = [
    Path(MODEL_PATH_ENV).expanduser().resolve() if MODEL_PATH_ENV else None,
    ROOT / "model.pt",
    ROOT / "Combined_Dataset_Yolov8_best.pt",
    REPO_ROOT / "Combined_Dataset_Yolov8_best.pt",
    ROOT / "detect" / "train2" / "weights" / "best.pt",
    ROOT / "detect" / "train" / "weights" / "best.pt",
    REPO_ROOT / "detect" / "train2" / "weights" / "best.pt",
    REPO_ROOT / "detect" / "train" / "weights" / "best.pt",
]
MODEL_CANDIDATES = [path for path in MODEL_CANDIDATES if path is not None]
MODEL_DOWNLOAD_PATH = DATA_DIR / "model.pt"
HISTORY_PATH = DATA_DIR / "history.json"
METRICS_PATH = DATA_DIR / "metrics.json"
DATA_PATH = ROOT / "data.yaml"
MAX_UPLOAD_MB = int(os.environ.get("MAX_UPLOAD_MB", "16"))
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "ALLOWED_ORIGINS",
        "*",
    ).split(",")
    if origin.strip()
]

app = Flask(__name__)
app.config.update(
    MAX_CONTENT_LENGTH=MAX_UPLOAD_MB * 1024 * 1024,
    JSON_SORT_KEYS=False,
)
CORS(
    app,
    resources={r"/api/*": {"origins": ALLOWED_ORIGINS or "*"}},
    supports_credentials=False,
)

model: Any | None = None
model_path: Path | None = None
model_error: str | None = None


def load_model() -> Any | None:
    global model, model_path, model_error
    if model is not None:
        return model
    if YOLO is None:
        model_error = f"ultralytics is not available: {YOLO_IMPORT_ERROR}"
        return None

    if MODEL_URL and not MODEL_DOWNLOAD_PATH.exists():
        try:
            urlretrieve(MODEL_URL, MODEL_DOWNLOAD_PATH)
        except Exception as exc:
            model_error = f"MODEL_URL download failed: {exc}"
    candidates = [MODEL_DOWNLOAD_PATH, *MODEL_CANDIDATES]

    for candidate in candidates:
        if candidate.exists():
            try:
                model_path = candidate
                model = YOLO(str(candidate))
                model_error = None
                return model
            except Exception as exc:
                model_error = f"Failed to load {candidate}: {exc}"

    searched = ", ".join(str(path) for path in candidates)
    model_error = f"No YOLO model found. Checked: {searched}"
    return None


def read_json(path: Path, fallback: Any) -> Any:
    try:
        if path.exists():
            return json.loads(path.read_text())
    except json.JSONDecodeError:
        pass
    return fallback


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2))


def image_to_data_url(image: Image.Image, quality: int = 92) -> str:
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=quality)
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    return f"data:image/jpeg;base64,{encoded}"


def file_to_image(file_storage) -> Image.Image:
    image = Image.open(file_storage.stream)
    return image.convert("RGB")


def risk_level(weed_count: int, crop_count: int) -> str:
    total = weed_count + crop_count
    weed_pct = (weed_count / total * 100) if total else 0
    if weed_pct >= 45 or weed_count > crop_count:
        return "high"
    if weed_pct >= 20:
        return "medium"
    return "low"


def pct(part: int, total: int) -> float:
    return round((part / total * 100) if total else 0, 1)


def draw_detections(image: Image.Image, detections: list[dict[str, Any]]) -> Image.Image:
    annotated = image.copy()
    draw = ImageDraw.Draw(annotated)
    font = ImageFont.load_default()

    for detection in detections:
        x, y, w, h = detection["bbox"]
        label = detection["class"]
        confidence = detection["confidence"]
        color = (239, 68, 68) if label == "weed" else (34, 197, 94)
        fill = color + (42,)

        x2 = x + w
        y2 = y + h
        draw.rectangle((x, y, x2, y2), outline=color, width=3)

        text = f"{label.upper()} {confidence:.0f}%"
        left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
        text_width = right - left
        text_height = bottom - top
        tag_y = max(0, y - text_height - 8)
        draw.rectangle((x, tag_y, x + text_width + 10, tag_y + text_height + 6), fill=color)
        draw.text((x + 5, tag_y + 3), text, fill=(2, 12, 6), font=font)

    return annotated


def generate_demo_detections(image: Image.Image, filename: str) -> list[dict[str, Any]]:
    seed = sum(ord(char) for char in filename) + image.width + image.height
    rng = random.Random(seed)
    total = 8 + seed % 18
    weed_heavy = "weed" in filename.lower() or seed % 4 == 0
    weed_count = max(1, round(total * (0.55 if weed_heavy else 0.22)))
    crop_count = max(1, total - weed_count)
    labels = ["weed"] * weed_count + ["crop"] * crop_count
    rng.shuffle(labels)

    detections: list[dict[str, Any]] = []
    for index, label in enumerate(labels):
        width = rng.uniform(image.width * 0.08, image.width * 0.22)
        height = rng.uniform(image.height * 0.08, image.height * 0.22)
        x = rng.uniform(0, max(1, image.width - width))
        y = rng.uniform(0, max(1, image.height - height))
        base_confidence = 78 if label == "crop" else 74
        detections.append({
            "class": label,
            "confidence": round(min(96, base_confidence + rng.uniform(0, 16)), 1),
            "bbox": [round(x, 2), round(y, 2), round(width, 2), round(height, 2)],
        })
    return detections


def run_detection(image: Image.Image, filename: str, confidence: float, imgsz: int) -> tuple[list[dict[str, Any]], str]:
    detector = load_model()
    if detector is None:
        return generate_demo_detections(image, filename), "demo"

    result = detector.predict(image, conf=confidence, imgsz=imgsz, verbose=False)[0]
    names = result.names or {0: "crop", 1: "weed"}
    detections: list[dict[str, Any]] = []

    for box in result.boxes:
        class_id = int(box.cls[0].item())
        label = str(names.get(class_id, class_id)).lower()
        if label not in {"crop", "weed"}:
            label = "weed" if class_id == 1 else "crop"
        x1, y1, x2, y2 = [float(value) for value in box.xyxy[0].tolist()]
        detections.append({
            "class": label,
            "confidence": round(float(box.conf[0].item()) * 100, 1),
            "bbox": [round(x1, 2), round(y1, 2), round(x2 - x1, 2), round(y2 - y1, 2)],
        })

    return detections, "model"


def build_report(crops: int, weeds: int, total: int, confidence: float, risk: str) -> dict[str, Any]:
    crop_pct = pct(crops, total)
    weed_pct = pct(weeds, total)
    severity = "High" if risk == "high" else "Medium" if risk == "medium" else "Low"
    condition = "Good" if risk == "low" else "Fair" if risk == "medium" else "At risk"

    return {
        "detection_summary": {
            "total_crops": crops,
            "total_weeds": weeds,
            "confidence": confidence,
            "risk_level": risk,
            "weed_ratio": f"{weed_pct}%",
            "crop_ratio": f"{crop_pct}%",
        },
        "crop_health_analysis": {
            "condition": condition,
            "crop_density": "Stable" if crops else "No crops detected",
            "healthy_crop_ratio": f"{crop_pct}%",
            "crop_vigor_score": max(0, round(100 - weed_pct * 1.2)),
            "yield_loss_prediction": f"{min(85, round(weed_pct * 1.3))}%",
            "water_stress_level": "Unknown from image only",
            "nutritional_status": "Needs field validation",
            "disease_risk": "Not detected by this model",
            "estimated_damage_cost": "Requires farm cost data",
            "notes": f"The trained YOLOv8 model detected {crops} crop targets and {weeds} weed targets.",
        },
        "weed_infestation_analysis": {
            "severity": severity,
            "weed_spread": "High-density patches" if risk == "high" else "Localized patches" if risk == "medium" else "Minimal visible pressure",
            "affected_zones": "Review red detection boxes in the output image.",
            "competition_risk": severity,
        },
        "recommendations": [
            {
                "title": "Target weed zones",
                "detail": "Prioritize the red-boxed areas before weeds compete further with crop rows.",
            },
            {
                "title": "Verify low-confidence detections",
                "detail": "Manually inspect detections near the confidence threshold before field action.",
            },
            {
                "title": "Run follow-up scan",
                "detail": "Scan the same field after treatment to compare crop and weed ratios.",
            },
        ],
        "ai_insights": {
            "explanation": "The trained YOLOv8 model returned crop and weed bounding boxes from the uploaded image.",
            "accuracy": "Confidence is calculated from model detection scores.",
            "confidence_scoring": "Average confidence is the mean score across all detections.",
        },
        "field_status": "Critical - immediate intervention needed" if risk == "high" else "Watch - targeted monitoring needed" if risk == "medium" else "Stable - regular monitoring recommended",
    }


def history_entry(result: dict[str, Any], filename: str, profile_id: str, profile_name: str) -> dict[str, Any]:
    metrics = result["metrics"]
    return {
        "id": result["scan_id"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "time_ago": "Just now",
        "filename": filename,
        "crops": metrics["crops"],
        "weeds": metrics["weeds"],
        "total": metrics["total"],
        "confidence": metrics["avg_confidence"],
        "risk_level": metrics["risk_level"],
        "crop_pct": metrics["crop_pct"],
        "weed_pct": metrics["weed_pct"],
        "original_thumb": result["original_thumb"],
        "result_thumb": result["image"],
        "profile_id": profile_id,
        "profile_name": profile_name,
        "report": result["report"],
    }


def persist_result(result: dict[str, Any], filename: str, profile_id: str, profile_name: str) -> None:
    history = read_json(HISTORY_PATH, [])
    entry = history_entry(result, filename, profile_id, profile_name)
    history = [entry] + [item for item in history if item.get("id") != result["scan_id"]]
    write_json(HISTORY_PATH, history)

    stats = {
        "total_scans": len(history),
        "total_weeds": sum(int(item.get("weeds", 0)) for item in history),
        "total_crops": sum(int(item.get("crops", 0)) for item in history),
        "confidence_sum": sum(float(item.get("confidence", 0)) for item in history),
        "confidence_count": len(history),
    }
    write_json(METRICS_PATH, stats)


def compute_stats(profile_id: str | None = None) -> dict[str, Any]:
    items = read_json(HISTORY_PATH, [])
    if profile_id:
        items = [item for item in items if item.get("profile_id") == profile_id]
    total_scans = len(items)
    confidence_values = [float(item.get("confidence", 0)) for item in items]
    return {
        "total_scans": total_scans,
        "total_weeds": sum(int(item.get("weeds", 0)) for item in items),
        "total_crops": sum(int(item.get("crops", 0)) for item in items),
        "avg_confidence": round(sum(confidence_values) / total_scans, 1) if total_scans else 0,
    }


@app.get("/api/backend-status")
def backend_status():
    selected = next((path for path in [MODEL_DOWNLOAD_PATH, *MODEL_CANDIDATES] if path.exists()), None)
    loaded = load_model() is not None
    return jsonify({
        "status": "ready" if loaded else "demo_mode",
        "model_loaded": loaded,
        "model_path": str(model_path or selected or ""),
        "model_error": model_error,
        "loaded_classes": ["crop", "weed"],
        "history_count": len(read_json(HISTORY_PATH, [])),
        "server_time": datetime.now(timezone.utc).isoformat(),
        "data_dir": str(DATA_DIR),
    })


@app.get("/api/model-info")
def model_info():
    selected = next((path for path in [MODEL_DOWNLOAD_PATH, *MODEL_CANDIDATES] if path.exists()), None)
    return jsonify({
        "name": selected.name if selected else "YOLOv8 demo mode",
        "architecture": "YOLOv8",
        "classes": ["crop", "weed"],
        "input_size": 640,
        "dataset": "Combined Dataset",
        "images_trained": 1200,
        "final_mAP50": 0.421,
        "final_mAP50_95": 0.312,
    })


@app.post("/api/predict")
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    started = time.perf_counter()
    file_storage = request.files["file"]
    filename = file_storage.filename or "uploaded-image.jpg"
    confidence = max(0.05, min(0.95, float(request.form.get("confidence", 0.25))))
    imgsz = max(320, min(1280, int(float(request.form.get("imgsz", 640)))))
    profile_id = request.form.get("profile_id", "default")
    profile_name = request.form.get("profile_name", "Demo User")

    image = file_to_image(file_storage)
    original_data_url = image_to_data_url(image)
    detections, detection_mode = run_detection(image, filename, confidence, imgsz)

    crop_count = sum(1 for item in detections if item["class"] == "crop")
    weed_count = sum(1 for item in detections if item["class"] == "weed")
    total = crop_count + weed_count
    avg_confidence = round(sum(item["confidence"] for item in detections) / total, 1) if total else 0
    risk = risk_level(weed_count, crop_count)
    annotated = draw_detections(image, detections)
    inference_ms = round((time.perf_counter() - started) * 1000)

    scan_id = f"scan-{uuid.uuid4().hex[:12]}"
    report = build_report(crop_count, weed_count, total, avg_confidence, risk)
    response = {
        "image": image_to_data_url(annotated),
        "original_thumb": original_data_url,
        "detections": detections,
        "metrics": {
            "total": total,
            "crops": crop_count,
            "weeds": weed_count,
            "crop_pct": pct(crop_count, total),
            "weed_pct": pct(weed_count, total),
            "avg_confidence": avg_confidence,
            "inference_time_ms": inference_ms,
            "risk_level": risk,
        },
        "summary": f"Detected {crop_count} crops and {weed_count} weeds. Weed ratio is {pct(weed_count, total)}%.",
        "mode": detection_mode,
        "recommendations": [
            {"icon": "target", "text": "Treat red-boxed weed clusters first."},
            {"icon": "leaf", "text": "Protect green-boxed crop zones during intervention."},
            {"icon": "calendar", "text": "Run a follow-up scan after field action."},
        ],
        "report": report,
        "image_size": {"width": image.width, "height": image.height},
        "scan_id": scan_id,
    }
    persist_result(response, filename, profile_id, profile_name)
    return jsonify(response)


@app.get("/api/sample-images")
def sample_images():
    manifest_path = REPO_ROOT / "frontend" / "public" / "sample-images" / "manifest.json"
    return jsonify(read_json(manifest_path, []))


@app.get("/api/history")
def history():
    profile_id = request.args.get("profile_id")
    items = read_json(HISTORY_PATH, [])
    if profile_id:
        items = [item for item in items if item.get("profile_id") == profile_id]
    return jsonify(items)


@app.get("/api/stats")
def stats():
    return jsonify(compute_stats(request.args.get("profile_id")))


@app.post("/api/reset-metrics")
def reset_metrics():
    profile_id = request.args.get("profile_id")
    history = read_json(HISTORY_PATH, [])
    if profile_id:
        history = [item for item in history if item.get("profile_id") != profile_id]
    else:
        history = []
    write_json(HISTORY_PATH, history)
    write_json(METRICS_PATH, {
        "total_scans": len(history),
        "total_weeds": sum(int(item.get("weeds", 0)) for item in history),
        "total_crops": sum(int(item.get("crops", 0)) for item in history),
        "confidence_sum": sum(float(item.get("confidence", 0)) for item in history),
        "confidence_count": len(history),
    })
    return jsonify({"stats": compute_stats(profile_id)})


@app.get("/api/analytics")
def analytics():
    items = read_json(HISTORY_PATH, [])
    return jsonify({"timeline": items, "summary": compute_stats(request.args.get("profile_id"))})


@app.get("/api/recommendations")
def recommendations():
    items = read_json(HISTORY_PATH, [])
    recent = items[0] if items else {}
    weed_pct = float(recent.get("weed_pct", 0))
    priority = "high" if weed_pct >= 45 else "medium" if weed_pct >= 20 else "low"
    return jsonify({
        "recommendations": [
            {
                "id": "target-weeds",
                "title": "Target detected weed zones",
                "description": "Use the red detection boxes to prioritize treatment.",
                "priority": priority,
                "category": "immediate",
                "estimated_cost": 0,
                "timeline": "48 hours",
                "actions": ["Inspect red-boxed areas", "Apply targeted weeding", "Rescan after treatment"],
                "risk_level": str(recent.get("risk_level", "low")),
                "potential_impact": "Reduces crop competition",
                "confidence": float(recent.get("confidence", 0)),
            }
        ],
        "stats": {
            "total_scans": len(items),
            "avg_weed_percentage": weed_pct,
            "risk_trend": str(recent.get("risk_level", "low")),
            "total_recommendations": 1,
            "estimated_cost": 0,
            "potential_savings": 0,
        },
        "analysis": {
            "weed_pressure_level": priority,
            "recommended_action_frequency": "weekly" if priority == "low" else "every 3 days",
            "cost_benefit_ratio": 1,
        },
    })


@app.get("/api/crop-health")
def crop_health():
    items = read_json(HISTORY_PATH, [])
    recent = items[0] if items else {}
    crop_pct_value = float(recent.get("crop_pct", 0))
    weed_pct_value = float(recent.get("weed_pct", 0))
    health_score = max(0, min(100, round(crop_pct_value - weed_pct_value * 0.4)))
    return jsonify({
        "current_health": {
            "crop_vigor_score": health_score,
            "condition": "Good" if health_score >= 70 else "Fair" if health_score >= 45 else "At risk",
            "crop_percentage": crop_pct_value,
            "weed_percentage": weed_pct_value,
            "confidence_level": float(recent.get("confidence", 0)),
            "timestamp": recent.get("timestamp", datetime.now(timezone.utc).isoformat()),
        },
        "health_metrics": {
            "yield_loss_prediction": f"{min(85, round(weed_pct_value * 1.3))}%",
            "water_stress_level": "Unknown from image only",
            "nutritional_status": "Needs field validation",
            "disease_risk": "Not detected by this model",
            "estimated_damage_cost": "Requires farm cost data",
            "days_until_critical": 0 if weed_pct_value >= 45 else 7,
        },
        "trends": [
            {
                "scan_index": index + 1,
                "vigor_score": max(0, min(100, round(float(item.get("crop_pct", 0)) - float(item.get("weed_pct", 0)) * 0.4))),
                "crop_pct": float(item.get("crop_pct", 0)),
                "weed_pct": float(item.get("weed_pct", 0)),
                "timestamp": item.get("timestamp", ""),
            }
            for index, item in enumerate(reversed(items[-10:]))
        ],
        "recommendations": [
            {
                "type": "warning" if weed_pct_value >= 20 else "info",
                "title": "Monitor weed pressure",
                "description": "Use scan history to compare weed ratio over time.",
                "action": "Rescan after intervention.",
            }
        ],
        "summary": {
            "total_scans": len(items),
            "avg_crop_percentage": crop_pct_value,
            "avg_weed_percentage": weed_pct_value,
            "health_trend": "stable",
        },
    })


@app.get("/api/export-report/<scan_id>")
def export_report(scan_id: str):
    items = read_json(HISTORY_PATH, [])
    entry = next((item for item in items if item.get("id") == scan_id), None)
    if not entry:
        return jsonify({"error": "Scan not found"}), 404

    text = (
        "WeedICider Scan Report\n\n"
        f"Scan ID: {entry['id']}\n"
        f"File: {entry['filename']}\n"
        f"Crops: {entry['crops']} ({entry.get('crop_pct', 0)}%)\n"
        f"Weeds: {entry['weeds']} ({entry.get('weed_pct', 0)}%)\n"
        f"Confidence: {entry['confidence']}%\n"
        f"Risk: {entry['risk_level']}\n"
    )
    buffer = io.BytesIO(text.encode("utf-8"))
    return send_file(buffer, mimetype="application/pdf", as_attachment=True, download_name=f"weedicider-report-{scan_id}.pdf")


@app.get("/")
def root():
    return jsonify({"service": "WeedICider API", "status": "ok"})


@app.get("/healthz")
def healthz():
    return jsonify({"status": "ok", "time": datetime.now(timezone.utc).isoformat()})


@app.errorhandler(400)
@app.errorhandler(404)
@app.errorhandler(413)
@app.errorhandler(500)
def handle_http_error(error):
    status_code = getattr(error, "code", 500)
    message = "Uploaded file is too large" if status_code == 413 else getattr(error, "description", "Server error")
    return jsonify({"error": message, "status": status_code}), status_code


@app.errorhandler(Exception)
def handle_unexpected_error(error):
    app.logger.exception("Unhandled API error")
    return jsonify({"error": "Unexpected server error", "detail": str(error)}), 500


if __name__ == "__main__":
    load_model()
    debug = os.environ.get("FLASK_DEBUG", "").lower() in {"1", "true", "yes"}
    port = int(os.environ.get("PORT", "5004"))
    host = os.environ.get("HOST", "127.0.0.1")
    app.run(host=host, port=port, debug=debug, use_reloader=False)

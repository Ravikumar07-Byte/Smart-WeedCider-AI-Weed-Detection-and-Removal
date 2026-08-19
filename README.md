
# SMART WEED DETECTION AND REMOVAL SYSTEM

AI-Powered Weed Detection and Removal System using YOLOv8, Computer Vision, and Smart Agriculture Technologies.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-WeedICider.vercel.app-brightgreen)](https://weedicider.vercel.app)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-blue)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-Flask-orange)](https://flask.palletsprojects.com/)
[![AI](https://img.shields.io/badge/AI-YOLOv8-red)](https://docs.ultralytics.com/)
[![Deployment](https://img.shields.io/badge/Deployment-Vercel%20%2B%20Render-black)](https://vercel.com/)

---

## 🌱 Live Demo

### 🚀 Website

**Live Application:**  
https://weedicider.vercel.app

### 💻 GitHub Repository

https://github.com/Ravikumar07-Byte/Smart-WeedCider-AI-Weed-Detection-and-Removal

---

# Overview

**SMART WEED DETECTION AND REMOVAL SYSTEM** is an AI-based smart agriculture project developed to automatically identify weeds in agricultural fields and support selective weed-removal operations.

The system combines:

- Artificial Intelligence
- Deep Learning
- Computer Vision
- Object Detection
- Web Technologies
- Smart Agriculture
- Embedded-System Concepts

Agricultural images can be uploaded through the web application or captured from a camera. The image is processed and analyzed using a trained **YOLOv8 object detection model**, which identifies crop and weed regions and generates:

- Bounding boxes
- Class labels
- Confidence scores
- Object coordinates
- Detection status
- Weed-removal decision status

The project was developed with a focus on agricultural conditions observed in banana cultivation environments.

The academic project work involved:

1. Dataset collection
2. Dataset preparation
3. Image annotation
4. Data augmentation
5. Model implementation
6. Model comparison
7. YOLOv8 training
8. Model testing
9. Web application integration
10. Weed-removal decision logic
11. Deployment
12. Performance evaluation

The final model selection was based on comparative experimentation between **YOLOv8** and **Faster R-CNN**.

YOLOv8 was selected because it provided better documented detection performance and faster inference suitable for real-time agricultural applications.

---

# Problem Statement

Weed infestation is a major challenge affecting agricultural productivity and crop quality.

Weeds compete with crops for essential resources such as:

- Water
- Nutrients
- Sunlight
- Soil moisture
- Cultivation space

This competition can reduce crop growth and agricultural yield.

Traditional weed-control methods mainly depend on:

- Manual weed removal
- Continuous human labour
- Chemical herbicide application
- Regular manual field monitoring

These methods can be:

- Time-consuming
- Labour-intensive
- Expensive
- Difficult to scale
- Potentially harmful to soil and surrounding ecosystems when chemicals are excessively used

Another important challenge is distinguishing weeds from crops when they have similar visual characteristics.

Detection can become difficult because of:

- Different lighting conditions
- Shadows
- Dense vegetation
- Overlapping plants
- Complex agricultural backgrounds
- Small weed objects
- Partial occlusion

Therefore, this project aims to develop an intelligent image-based system capable of distinguishing weeds from crops and supporting selective weed-removal operations while protecting healthy crops.

---

# Objectives

## Main Objective

To design and develop an intelligent weed detection and removal system using deep learning and computer vision techniques for accurate and real-time agricultural applications.

## Specific Objectives

1. Collect and prepare crop and weed image datasets for model training.
2. Annotate agricultural images using bounding boxes.
3. Apply preprocessing and augmentation techniques to improve dataset diversity.
4. Implement and evaluate deep learning models for weed detection.
5. Compare YOLOv8 and Faster R-CNN using standard object-detection metrics.
6. Select a suitable model based on accuracy and real-time performance.
7. Train the selected YOLOv8 model using transfer learning.
8. Detect crops and weeds and generate bounding boxes with positional information.
9. Develop a user-friendly web interface for agricultural monitoring.
10. Integrate the trained model with a web application.
11. Implement decision logic for selective weed-removal operations.
12. Reduce dependence on manual labour and excessive herbicide usage.
13. Support sustainable and precision-agriculture practices.

---

# Key Features

## 🤖 AI-Based Weed Detection

- YOLOv8-based object detection
- Crop and weed classification
- Bounding-box generation
- Confidence-score generation
- Object localization
- Image-based weed identification
- Real-time detection capability

## 🌾 Smart Agriculture

- Precision weed monitoring
- Selective weed-removal decision logic
- Crop-protection mechanism
- Reduced unnecessary weed-removal actions
- Reduced dependency on manual monitoring
- Support for sustainable farming

## 📷 Image and Video Processing

- Agricultural image upload
- Image preprocessing
- Video/webcam testing support
- Real-time detection capability
- Processed-image generation
- Sample-image testing

## 🖥️ Web Application

- Modern React-based frontend
- Dashboard
- Scan interface
- Detection-result visualization
- Detection history
- Recommendations
- Crop-health monitoring
- Project overview
- Responsive user interface
- Analytics and statistics
- Sample-image access

## ⚙️ Decision and Actuation Logic

The system uses confidence and spatial decision logic to determine whether weed-removal action should be initiated.

### Decision Scenarios

| Scenario | System Action |
|---|---|
| Only weeds detected | Activate removal mechanism |
| Weeds + crops detected | Selective action with safety buffer |
| Only crops detected | No action |
| No detection | Stop system / safety timeout |

### Confidence Rule

```text
If Confidence > Threshold
        ↓
Valid Detection

If Confidence ≤ Threshold
        ↓
Ignore Detection
````

The project report documents a safety buffer of approximately **±5 cm** for mixed crop-and-weed situations.

---

# System Architecture

The system is organized into three major operational sections:

1. Image Processing Module
2. Backend Processing Module
3. Output and Actuation Module

## Overall Workflow

```text
Agricultural Image / Camera
          │
          ▼
    Image Acquisition
          │
          ▼
      Frame Extraction
          │
          ▼
       Preprocessing
  Resize / Normalize / Enhance
          │
          ▼
       YOLOv8 Model
          │
          ▼
      Object Detection
          │
          ▼
 Bounding Boxes + Class Labels
      + Confidence Scores
          │
          ▼
   Post Processing / NMS
          │
          ▼
      Decision Logic
          │
          ├───────────────┐
          │               │
          ▼               ▼
      Weed Found       No Weed
          │               │
          ▼               ▼
   Actuation Decision   No Action
          │
          ▼
    Frontend Dashboard
          │
          ▼
 Results / Logs / Monitoring
```

---

# AI Model

## YOLOv8

The primary object-detection model used in the project is **YOLOv8**.

YOLOv8 is a modern one-stage object-detection architecture designed for fast and accurate object detection.

It performs object localization and classification within a single detection pipeline, making it suitable for real-time agricultural applications.

## YOLOv8 Working Process

1. Input agricultural image
2. Image resizing
3. Image normalization
4. Feature extraction
5. Multi-scale feature processing
6. Object detection
7. Bounding-box prediction
8. Class prediction
9. Confidence-score calculation
10. Post-processing
11. Final detection output

## YOLOv8 Output

The model produces:

* Bounding boxes
* Class labels
* Confidence scores
* Object coordinates

## Classes

The documented dataset uses two classes:

```text
Class 0 → Crop (Banana)
Class 1 → Weed
```

---

# Model Selection

Two object-detection models were implemented and evaluated:

## 1. YOLOv8

Advantages:

* One-stage detector
* Fast inference
* Suitable for real-time applications
* Lower computational complexity
* Suitable for embedded deployment
* Good balance between accuracy and speed

## 2. Faster R-CNN

Characteristics:

* Two-stage detector
* Region-based detection
* Higher computational requirements
* Slower inference compared with YOLOv8
* Less suitable for real-time embedded operation

## Comparative Results

The project report documents the following comparative results after 50 epochs:

| Metric                   |    YOLOv8 | Faster R-CNN |
| ------------------------ | --------: | -----------: |
| Precision                |     80.1% |      ~60–68% |
| Recall                   |     66.4% |      ~47–54% |
| mAP@50                   |     74.5% |         ~61% |
| mAP@50–95                |     50.6% |      ~32–39% |
| Inference Speed          | Very Fast |         Slow |
| Detection Type           | One-stage |    Two-stage |
| Real-Time Capability     | Supported |      Limited |
| Computational Complexity |     Lower |       Higher |
| Embedded Deployment      |  Suitable |    Difficult |

### Final Model

Based on the documented experiments:

**YOLOv8 was selected as the final weed-detection model.**

---

# YOLOv8 Training

The final YOLOv8 model was trained using transfer learning with pretrained weights.

## Training Configuration

| Parameter         | Value              |
| ----------------- | ------------------ |
| Model             | YOLOv8s            |
| Image Size        | 640 × 640          |
| Batch Size        | 16                 |
| Epochs            | 10 and 50          |
| Optimizer         | AdamW              |
| Learning Rate     | 0.001              |
| Momentum          | 0.9                |
| Weight Decay      | 0.0005             |
| Framework         | Ultralytics YOLOv8 |
| Training Platform | Google Colab       |
| GPU               | NVIDIA Tesla T4    |

---

# Optimizer Comparison

Different optimizers were evaluated during the model-development process.

| Optimizer | Precision | Recall | mAP@50 | Performance |
| --------- | --------: | -----: | -----: | ----------- |
| SGD       |      0.68 |   0.55 |   0.60 | Moderate    |
| Adam      |      0.74 |   0.61 |   0.69 | Better      |
| AdamW     |      0.80 |   0.66 |   0.74 | Best        |

Based on the documented comparison, **AdamW** was selected because it provided the best documented convergence and detection performance.

---

# Dataset

The project report documents a total of:

## **2,256 Agricultural Images**

The dataset was prepared for crop and weed detection in agricultural environments, with particular focus on banana cultivation.

## Dataset Sources

The dataset was prepared using:

* Agricultural images collected from Krishi Vigyan Kendra (KVK)
* Field data/images from Organic Research Station, Naganahalli, Mysuru
* Real-time images captured from banana crop fields
* Publicly available online agricultural resources

## Dataset Distribution

| Dataset    |    Images |
| ---------- | --------: |
| Training   |     1,579 |
| Validation |       451 |
| Testing    |       226 |
| **Total**  | **2,256** |

The project documents an approximate:

```text
70% Training
20% Validation
10% Testing
```

distribution.

---

# Dataset Scenarios

The dataset contains different agricultural conditions, including:

* Crop-only images
* Weed-only images
* Mixed crop-and-weed images

These scenarios help evaluate the model under different detection conditions.

---

# Dataset Annotation

Images were annotated using tools such as:

* Roboflow
* LabelImg

Bounding boxes were created around crop and weed objects.

## Class IDs

```text
Crop (Banana) → Class ID 0
Weed          → Class ID 1
```

## Documented Annotation Counts

| Dataset    | Annotations |
| ---------- | ----------: |
| Training   |       4,608 |
| Validation |       1,292 |
| Testing    |         584 |

## Documented Class Distribution

| Class | Instances |
| ----- | --------: |
| Crop  |     1,669 |
| Weed  |     2,939 |

---

# Data Augmentation

Data augmentation was used to improve model robustness and generalization.

Documented techniques include:

* Horizontal flipping
* Brightness adjustment
* Image preprocessing
* Dataset transformation

Brightness adjustment was approximately **13–15%** in the documented training process.

These techniques help the model handle variations in:

* Lighting
* Orientation
* Field conditions
* Image appearance

---

# Major Weeds Considered

The academic report discusses weeds affecting banana cultivation, including:

### Commelina diffusa

Common name:

**Spreading Dayflower**

### Oxalis corniculata

Common name:

**Creeping Woodsorrel**

### Cyperus rotundus

Common name:

**Nut Sedge**

### Echinochloa crus-galli

Common name:

**Barnyard Grass**

### Setaria verticillata

Common name:

**Hooked Bristlegrass**

These weeds can compete with banana plants for:

* Nutrients
* Water
* Sunlight
* Soil moisture
* Growing space

---

# Test Cases

The system was evaluated using multiple agricultural scenarios.

---

## Test Case 1 — Only Weeds Detected

### Input

Agricultural image containing only weed plants.

### Expected Behavior

* Detect weed regions
* Generate bounding boxes
* Calculate confidence scores
* Activate removal mechanism
* Perform weed-removal decision

### Documented Result

* Weed regions detected successfully
* Bounding boxes generated
* Confidence scores included values such as 0.71, 0.73, and 0.84
* No crop class detected
* System decision:

```text
ACTIVATE
```

---

## Test Case 2 — Mixed Crops and Weeds

### Input

Agricultural image containing both crop and weed plants.

### Expected Behavior

* Detect crops and weeds separately
* Generate bounding boxes for both classes
* Apply spatial filtering
* Perform selective weed removal
* Protect healthy crop regions

### Documented Result

* Crop and weed objects detected separately
* Bounding boxes generated for both classes
* Spatial filtering applied
* System decision:

```text
ACTIVATE — Selective Mode
```

* Crop-protection mechanism maintained

---

## Test Case 3 — Only Crops Detected

### Input

Agricultural image containing only crop plants.

### Expected Behavior

* Detect crops
* Do not activate weed-removal mechanism
* Prevent cutting operation

### Documented Result

* Only crop class detected
* No weed regions identified
* System decision:

```text
STOP
```

* No actuator movement performed

This safety behavior prevents unnecessary operation near healthy crops.

---

# System Performance

The project report identifies the following system-level performance characteristics:

| Performance Parameter    | Observation                             |
| ------------------------ | --------------------------------------- |
| Detection Accuracy       | Accurate weed and crop detection        |
| Real-Time Performance    | Fast prediction for live monitoring     |
| Actuator Decision-Making | Activated based on weed detection       |
| Crop Protection          | Selective filtering protects crops      |
| Robustness               | Stable during testing                   |
| Embedded Deployment      | Suitable for Raspberry Pi / Jetson Nano |
| User Interface           | Smooth result visualization             |
| Scalability              | Extendable to multiple crops            |

The normalized confusion-matrix discussion in the project report indicates approximately:

* **81% correct crop identification**
* **67% correct weed detection**

Some missed weed detections were attributed to:

* Small weed objects
* Dense vegetation
* Illumination changes
* Complex backgrounds
* Occlusion

---

# Web Application

The project contains a web-based interface for interacting with the weed-detection system.

The academic implementation uses a frontend-backend architecture in which the frontend communicates with the detection service.

## Academic Application Architecture

```text
React.js / TypeScript Frontend
          │
          ▼
      Flask Backend
          │
          ▼
       YOLOv8 Engine
          │
          ▼
     OpenCV Processing
          │
          ▼
Detection Results / Visualization
```

## Current Production Architecture

The current GitHub repository additionally contains a production-oriented React/Vite frontend and Vercel serverless API routes.

```text
                 User
                  │
                  ▼
        React + TypeScript + Vite
                  │
                  ▼
          Vercel Deployment
                  │
          ┌───────┴────────┐
          │                │
          ▼                ▼
    React Frontend     /api Routes
                           │
                           ▼
                 Serverless Backend
                           │
                           ▼
                  Detection / Data APIs

Optional:

Frontend
    │
    ▼
External Render Flask API
    │
    ▼
YOLOv8 + OpenCV + PyTorch
```

The Flask backend is retained for full YOLO inference and optional Render-based deployment.

---

# Frontend

The current frontend uses:

* React.js
* TypeScript
* Vite
* Tailwind CSS
* JavaScript
* Framer Motion

The frontend is designed to provide a modern smart-agriculture monitoring interface.

---

# Frontend Pages

The current application contains major views including:

* Home
* Dashboard
* Scan
* Crop Health
* History
* Recommendations
* Project Overview
* Detection Results

## Dashboard

The dashboard provides an agricultural monitoring experience with:

* Detection statistics
* Field activity information
* System performance
* Visual analysis
* Recommendations
* Crop-health information

## Scan Page

The Scan interface allows users to work with agricultural images and detection operations.

## History

The History interface provides access to previous detection activity.

## Recommendations

The Recommendations page provides agricultural recommendations based on application data.

## Crop Health

The Crop Health interface provides crop-related monitoring information.

## Project Overview

The Project Overview section explains the Smart WeedCider system and its technology.

---

# Hardware Architecture

The project considers the following hardware components for physical weed-removal deployment.

## RGB Camera

Captures:

* Agricultural images
* Video streams
* Crop and weed scenes

## Raspberry Pi 4 / Jetson Nano

Can be used as embedded processing platforms for:

* Image processing
* Model inference
* Hardware communication
* Actuator control

## Servo Motor

Controls movement of the weed-removal mechanism.

## Motor Driver

The project discusses:

* L298N
* BTS7960

These motor drivers can control:

* Motor direction
* Motor operation
* Power delivery

## Mechanical Cutter / Actuator

Performs the physical weed-removal operation.

## Power Supply

Provides stable electrical power to system components.

> **Important:** Complete real-field hardware integration is not yet fully implemented. The academic report represents the weed-removal mechanism through decision/simulation logic, while complete robotic hardware integration is identified as future work.

---

# Technology Stack

| Category                    | Technologies                   |
| --------------------------- | ------------------------------ |
| Programming                 | Python, TypeScript, JavaScript |
| AI / Deep Learning          | YOLOv8, Faster R-CNN           |
| Deep Learning Framework     | PyTorch                        |
| Computer Vision             | OpenCV                         |
| Backend                     | Flask                          |
| Frontend                    | React.js, TypeScript           |
| Styling                     | Tailwind CSS                   |
| Build Tool                  | Vite                           |
| Animation                   | Framer Motion                  |
| Annotation                  | Roboflow, LabelImg             |
| Dataset Format              | YOLO, COCO JSON                |
| Training Platform           | Google Colab                   |
| GPU                         | NVIDIA Tesla T4                |
| Embedded Platforms          | Raspberry Pi 4, Jetson Nano    |
| Actuation                   | Servo Motor, L298N / BTS7960   |
| Frontend Deployment         | Vercel                         |
| Optional Backend Deployment | Render                         |

---

# Project Structure

The current repository is organized as follows:

```text
SMART-WEED-DETECTION-AND-REMOVAL/
│
├── api/
│   ├── analytics.js
│   ├── backend-status.js
│   ├── crop-health.js
│   ├── history.js
│   ├── model-info.js
│   ├── predict.js
│   ├── recommendations.js
│   ├── reset-metrics.js
│   ├── sample-images.js
│   ├── stats.js
│   └── export-report/
│       └── [scan_id].js
│
├── backend/
│   ├── app.py
│   ├── data.yaml
│   ├── model.pt
│   ├── requirements.txt
│   ├── railway.json
│   └── runtime.txt
│
├── frontend/
│   ├── public/
│   │   ├── sample-images/
│   │   └── application assets
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── hero/
│   │   │   ├── layout/
│   │   │   ├── results/
│   │   │   └── stats/
│   │   │
│   │   ├── pages/
│   │   │   ├── CropHealthPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── HistoryPage.tsx
│   │   │   ├── HomePage.tsx
│   │   │   ├── ProjectOverviewPage.tsx
│   │   │   ├── RecommendationsPage.tsx
│   │   │   └── ScanPage.tsx
│   │   │
│   │   ├── assets/
│   │   ├── App.tsx
│   │   ├── api.ts
│   │   ├── index.css
│   │   └── main.tsx
│   │
│   ├── scripts/
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── render.yaml
├── vercel.json
├── train.json
├── valid.json
├── test.json
├── .env.example
├── .gitignore
├── README.dataset.txt
├── README.roboflow.txt
└── README.md
```

---

# Local Development

## Backend

Open PowerShell or a terminal.

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv .venv
```

### Windows

```powershell
.venv\Scripts\activate
```

### Linux / macOS

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the Flask application:

```bash
python app.py
```

The academic project documents the local Flask application at:

```text
http://127.0.0.1:5000
```

---

# Frontend Development

Open another terminal.

```bash
cd frontend
```

Install dependencies:

```bash
npm ci
```

Run the Vite development server:

```bash
npm run dev
```

Vite normally provides a local URL similar to:

```text
http://127.0.0.1:5173
```

## Using the Local Flask API

If the frontend is configured to communicate with the local Flask backend:

```bash
VITE_API_BASE_URL=http://127.0.0.1:5000 npm run dev
```

On Windows PowerShell, you can also set the environment variable for the current session:

```powershell
$env:VITE_API_BASE_URL="http://127.0.0.1:5000"
npm run dev
```

---

# Production Deployment

## Vercel

The current repository is structured to support deployment of the React/Vite frontend and same-origin serverless API routes on Vercel.

The main deployment configuration is:

```text
vercel.json
```

### Typical Git Deployment Workflow

```bash
git add .
git commit -m "Update project"
git push origin main
```

The current live website is:

```text
https://weedicider.vercel.app
```

The deployed application uses same-origin API routes by default, so:

```text
VITE_API_BASE_URL
```

can be left blank when using the Vercel serverless API architecture.

---

# Vercel Build Configuration

The repository uses:

```text
vercel.json
```

The frontend build process is based on:

```bash
cd frontend && npm ci
cd frontend && npm run build
```

The frontend is built using Vite.

---

# Optional Render Backend

The repository also contains a Flask backend configuration for Render.

Render can be used when a dedicated backend service is required for full YOLO inference.

## Render Configuration

```text
Root Directory:
backend
```

### Build Command

```bash
pip install --upgrade pip && pip install -r requirements.txt
```

### Start Command

```bash
gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --threads 2 --timeout 120
```

### Health Check Path

```text
/healthz
```

## Render Environment Variables

```text
FLASK_DEBUG=0
DATA_DIR=/tmp/weedicider
MAX_UPLOAD_MB=16
ALLOWED_ORIGINS=*
MODEL_URL=
MODEL_PATH=
```

---

# Vercel Frontend with External Render Backend

If the frontend needs to communicate with an external Render backend, set:

```text
VITE_API_BASE_URL=https://your-render-service.onrender.com
```

The same repository can be imported into Vercel.

After both services are deployed, CORS can be tightened by changing:

```text
ALLOWED_ORIGINS=*
```

to the exact Vercel application URL.

---

# Current Production Architecture

By default, the current application is designed around:

```text
User
 │
 ▼
Vercel
 │
 ├── React/Vite Frontend
 │
 └── Serverless API Routes
```

Optional full inference architecture:

```text
User
 │
 ▼
Vercel React Frontend
 │
 ▼
Render Flask Backend
 │
 ▼
YOLOv8
 │
 ▼
OpenCV / PyTorch
 │
 ▼
Detection Result
```

---

# API Endpoints

The current repository contains Vercel serverless API routes under the `api/` directory.

| Endpoint                       | Purpose                             |
| ------------------------------ | ----------------------------------- |
| `/api/predict`                 | Prediction / weed-detection request |
| `/api/backend-status`          | Backend status                      |
| `/api/analytics`               | Analytics information               |
| `/api/crop-health`             | Crop-health information             |
| `/api/history`                 | Detection history                   |
| `/api/model-info`              | Model information                   |
| `/api/recommendations`         | Recommendations                     |
| `/api/sample-images`           | Sample image information            |
| `/api/stats`                   | Dashboard statistics                |
| `/api/reset-metrics`           | Reset application metrics           |
| `/api/export-report/[scan_id]` | Export scan report                  |

The exact request and response structures are defined in the corresponding JavaScript files inside the `api/` directory.

---

# Model Deployment

The academic project uses YOLOv8 for object detection.

The documented final training configuration is:

```text
Model: YOLOv8s
Image Size: 640 × 640
Batch Size: 16
Epochs: 50
Optimizer: AdamW
Learning Rate: 0.001
```

The academic report documents the trained model weights being saved as:

```text
best.pt
```

and references the integrated model:

```text
Combined_Dataset_Yolov8_best.pt
```

The current repository contains the deployed model under:

```text
backend/model.pt
```

For production deployment, model hosting and runtime limitations should be considered because YOLO model weights can be large.

If a dedicated backend environment cannot receive or serve the model directly, the model can be hosted externally and configured through:

```text
MODEL_URL
```

or:

```text
MODEL_PATH
```

---

# Model Deployment Note

The project supports two different deployment approaches.

## Approach 1 — Same-Origin Vercel Application

```text
React/Vite
   +
Vercel Serverless APIs
```

This is the current live application architecture.

## Approach 2 — Vercel + Render

```text
React/Vite
      │
      ▼
Vercel
      │
      ▼
Render Flask API
      │
      ▼
YOLOv8 Model
```

This approach is useful when full Python/YOLO inference is required on a dedicated backend.

---

# Detection and Decision Logic

The detection process follows:

```text
Input Image
     ↓
Preprocessing
     ↓
YOLOv8 Inference
     ↓
Bounding Boxes
     ↓
Class Labels
     ↓
Confidence Scores
     ↓
Confidence Filtering
     ↓
Spatial Safety Filtering
     ↓
Weed Decision
     ↓
Actuator Decision
```

## Confidence Filtering

Low-confidence detections are ignored according to the documented confidence-threshold rule.

```text
Confidence > Threshold
        ↓
Valid Detection

Confidence ≤ Threshold
        ↓
Ignore Detection
```

## Spatial Filtering

When crops and weeds are close to each other, the system applies a safety buffer before deciding on actuator movement.

This is intended to reduce accidental crop damage.

---

# Decision Logic

## Only Weed Detected

```text
Weed Detected
     ↓
Confidence Check
     ↓
Valid Weed
     ↓
ACTIVATE
```

## Crop + Weed Detected

```text
Crop + Weed
     ↓
Confidence Check
     ↓
Spatial Safety Check
     ↓
Safe Area
     ↓
Selective Removal
```

## Only Crop Detected

```text
Crop Detected
     ↓
No Weed
     ↓
STOP
```

## No Detection

```text
No Detection
     ↓
Safety Timeout
     ↓
STOP
```

---

# Output

The system generates or displays:

* Processed agricultural image
* Weed/crop detection status
* Bounding boxes
* Class labels
* Confidence scores
* Object coordinates
* Detection statistics
* System status
* Decision/actuation status
* Historical detection information
* Recommendations
* Crop-health information

---

# Safety and Crop Protection

Crop protection is an important part of the proposed system.

The documented logic is:

```text
WEED DETECTED
      │
      ▼
Check Confidence
      │
      ▼
Check Spatial Safety
      │
      ├── Safe → Selective Removal
      │
      └── Unsafe → No / Restricted Action
```

When only crops are detected, the actuator remains inactive.

This design aims to:

* Minimize unnecessary actuator operation
* Protect healthy crop regions
* Reduce accidental crop damage
* Enable selective weed management

---

# Results

The documented YOLOv8 results are:

| Metric    | Result |
| --------- | -----: |
| Precision |  80.1% |
| Recall    |  66.4% |
| mAP@50    |  74.5% |
| mAP@50–95 |  50.6% |

The model provided a suitable balance between:

* Detection accuracy
* Inference speed
* Computational complexity
* Real-time capability

YOLOv8 therefore became the selected model for the system.

---

# Limitations

The project has several limitations:

1. The system currently relies mainly on image-based detection.
2. Real-time soil and environmental sensor data are not currently incorporated.
3. Detection performance can decrease under extreme lighting conditions.
4. Heavy occlusion and dense vegetation can affect detection.
5. Early growth stages may make crops and weeds visually difficult to distinguish.
6. The dataset is focused on specific crop environments, particularly banana cultivation.
7. Performance on other crops may require additional training.
8. Complete physical hardware integration is not yet implemented in real-field conditions.
9. Real-world autonomous weed removal requires additional mechanical and safety validation.
10. Larger and more diverse datasets are required for broader deployment.

---

# Future Enhancements

## 1. Complete Hardware Integration

Integrate a complete servo-driven mechanical weed-removal mechanism using:

* Raspberry Pi
* Jetson Nano
* Servo motors
* Motor drivers
* Mechanical cutters

## 2. Real-Time Field Deployment

Deploy cameras on:

* Agricultural robots
* Tractors
* Autonomous vehicles

## 3. Dataset Expansion

Expand the dataset with:

* Multiple crop categories
* More weed species
* Seasonal variations
* Larger field datasets
* More environmental conditions

## 4. Advanced Detection Models

Future model comparisons can include:

* Mask R-CNN
* EfficientDet
* RetinaNet
* YOLOv9
* Other modern object-detection architectures

## 5. Environmental Robustness

Improve detection under:

* Low illumination
* Shadows
* Rain
* Fog
* Crop overlap
* Partial occlusion

## 6. Mobile and Web Enhancements

Future versions can include:

* Live monitoring
* Detection history
* Automated alerts
* Cloud storage
* Farmer notifications

## 7. IoT Integration

Integrate sensors for:

* Soil moisture
* Temperature
* Humidity
* Environmental conditions
* Crop health

## 8. Drone-Based Monitoring

Use drones for large-scale aerial weed monitoring.

## 9. Autonomous Weed Removal

Integrate:

* Robotic arms
* Automated sprayers
* AI navigation
* Autonomous field vehicles

---

# Sustainable Agriculture Impact

The proposed system supports precision agriculture by attempting to reduce unnecessary manual labour and excessive chemical weed-control practices.

Potential benefits include:

* Reduced manual monitoring
* Faster weed identification
* Targeted weed management
* Reduced unnecessary herbicide usage
* Better crop protection
* Improved field-monitoring efficiency
* Support for sustainable farming practices

The long-term goal is to provide an intelligent agricultural system capable of supporting farmers with timely and selective weed-management decisions.

---

# Academic Project Information

## Project Title

**SMART WEED DETECTION AND REMOVAL SYSTEM**

## Degree

Bachelor of Engineering in Computer Science and Engineering

## Institution

Sri Jayachamarajendra College of Engineering
JSS Science and Technology University
Mysuru, Karnataka, India

## Department

Department of Computer Science and Engineering

## Academic Year

2025–2026

## Project Guide

**Ms. Divya H N**
Assistant Professor
Department of Computer Science and Engineering
JSS STU, Mysuru

## Project Team

* Ravikumar S
* Rajasab B Maidur
* Mohammed Shakeeb
* Sumanth R

---

# Research and Documentation

The academic project documentation covers:

* Introduction
* Literature Review
* System Requirements and Analysis
* Tools and Technologies
* System Design
* System Implementation
* Dataset Collection
* Dataset Annotation
* Data Augmentation
* Model Selection
* YOLOv8
* Faster R-CNN
* Model Comparison
* Model Training
* Model Testing
* Web Application Integration
* Weed-Removal Decision Logic
* Deployment
* Results and Discussion
* Conclusion
* Future Enhancements

The project also references research and technical resources related to:

* Computer-vision-based weed detection
* Smart agriculture
* Deep learning
* YOLOv8
* Roboflow
* OpenCV
* Embedded agricultural systems

---

# References

The project report references major resources including:

1. Wu et al. (2021), *Review of weed detection methods based on computer vision*, Sensors, MDPI.
2. Qu and Su (2024), *Deep learning-based weed–crop recognition for smart agricultural equipment: A review*, Agronomy, MDPI.
3. Murad et al. (2023), *Weed detection using deep learning: A systematic literature review*, Sensors, MDPI.
4. Ultralytics YOLOv8 Documentation.
5. Roboflow agricultural datasets and annotation tools.
6. Kaggle agricultural and weed datasets.
7. LabelImg image-annotation tool.
8. OpenCV documentation.
9. Raspberry Pi documentation.
10. BTS7960 motor-driver technical documentation.
11. L298N motor-driver technical documentation.

---

# Project Status

## Completed

* [x] Agricultural problem identified
* [x] Dataset collected
* [x] Dataset annotated
* [x] Dataset augmented
* [x] Dataset divided into training, validation, and testing sets
* [x] YOLOv8 implemented
* [x] Faster R-CNN implemented for comparison
* [x] Model performance evaluated
* [x] AdamW selected for YOLOv8
* [x] YOLOv8 selected as final model
* [x] Web application developed
* [x] Detection-result visualization implemented
* [x] Decision logic implemented
* [x] Production-oriented React/Vite frontend implemented
* [x] Vercel deployment configured
* [x] Vercel serverless API routes implemented
* [x] Flask backend retained for full YOLO inference / optional deployment
* [x] GitHub repository created
* [x] Live website deployed

## Future Work

* [ ] Complete physical autonomous weed-removal hardware integration
* [ ] Large-scale multi-crop field deployment
* [ ] Expanded weed datasets
* [ ] IoT sensor integration
* [ ] Drone-based monitoring
* [ ] Autonomous agricultural robots
* [ ] Real-field mechanical validation

---

# Project Repository

The source code is publicly available on GitHub:

[https://github.com/Ravikumar07-Byte/Smart-WeedCider-AI-Weed-Detection-and-Removal](https://github.com/Ravikumar07-Byte/Smart-WeedCider-AI-Weed-Detection-and-Removal)

The repository contains:

```text
Frontend
   ↓
React + TypeScript + Vite

Backend
   ↓
Flask + Python

AI
   ↓
YOLOv8 + PyTorch + OpenCV

Deployment
   ↓
Vercel + Optional Render
```

---

# Live Application

## 🌱 SMART WEED DETECTION AND REMOVAL SYSTEM

### Website

[https://weedicider.vercel.app](https://weedicider.vercel.app)

The application provides a modern interface for exploring the Smart WeedCider system and its AI-powered agricultural weed-detection workflow.

---

# Quick Start

For a quick local setup:

## Backend

```bash
cd backend
python -m venv .venv
```

### Windows

```powershell
.venv\Scripts\activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Start Backend

```bash
python app.py
```

---

## Frontend

Open another terminal:

```bash
cd frontend
npm ci
npm run dev
```

Open the Vite URL:

```text
http://127.0.0.1:5173
```

---

# Git Deployment

After making changes:

```bash
git add .
git commit -m "Update project"
git push origin main
```

The Vercel deployment can then build the latest version of the application.

---

# Environment Configuration

The repository includes:

```text
.env.example
```

For optional Render deployment, environment variables may include:

```text
FLASK_DEBUG=0
DATA_DIR=/tmp/weedicider
MAX_UPLOAD_MB=16
ALLOWED_ORIGINS=*
MODEL_URL=
MODEL_PATH=
```

For an external Render backend:

```text
VITE_API_BASE_URL=https://your-render-service.onrender.com
```

For the same-origin Vercel architecture, `VITE_API_BASE_URL` can remain unset.

---

# Deployment Health Check

The current Vercel deployment provides the following backend-status endpoint:

```text
https://weedicider.vercel.app/api/backend-status
```

This endpoint can be used to check the status of the deployed application backend/API layer.

---

# Architecture Summary

```text
                   SMART WEEDCIDER
                         │
                         ▼
              Agricultural Image
                         │
                         ▼
                Image Processing
                         │
                         ▼
                    YOLOv8
                         │
             ┌───────────┴───────────┐
             │                       │
          Crop                    Weed
             │                       │
             └───────────┬───────────┘
                         │
                         ▼
                 Confidence Check
                         │
                         ▼
                 Spatial Safety Check
                         │
              ┌──────────┴──────────┐
              │                     │
           Safe Area             Unsafe Area
              │                     │
              ▼                     ▼
     Selective Removal          No Action
              │
              ▼
        Result Visualization
              │
              ▼
        Web Dashboard / Logs
```

---

# Why YOLOv8?

YOLOv8 was selected because the documented experiments demonstrated a strong balance between accuracy and speed.

The model achieved:

```text
Precision     → 80.1%
Recall        → 66.4%
mAP@50        → 74.5%
mAP@50–95     → 50.6%
```

YOLOv8 also provides:

* Fast inference
* Real-time capability
* Efficient object detection
* Lower computational requirements compared with two-stage detectors
* Potential suitability for embedded agricultural systems

---

# Why Smart Weed Removal?

Traditional weed removal treats large field areas uniformly.

The proposed system instead aims to identify weed locations individually and make a selective decision.

```text
Traditional Approach
        ↓
Manual / Broad Chemical Treatment
        ↓
Higher Labour / Chemical Usage

Smart WeedCider
        ↓
AI-Based Detection
        ↓
Identify Weed
        ↓
Locate Weed
        ↓
Check Crop Safety
        ↓
Selective Action
```

This approach supports the principles of precision agriculture.

---

# Important Project Scope

The current project should be understood as an **AI-powered weed detection and decision-support system with a proposed selective weed-removal mechanism**.

The academic project demonstrates:

* AI-based detection
* Crop/weed classification
* Bounding-box localization
* Confidence-based filtering
* Spatial safety logic
* Web application integration
* Decision/actuation logic

Complete autonomous physical field deployment remains a future enhancement requiring additional:

* Hardware integration
* Mechanical validation
* Safety testing
* Field testing
* Environmental robustness testing

---

# Conclusion

The **SMART WEED DETECTION AND REMOVAL SYSTEM** demonstrates how artificial intelligence, deep learning, computer vision, web technologies, and embedded-system concepts can be combined to address a practical agricultural problem.

The experimental study showed that **YOLOv8 outperformed Faster R-CNN** in the documented comparison, achieving higher precision, recall, mAP values, and faster inference.

The selected YOLOv8 model was integrated into a web-based detection workflow capable of identifying crops and weeds and supporting selective weed-removal decisions.

The project provides a foundation for future development toward:

* Autonomous agricultural robots
* IoT-enabled farming
* Drone-based monitoring
* Cloud analytics
* Real-time field deployment
* Multi-crop weed detection
* Robotic weed removal

The long-term objective is to contribute toward smarter, safer, and more sustainable precision agriculture.

---

# 🌱 SMART WEED DETECTION AND REMOVAL SYSTEM

### AI for Sustainable and Precision Agriculture

**Live Website:**
[https://weedicider.vercel.app](https://weedicider.vercel.app)

**GitHub Repository:**
[https://github.com/Ravikumar07-Byte/Smart-WeedCider-AI-Weed-Detection-and-Removal](https://github.com/Ravikumar07-Byte/Smart-WeedCider-AI-Weed-Detection-and-Removal)

---

## 👨‍💻 Author

Developed as a Bachelor of Engineering major project in Computer Science and Engineering at JSS Science and Technology University, Mysuru.

### Project Team

* **Ravikumar S**
* **Rajasab B Maidur**
* **Mohammed Shakeeb**
* **Sumanth R**

---

**SMART WEED DETECTION AND REMOVAL SYSTEM — AI for Sustainable and Precision Agriculture.** 🚜🌱

````

### After pasting

Save the file with:

```text
README.md
````

Then from:

```text
C:\DOCUMENTS\Weedicider
```

run:

```powershell
git status
```

You should see:

```text
modified: README.md
```

Then:

```powershell
git add README.md
git commit -m "Update README with complete project documentation"
git push origin main
```

Then refresh your GitHub repository. Your **new detailed README will appear on the repository home page**, while your existing source code, `frontend`, `backend`, `api`, deployment files, and model remain untouched.

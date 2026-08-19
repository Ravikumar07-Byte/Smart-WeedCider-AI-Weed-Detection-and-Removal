import { ArrowRight, CheckCircle2, Flame, Image, Sparkles } from 'lucide-react'

type Metrics = {
  total: number
  crops: number
  weeds: number
  crop_pct: number
  weed_pct: number
  avg_confidence: number
  inference_time_ms: number
  risk_level: string
}

type Recommendation = {
  icon: string
  text: string
}

type ScanResult = {
  image: string
  original_thumb: string
  detections: Array<{ class: string; confidence: number; bbox: number[] }>
  metrics: Metrics
  summary: string
  recommendations: Recommendation[]
  scan_id: string
  image_size: { width: number; height: number }
}

type ResultPanelProps = {
  scanResult: ScanResult | null
  onRetry: () => void
  onClear: () => void
  onDownloadReport: () => void
}

export function ResultPanel({ scanResult, onRetry, onClear, onDownloadReport }: ResultPanelProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <article className="rounded-[28px] border border-white/[0.08] bg-black/60 p-6 shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Latest scan</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Real-time weed analysis</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onDownloadReport}
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/15"
            >
              Download report
            </button>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.06] px-4 py-2 text-sm text-white transition hover:bg-white/[0.1]"
            >
              <ArrowRight className="h-4 w-4" />
              New scan
            </button>
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-500/15"
            >
              Clear
            </button>
          </div>
        </div>

        {!scanResult ? (
          <div className="mt-10 grid gap-4 rounded-[24px] border border-dashed border-white/[0.08] bg-white/[0.03] p-6 text-zinc-400">
            <div className="flex items-center gap-3 text-sm">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Upload an image or use live detection to see crop and weed analysis here.
            </div>
            <p className="text-sm leading-relaxed">
              The backend model will return annotated images, confidence scores, risk level, and recommendations for each scan.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 lg:grid-cols-[1.5fr_0.85fr]">
              <div className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-black/60">
                <img
                  src={scanResult.image}
                  alt="Detection preview"
                  className="h-full w-full max-h-[420px] object-cover"
                />
              </div>
              <div className="rounded-[28px] border border-white/[0.08] bg-black/60 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Scan ID</p>
                    <p className="mt-2 text-lg font-semibold text-white">{scanResult.scan_id}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-200">{scanResult.metrics.risk_level}</span>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="rounded-3xl bg-white/[0.04] p-4">
                    <p className="text-sm text-zinc-400">Summary</p>
                    <p className="mt-2 text-base leading-relaxed text-white">{scanResult.summary}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl bg-white/[0.03] p-4">
                      <p className="text-sm text-zinc-400">Inference time</p>
                      <p className="mt-2 text-white">{scanResult.metrics.inference_time_ms} ms</p>
                    </div>
                    <div className="rounded-3xl bg-white/[0.03] p-4">
                      <p className="text-sm text-zinc-400">Detected objects</p>
                      <p className="mt-2 text-white">{scanResult.metrics.total}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
              <div className="rounded-[28px] border border-white/[0.08] bg-black/60 p-6">
                <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-zinc-500">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  Detections
                </div>
                <div className="mt-4 space-y-3">
                  {scanResult.detections.slice(0, 4).map((item, index) => (
                    <div key={`${item.class}-${index}`} className="flex items-center justify-between rounded-3xl bg-white/[0.04] px-4 py-3">
                      <div>
                        <p className="text-sm text-zinc-300">{item.class}</p>
                        <p className="mt-1 text-xs text-zinc-500">Confidence {item.confidence}%</p>
                      </div>
                      <div className="text-sm font-semibold text-white">{item.bbox[2] - item.bbox[0]}×{item.bbox[3] - item.bbox[1]}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[28px] border border-white/[0.08] bg-black/60 p-6">
                <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-zinc-500">
                  <Flame className="h-4 w-4 text-amber-400" />
                  Recommendations
                </div>
                <div className="mt-4 space-y-3">
                  {scanResult.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 rounded-3xl bg-white/[0.03] px-4 py-4">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/[0.05] text-lg text-white">{rec.icon}</span>
                      <p className="text-sm leading-relaxed text-zinc-300">{rec.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </article>

      <aside className="rounded-[28px] border border-white/[0.08] bg-black/60 p-6 shadow-[0_24px_64px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-zinc-500">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          Quick insights
        </div>
        <div className="mt-6 space-y-4">
          <div className="rounded-3xl bg-white/[0.03] p-4">
            <p className="text-sm text-zinc-400">Upload tip</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              Use a clean field image with visible crop rows. The model works best when the subject is sharply focused and evenly lit.
            </p>
          </div>
          <div className="rounded-3xl bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Image className="h-4 w-4 text-cyan-300" />
              <span>Original preview</span>
            </div>
            {scanResult ? (
              <img
                src={scanResult.original_thumb}
                alt="Original uploaded thumbnail"
                className="mt-3 h-28 w-full rounded-3xl object-cover"
              />
            ) : (
              <div className="mt-3 h-28 rounded-3xl bg-white/[0.04]" />
            )}
          </div>
        </div>
      </aside>
    </section>
  )
}

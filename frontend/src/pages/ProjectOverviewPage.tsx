import { motion } from 'framer-motion'
import { AlertTriangle, BrainCircuit, CheckCircle2, Database, FileText, FlaskConical, Layers3, Leaf, MonitorUp, ScanLine, ShieldAlert } from 'lucide-react'
import type { HistoryEntry, ModelInfo, Stats } from '../api'

type ProjectOverviewPageProps = {
  stats: Stats | null
  history: HistoryEntry[]
  modelInfo: ModelInfo | null
}

export function ProjectOverviewPage({ stats, history, modelInfo }: ProjectOverviewPageProps) {
  const latestScan = history[0]
  const overviewCards = [
    {
      icon: <Leaf size={22} />,
      title: 'Purpose',
      text: 'WeedICider detects crop and weed regions from field images, estimates weed pressure, and converts scan results into practical field guidance.',
    },
    {
      icon: <BrainCircuit size={22} />,
      title: 'AI Model',
      text: `${modelInfo?.architecture || 'YOLOv8'} object detection model trained for ${modelInfo?.classes?.join(' and ') || 'crop and weed'} classes.`,
    },
    {
      icon: <MonitorUp size={22} />,
      title: 'Dashboard',
      text: 'The React interface connects scan upload, detection output, history, recommendations, crop health, and model statistics in one workflow.',
    },
  ]

  const pipeline = [
    { title: 'Image Input', detail: 'User uploads a field image or selects a sample image from the history gallery.' },
    { title: 'Preprocessing', detail: 'The Flask backend reads the image, converts it for YOLO inference, and applies confidence/image-size settings.' },
    { title: 'Detection', detail: 'YOLO returns bounding boxes, confidence scores, and class labels for crop and weed targets.' },
    { title: 'Analysis', detail: 'The backend calculates crop percentage, weed percentage, risk level, crop vigor, and recommendation data.' },
    { title: 'Persistence', detail: 'Each scan is saved into history so dashboard, crop health, recommendations, and reports can stay synced.' },
  ]

  const accuracyNotes = [
    'Detection confidence is not the same as guaranteed correctness. It only shows how strongly the model matched a crop or weed pattern.',
    'Lighting, blur, distance, overlapping plants, soil color, and unusual weed shapes can reduce accuracy.',
    'Low-confidence detections should be checked manually before taking field action.',
    'The tool supports decision making, but final treatment decisions should still consider local agronomy advice and field inspection.',
  ]

  const technicalDetails = [
    {
      title: 'Training Data',
      detail: 'The model was trained on labeled crop and weed images using bounding boxes. These labels teach the network the visual difference between crop plants and weed growth.',
    },
    {
      title: 'Inference',
      detail: 'When a user uploads an image, the backend passes it through YOLOv8. The model returns class labels, bounding boxes, and confidence scores.',
    },
    {
      title: 'Post Processing',
      detail: 'The backend counts crops and weeds, calculates percentages, estimates risk level, and builds report sections like crop health, weed infestation, and recommendations.',
    },
    {
      title: 'Persistence',
      detail: 'Each scan result is stored in history.json so refreshes, reports, crop health, dashboard stats, and recommendations can reuse the same scan data.',
    },
  ]

  return (
    <div style={{ position: 'relative', height: '100%', overflowY: 'auto', padding: '32px 44px 32px 92px' }}>
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ display: 'grid', gap: 24 }}>
        <section className="glass glow-green-sm" style={{ padding: 30, borderRadius: 32 }}>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Project overview</p>
          <h1 style={{ margin: '10px 0 0', color: '#fff', fontSize: 34 }}>How WeedICider Works</h1>
          <p style={{ margin: '14px 0 0', color: '#cbd5e1', maxWidth: 880, lineHeight: 1.8 }}>
            This system combines a Flask backend, a YOLOv8 detection model, persisted scan history, and a React dashboard to detect weeds, evaluate field condition, and present farmer-ready recommendations. It is built as a practical AI-assisted farming tool, not as an automatic replacement for field judgment.
          </p>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {overviewCards.map((card) => (
            <div key={card.title} className="glass glow-green-sm" style={{ padding: 22, borderRadius: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#22c55e' }}>
                {card.icon}
                <h2 style={{ margin: 0, color: '#f8fafc', fontSize: 18 }}>{card.title}</h2>
              </div>
              <p style={{ margin: '12px 0 0', color: '#cbd5e1', lineHeight: 1.65, fontSize: 14 }}>{card.text}</p>
            </div>
          ))}
        </section>

        <section className="glass glow-green-sm" style={{ padding: 26, borderRadius: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <ScanLine size={24} color="#22c55e" />
            <h2 style={{ margin: 0, color: '#fff', fontSize: 24 }}>Detection Pipeline</h2>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {pipeline.map((step, index) => (
              <div key={step.title} style={{ display: 'grid', gridTemplateColumns: '42px 1fr', gap: 14, alignItems: 'start', padding: 14, borderRadius: 18, background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(34,197,94,0.1)' }}>
                <span style={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: 12, color: '#04160d', background: '#22c55e', fontWeight: 900 }}>{index + 1}</span>
                <div>
                  <p style={{ margin: 0, color: '#f8fafc', fontWeight: 800 }}>{step.title}</p>
                  <p style={{ margin: '6px 0 0', color: '#94a3b8', lineHeight: 1.6, fontSize: 13 }}>{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass glow-green-sm" style={{ padding: 26, borderRadius: 30, border: '1px solid rgba(245,158,11,0.28)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <ShieldAlert size={24} color="#f59e0b" />
            <div>
              <h2 style={{ margin: 0, color: '#fff', fontSize: 24 }}>Accuracy Awareness & Responsible Use</h2>
              <p style={{ margin: '6px 0 0', color: '#fcd34d', fontSize: 13 }}>Important note for users before relying on scan results.</p>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {accuracyNotes.map((note) => (
              <div key={note} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 14, borderRadius: 18, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.16)' }}>
                <AlertTriangle size={18} color="#f59e0b" style={{ flex: '0 0 auto', marginTop: 2 }} />
                <p style={{ margin: 0, color: '#fde68a', lineHeight: 1.65, fontSize: 14 }}>{note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass glow-green-sm" style={{ padding: 26, borderRadius: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <BrainCircuit size={24} color="#22c55e" />
            <h2 style={{ margin: 0, color: '#fff', fontSize: 24 }}>Detailed Technical Explanation</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            {technicalDetails.map((item) => (
              <div key={item.title} style={{ padding: 18, borderRadius: 20, background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(34,197,94,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <CheckCircle2 size={18} color="#22c55e" />
                  <h3 style={{ margin: 0, color: '#f8fafc', fontSize: 16 }}>{item.title}</h3>
                </div>
                <p style={{ margin: '10px 0 0', color: '#cbd5e1', lineHeight: 1.65, fontSize: 14 }}>{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass glow-green-sm" style={{ padding: 26, borderRadius: 30 }}>
          <h2 style={{ margin: 0, color: '#fff', fontSize: 24 }}>What Each Page Does</h2>
          <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
            <PageRole title="Home" text="Entry screen with upload and live detection controls. It introduces the AI weed detection workflow." />
            <PageRole title="Detection" text="Main scan workspace. It accepts images, sends them to the backend, displays results, and enables report download." />
            <PageRole title="Dashboard" text="Shows model and scan statistics such as total scans, crop counts, weed counts, and average confidence." />
            <PageRole title="History" text="Lists saved scans from history.json, including images, confidence, crop/weed counts, and timestamps." />
            <PageRole title="Recommendations" text="Converts scan history and weed pressure into suggested farming actions and priorities." />
            <PageRole title="Crop Health" text="Uses latest scan data and history trends to estimate crop vigor, weed pressure, stress, and intervention urgency." />
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <InfoPanel icon={<FlaskConical size={21} />} title="Backend">
            Flask serves prediction, history, analytics, crop-health, recommendations, sample images, model info, and PDF report endpoints.
          </InfoPanel>
          <InfoPanel icon={<Database size={21} />} title="Data Layer">
            Scan records are persisted in `history.json`, then reused by history, dashboard, crop health, recommendations, and exports.
          </InfoPanel>
          <InfoPanel icon={<Layers3 size={21} />} title="Frontend">
            React + Vite render the command dashboard, upload workflow, animated detection preview, and analysis pages.
          </InfoPanel>
          <InfoPanel icon={<FileText size={21} />} title="Reports">
            Each scan produces a structured summary with detection counts, risk level, crop health notes, weed analysis, and actions.
          </InfoPanel>
        </section>

        <section className="glass glow-green-sm" style={{ padding: 24, borderRadius: 28 }}>
          <h2 style={{ margin: 0, color: '#fff', fontSize: 22 }}>Current Project Status</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 18 }}>
            <StatusMetric label="Total scans" value={String(stats?.total_scans ?? history.length)} />
            <StatusMetric label="Total crops" value={String(stats?.total_crops ?? 0)} />
            <StatusMetric label="Total weeds" value={String(stats?.total_weeds ?? 0)} />
            <StatusMetric label="Avg confidence" value={`${stats?.avg_confidence ?? 0}%`} />
            <StatusMetric label="Model" value={modelInfo?.name || 'YOLOv8'} />
            <StatusMetric label="Latest scan" value={latestScan?.time_ago || 'No scans yet'} />
          </div>
        </section>
      </motion.div>
    </div>
  )
}

function InfoPanel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="glass glow-green-sm" style={{ padding: 22, borderRadius: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#22c55e' }}>
        {icon}
        <h3 style={{ margin: 0, color: '#f8fafc', fontSize: 17 }}>{title}</h3>
      </div>
      <p style={{ margin: '12px 0 0', color: '#cbd5e1', lineHeight: 1.65, fontSize: 14 }}>{children}</p>
    </div>
  )
}

function StatusMetric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: 16, borderRadius: 18, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
      <p style={{ margin: 0, color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
      <p style={{ margin: '8px 0 0', color: '#f8fafc', fontSize: 18, fontWeight: 800 }}>{value}</p>
    </div>
  )
}

function PageRole({ title, text }: { title: string; text: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 14, padding: 14, borderRadius: 18, background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(34,197,94,0.1)' }}>
      <strong style={{ color: '#a7f3d0', fontSize: 14 }}>{title}</strong>
      <span style={{ color: '#cbd5e1', lineHeight: 1.6, fontSize: 14 }}>{text}</span>
    </div>
  )
}

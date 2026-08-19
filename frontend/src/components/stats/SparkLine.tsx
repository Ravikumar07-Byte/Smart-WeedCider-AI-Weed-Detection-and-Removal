import { useEffect, useRef } from 'react'

interface SparkLineProps {
  color?: string
  width?: number
  height?: number
  points?: number[]
  animated?: boolean
}

export function SparkLine({
  color = '#22c55e',
  width = 120,
  height = 36,
  points = [4, 8, 6, 12, 9, 14, 11, 16, 13, 18, 15, 20],
  animated = true,
}: SparkLineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let offset = 0

    const draw = () => {
      ctx.clearRect(0, 0, width * 2, height * 2)
      const pts = animated
        ? [...points, ...points].slice(Math.floor(offset) % points.length, Math.floor(offset) % points.length + points.length)
        : points

      const minV = Math.min(...pts)
      const maxV = Math.max(...pts)
      const range = maxV - minV || 1

      const stepX = (width * 2) / (pts.length - 1)
      const pad = height * 0.2 * 2

      ctx.beginPath()
      pts.forEach((v, i) => {
        const x = i * stepX
        const y = (height * 2) - pad - ((v - minV) / range) * ((height * 2) - pad * 2)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })

      // Gradient fill
      const grad = ctx.createLinearGradient(0, 0, 0, height * 2)
      grad.addColorStop(0, color.replace(')', ', 0.3)').replace('rgb', 'rgba'))
      grad.addColorStop(1, 'transparent')

      // Stroke
      ctx.strokeStyle = color
      ctx.lineWidth = 1.8
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.stroke()

      offset += 0.08
      frameRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(frameRef.current)
  }, [color, width, height, points, animated])

  return (
    <canvas
      ref={canvasRef}
      width={width * 2}
      height={height * 2}
      style={{ width, height, display: 'block' }}
    />
  )
}

// Circular progress ring
interface RingProps {
  value: number // 0-100
  size?: number
  strokeWidth?: number
  color?: string
}

export function RingProgress({ value, size = 56, strokeWidth = 5, color = '#22c55e' }: RingProps) {
  const r = (size - strokeWidth * 2) / 2
  const circ = 2 * Math.PI * r
  const dash = (value / 100) * circ

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(34,197,94,0.12)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circ}
        strokeDashoffset={circ - dash}
        strokeLinecap="round"
        style={{
          filter: `drop-shadow(0 0 4px ${color}80)`,
          transition: 'stroke-dashoffset 1s ease',
        }}
      />
    </svg>
  )
}

// Wave graph
interface WaveProps {
  width?: number
  height?: number
  color?: string
}

export function WaveGraph({ width = 120, height = 36, color = '#38bdf8' }: WaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let t = 0
    const W = width * 2
    const H = height * 2

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      ctx.beginPath()
      for (let x = 0; x <= W; x++) {
        const y = H / 2 + Math.sin((x / W) * Math.PI * 4 + t) * (H * 0.3) + Math.sin((x / W) * Math.PI * 2 + t * 0.7) * (H * 0.15)
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.lineJoin = 'round'
      ctx.stroke()
      t += 0.04
      frameRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(frameRef.current)
  }, [color, width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width * 2}
      height={height * 2}
      style={{ width, height, display: 'block' }}
    />
  )
}

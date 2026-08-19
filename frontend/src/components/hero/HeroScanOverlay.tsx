import { motion, useAnimationFrame } from 'framer-motion'
import { useRef, useState } from 'react'

export function HeroScanOverlay() {
  const [scanY, setScanY] = useState(0)
  const timeRef = useRef(0)

  useAnimationFrame((t) => {
    timeRef.current = t
    const cycle = (t % 2600) / 2600
    const eased = 0.5 - Math.cos(cycle * Math.PI) / 2
    setScanY(eased)
  })

	  const boxes = [
	    { x: 46,  y: 36,  w: 94,  h: 198 },
	    { x: 180, y: 48,  w: 92,  h: 224 },
	    { x: 322, y: 70,  w: 90,  h: 180 },
	  ]

  return (
    <div style={{
	      position: 'absolute',
	      left: '50%',
	      bottom: 132,
	      width: 460,
	      height: 286,
	      pointerEvents: 'none',
	      zIndex: 10,
	      transform: 'translateX(-50%) scale(0.62)',
	      transformOrigin: 'bottom center',
	    }}>
      {/* Soft scanner aura */}
      <motion.div
        animate={{ opacity: [0.28, 0.46, 0.28], scale: [0.99, 1.025, 0.99] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
	          inset: -34,
          borderRadius: 18,
          background: 'radial-gradient(circle at 50% 54%, rgba(34,197,94,0.22), rgba(22,163,74,0.08) 38%, transparent 70%)',
          filter: 'blur(9px)',
        }}
      />

      {/* Grid overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(176,255,146,0.10) 1px, transparent 1px),
          linear-gradient(90deg, rgba(176,255,146,0.10) 1px, transparent 1px),
          radial-gradient(circle, rgba(34,255,94,0.9) 1px, transparent 2px),
          radial-gradient(circle at 48% 58%, rgba(34,197,94,0.14), transparent 46%)
        `,
	        backgroundSize: '38px 38px, 38px 38px, 18px 18px, auto',
        borderRadius: 8,
        opacity: 0.96,
        border: '1px solid rgba(34,255,94,0.24)',
        filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.3))',
        boxShadow: '0 0 28px rgba(34,197,94,0.18), inset 0 0 20px rgba(34,197,94,0.1)',
      }} />

      {/* Detection boxes */}
      {boxes.map((box, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.78, 1, 0.78] }}
          transition={{ duration: 1.8 + i * 0.24, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            left: box.x,
            top: box.y,
            width: box.w,
            height: box.h,
            border: '1.5px solid rgba(34,255,94,0.98)',
            borderRadius: 5,
            background: 'linear-gradient(180deg, rgba(34,197,94,0.07), rgba(22,163,74,0.018))',
            outline: '1px solid rgba(34,255,94,0.28)',
            outlineOffset: 3,
            opacity: 0.98,
            boxShadow: '0 0 14px rgba(34,197,94,0.64), 0 0 30px rgba(34,197,94,0.28), inset 0 0 12px rgba(34,197,94,0.16)',
          }}
        >
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 2,
            boxShadow: 'inset 0 0 0 1px rgba(34,255,94,0.26), 0 0 10px rgba(34,197,94,0.22)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'absolute', left: '50%', top: -9, width: 16, height: 16, borderLeft: '2px solid rgba(34,255,94,0.98)', transform: 'translateX(-50%)', filter: 'drop-shadow(0 0 5px rgba(34,197,94,0.64))' }} />
          <div style={{ position: 'absolute', left: '50%', bottom: -9, width: 16, height: 16, borderLeft: '2px solid rgba(34,255,94,0.98)', transform: 'translateX(-50%)', filter: 'drop-shadow(0 0 5px rgba(34,197,94,0.64))' }} />
          <div style={{ position: 'absolute', left: -9, top: '50%', width: 16, height: 16, borderTop: '2px solid rgba(34,255,94,0.98)', transform: 'translateY(-50%)', filter: 'drop-shadow(0 0 5px rgba(34,197,94,0.64))' }} />
          <div style={{ position: 'absolute', right: -9, top: '50%', width: 16, height: 16, borderTop: '2px solid rgba(34,255,94,0.98)', transform: 'translateY(-50%)', filter: 'drop-shadow(0 0 5px rgba(34,197,94,0.64))' }} />
          {/* Corner accents */}
          {[
            { top: -1, left: -1, borderTop: '2px solid', borderLeft: '2px solid' },
            { top: -1, right: -1, borderTop: '2px solid', borderRight: '2px solid' },
            { bottom: -1, left: -1, borderBottom: '2px solid', borderLeft: '2px solid' },
            { bottom: -1, right: -1, borderBottom: '2px solid', borderRight: '2px solid' },
          ].map((corner, ci) => (
            <div key={ci} style={{
              position: 'absolute',
              width: 14,
              height: 14,
              borderColor: '#22ff5e',
              filter: 'drop-shadow(0 0 5px rgba(34,197,94,0.72))',
              ...corner,
            }} />
          ))}
        </motion.div>
      ))}

      {/* Scan wash */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: `calc(${scanY * 100}% - 28px)`,
        height: 56,
        background: 'linear-gradient(180deg, transparent, rgba(34,197,94,0.08), transparent)',
        filter: 'blur(1px)',
        borderRadius: 4,
      }} />

      {/* Scan line */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: `${scanY * 100}%`,
        height: 4,
        background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.34), rgba(34,255,94,1), rgba(22,255,86,0.96), rgba(34,197,94,0.34), transparent)',
        boxShadow: '0 0 12px rgba(34,197,94,0.72), 0 0 26px rgba(34,197,94,0.3), 0 0 40px rgba(22,163,74,0.16)',
        borderRadius: 2,
      }} />

      {/* AI HUD label */}
      <motion.div
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          position: 'absolute',
          bottom: -28,
          left: 0,
          fontSize: 10,
          color: 'rgba(98,255,80,0.92)',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textShadow: '0 0 12px rgba(98,255,80,0.58)',
        }}
      >
        AI CROP SCAN ACTIVE
      </motion.div>
    </div>
  )
}

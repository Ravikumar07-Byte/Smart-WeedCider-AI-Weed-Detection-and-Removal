import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, Bell, ChevronDown } from 'lucide-react'

export function Topbar() {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 72,
      right: 0,
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      zIndex: 40,
      background: 'rgba(4,8,4,0.5)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(34,197,94,0.1)',
    }}>
      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(10,16,10,0.7)',
          border: '1px solid rgba(34,197,94,0.18)',
          borderRadius: 50,
          padding: '8px 18px',
          width: 280,
          backdropFilter: 'blur(12px)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
          cursor: 'text',
        }}
        whileFocus={{ borderColor: 'rgba(34,197,94,0.4)', boxShadow: '0 0 12px rgba(34,197,94,0.15)' }}
        onClick={() => inputRef.current?.focus()}
      >
        <Search size={15} color="rgba(156,163,175,0.6)" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search anything..."
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#d1d5db',
            fontSize: 13,
            fontFamily: 'Inter, sans-serif',
            width: '100%',
          }}
        />
      </motion.div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Bell */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{ position: 'relative', cursor: 'pointer' }}
        >
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'rgba(10,16,10,0.6)',
            border: '1px solid rgba(34,197,94,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Bell size={16} color="rgba(156,163,175,0.8)" />
          </div>
          {/* Badge */}
          <div style={{
            position: 'absolute',
            top: -3,
            right: -3,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#ef4444',
            border: '1.5px solid rgba(4,8,4,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 9,
            fontWeight: 700,
            color: '#fff',
          }}>
            3
          </div>
        </motion.div>

        {/* Profile */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(10,16,10,0.6)',
            border: '1px solid rgba(34,197,94,0.18)',
            borderRadius: 12,
            padding: '6px 12px 6px 6px',
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #166534, #15803d)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: '#fff',
          }}>
            S
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e5e7eb', lineHeight: 1.2 }}>Sumanth R.</div>
            <div style={{ fontSize: 10, color: 'rgba(156,163,175,0.7)', lineHeight: 1.2 }}>Farmer</div>
          </div>
          <ChevronDown size={14} color="rgba(156,163,175,0.5)" />
        </motion.div>
      </div>
    </div>
  )
}

import { motion } from 'framer-motion'
import {
  Home, ScanLine, LayoutDashboard, History,
  Lightbulb, Leaf, Info, Plus, UserRound
} from 'lucide-react'

export type FarmerProfile = {
  id: string
  name: string
  role: string
}

interface SidebarProps {
  active: string
  onNav: (id: string) => void
  profiles: FarmerProfile[]
  activeProfile: FarmerProfile
  profileMenuOpen: boolean
  onToggleProfileMenu: () => void
  onSelectProfile: (profileId: string) => void
  onCreateProfile: () => void
}

const navItems = [
  { id: 'home',            icon: Home,             label: 'Home' },
  { id: 'detection',       icon: ScanLine,         label: 'Detection' },
  { id: 'dashboard',       icon: LayoutDashboard,  label: 'Dashboard' },
  { id: 'history',         icon: History,          label: 'History' },
  { id: 'recommendations', icon: Lightbulb,        label: 'Recommendations' },
  { id: 'crop-health',     icon: Leaf,             label: 'Crop Health' },
  { id: 'project-overview', icon: Info,            label: 'Project Overview' },
]

const initials = (name: string) => name
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase())
  .join('') || 'F'

export function Sidebar({
  active,
  onNav,
  profiles,
  activeProfile,
  profileMenuOpen,
  onToggleProfileMenu,
  onSelectProfile,
  onCreateProfile,
}: SidebarProps) {
  return (
    <div
      className="glass"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 72,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 16,
        paddingBottom: 16,
        zIndex: 50,
        borderRadius: '0 28px 28px 0',
        background: 'linear-gradient(180deg, rgba(4,12,6,0.96), rgba(4,10,8,0.95), rgba(8,14,10,0.92))',
        boxShadow: '2px 0 32px rgba(0,0,0,0.45), inset -1px 0 0 rgba(34,197,94,0.15)',
        overflow: 'visible',
      }}
    >
      <div style={{
        position: 'absolute',
        top: 90,
        right: 0,
        width: 3,
        height: 'calc(100% - 180px)',
        background: 'linear-gradient(180deg, rgba(0,255,136,0.25), rgba(0,255,136,0.9), rgba(0,255,136,0.25))',
        boxShadow: '0 0 18px rgba(0,255,136,0.18)',
        pointerEvents: 'none',
      }} />
      {/* Logo */}
      <div style={{ marginBottom: 32 }}>
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'rgba(34,197,94,0.15)',
            border: '1px solid rgba(34,197,94,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(34,197,94,0.3)',
          }}
        >
          <Leaf size={20} color="#22c55e" />
        </motion.div>
      </div>

      {/* Nav Items */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
        {navItems.map((item) => {
          const isActive = active === item.id
          return (
            <motion.button
              key={item.id}
              onClick={() => onNav(item.id)}
              title={item.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              style={{
                position: 'relative',
                width: 52,
                height: 52,
                borderRadius: 16,
                border: '1px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(34,197,94,0.18), rgba(10,20,10,0.75))'
                  : 'rgba(7, 12, 8, 0.25)',
                boxShadow: isActive
                  ? '0 0 24px rgba(34,197,94,0.18), inset 0 0 10px rgba(34,197,94,0.06)'
                  : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="active-bar"
                  style={{
                    position: 'absolute',
                    left: -13,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3,
                    height: 28,
                    borderRadius: 2,
                    background: '#22c55e',
                    boxShadow: '0 0 8px rgba(34,197,94,0.8)',
                  }}
                />
              )}
              <item.icon
                size={20}
                color={isActive ? '#a7f3d0' : 'rgba(134,239,172,0.92)'}
                strokeWidth={isActive ? 2.4 : 1.8}
              />
            </motion.button>
          )
        })}
      </div>

      <div style={{ position: 'relative' }}>
        {profileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -8, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            style={{
              position: 'absolute',
              left: 64,
              bottom: 0,
              width: 270,
              padding: 14,
              borderRadius: 20,
              background: 'rgba(4, 12, 6, 0.96)',
              border: '1px solid rgba(34,197,94,0.24)',
              boxShadow: '0 18px 56px rgba(0,0,0,0.48)',
              display: 'grid',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <p style={{ margin: 0, color: '#8ee5aa', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Farmers</p>
                <p style={{ margin: '5px 0 0', color: '#fff', fontSize: 14, fontWeight: 800 }}>Choose profile</p>
              </div>
              <button
                type="button"
                onClick={onCreateProfile}
                title="Add farmer"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  border: '1px solid rgba(34,197,94,0.32)',
                  background: 'rgba(34,197,94,0.12)',
                  color: '#a7f3d0',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Plus size={17} />
              </button>
            </div>

            <div style={{ display: 'grid', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
              {profiles.map((profile) => {
                const selected = profile.id === activeProfile.id
                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => onSelectProfile(profile.id)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '38px 1fr',
                      gap: 10,
                      alignItems: 'center',
                      padding: 9,
                      borderRadius: 14,
                      border: selected ? '1px solid rgba(34,197,94,0.48)' : '1px solid rgba(255,255,255,0.08)',
                      background: selected ? 'rgba(34,197,94,0.14)' : 'rgba(255,255,255,0.04)',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ width: 38, height: 38, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, rgba(34,197,94,0.92), rgba(16,185,78,0.32))', color: '#04160d', fontWeight: 900, fontSize: 12 }}>
                      {initials(profile.name)}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <strong style={{ display: 'block', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.name}</strong>
                      <span style={{ display: 'block', marginTop: 3, color: '#94a3b8', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.role}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        <motion.button
          type="button"
          onClick={onToggleProfileMenu}
          title={`${activeProfile.name} profile`}
          whileHover={{ scale: 1.05 }}
          style={{
            width: 52,
            height: 52,
            borderRadius: 18,
            background: 'rgba(10, 18, 12, 0.76)',
            border: profileMenuOpen ? '1px solid rgba(34,197,94,0.56)' : '1px solid rgba(34,197,94,0.24)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            cursor: 'pointer',
            overflow: 'hidden',
            boxShadow: 'inset 0 0 16px rgba(34,197,94,0.08)',
          }}
        >
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(34,197,94,0.95) 0%, rgba(16,185,78,0.35) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 900,
            color: '#04160d',
            boxShadow: '0 0 18px rgba(34,197,94,0.22)',
          }}>
            {profiles.length ? initials(activeProfile.name) : <UserRound size={17} />}
          </div>
          <div style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#22c55e',
            border: '1.5px solid rgba(4,8,4,0.9)',
            boxShadow: '0 0 6px rgba(34,197,94,0.8)',
          }} />
        </motion.button>
      </div>
    </div>
  )
}

import { useState } from 'react'
import V1App from './versions/V1App.jsx'
import V2App from './versions/V2App.jsx'
import V3App from './versions/V3App.jsx'
import V4App from './versions/V4App.jsx'

const VERSIONS = [
  { id: 1, label: 'V1', App: V1App },
  { id: 2, label: 'V2', App: V2App },
  { id: 3, label: 'V3', App: V3App },
  { id: 4, label: 'V4', App: V4App },
]

function StatusBar() {
  return (
    <div className="status-bar">
      <span className="status-time">9:41</span>
      <div className="status-icons">
        <svg width="17" height="12" viewBox="0 0 17 12">
          <rect x="0" y="7" width="3" height="5" rx="0.8" opacity="0.3"/>
          <rect x="4.5" y="5" width="3" height="7" rx="0.8" opacity="0.5"/>
          <rect x="9" y="2.5" width="3" height="9.5" rx="0.8" opacity="0.8"/>
          <rect x="13.5" y="0" width="3" height="12" rx="0.8"/>
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12">
          <path d="M8 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/>
          <path d="M3.5 6.5C4.9 5.1 6.35 4.4 8 4.4s3.1.7 4.5 2.1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
          <path d="M.8 3.8C2.7 1.9 5.2.8 8 .8s5.3 1.1 7.2 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12">
          <rect x="0" y="1" width="21" height="10" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.35"/>
          <rect x="1.5" y="2.5" width="17" height="7" rx="1.5"/>
          <path d="M22.5 4.2v3.6a1.5 1.5 0 0 0 0-3.6z"/>
        </svg>
      </div>
    </div>
  )
}

export default function App() {
  const [activeVersion, setActiveVersion] = useState(1)
  const { App: ActiveApp } = VERSIONS.find(v => v.id === activeVersion)

  return (
    <div className="app-wrapper">
      {/* Version switcher */}
      <div className="version-switcher">
        {VERSIONS.map(v => (
          <button
            key={v.id}
            className={`version-btn${activeVersion === v.id ? ' version-btn-active' : ''}`}
            onClick={() => setActiveVersion(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="phone">
        {/* Dynamic Island */}
        <div className="dynamic-island-wrapper">
          <div className="dynamic-island" />
        </div>

        {/* Status Bar */}
        <StatusBar />

        {/* Active version — re-mounts on switch so each version has fresh state */}
        <ActiveApp key={activeVersion} />
      </div>
    </div>
  )
}

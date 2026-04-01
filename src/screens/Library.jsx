import { useState, useEffect, useRef } from 'react'
import Generate from './Generate.jsx'
import Inspiration from './Inspiration.jsx'

let nextId = 1

const FORMAT_LABELS = {
  tiktok: 'TikTok',
  reels: 'Instagram Reel',
  youtube: 'YouTube Short',
  tedtalk: 'TED Talk',
}

export default function Library({ goTo, path, selectedAvatar }) {
  const [avatarReady, setAvatarReady] = useState(false)
  const [activeTab, setActiveTab] = useState('library')
  const [queue, setQueue] = useState([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [showNotifPrompt, setShowNotifPrompt] = useState(false)
  const tickRef = useRef(null)

  // Simulate avatar becoming ready after 3 seconds
  useEffect(() => {
    const t = setTimeout(() => setAvatarReady(true), 3000)
    return () => clearTimeout(t)
  }, [])

  // Countdown ticker for queue items
  useEffect(() => {
    if (queue.length === 0) return
    tickRef.current = setInterval(() => {
      setQueue(prev => prev.map(item => {
        if (item.status !== 'generating') return item
        const newLeft = item.timeLeft - 1
        if (newLeft <= 0) return { ...item, timeLeft: 0, status: 'ready' }
        return { ...item, timeLeft: newLeft }
      }))
    }, 1000)
    return () => clearInterval(tickRef.current)
  }, [queue.length])

  const handleGenerate = ({ prompt, format, variations }) => {
    const item = {
      id: nextId++,
      prompt,
      format,
      variations,
      timeLeft: 10,
      status: 'generating',
    }
    setQueue(prev => [item, ...prev])
    setActiveTab('library')
    if (!notificationsEnabled) {
      setTimeout(() => setShowNotifPrompt(true), 400)
    }
  }

  const enableNotifications = () => {
    setNotificationsEnabled(true)
    setShowNotifPrompt(false)
  }

  return (
    <div className="screen" style={{ overflow: 'hidden', position: 'relative', height: '100%' }}>

      {activeTab === 'generate' && (
        <Generate
          onGenerate={handleGenerate}
          onOpenAvatar={() => goTo('avatar_browser')}
          selectedAvatar={selectedAvatar}
        />
      )}
      {activeTab === 'inspiration' && (
        <Inspiration onMakeSimilar={() => setActiveTab('generate')} />
      )}

      {/* ── Library tab ── */}
      <div className="library-screen" style={{ display: activeTab === 'library' ? 'flex' : 'none' }}>
        <div className="library-title">Library</div>

        {/* Avatar card */}
        <div className="avatar-card" style={{ cursor: avatarReady ? 'pointer' : 'default' }}
          onClick={() => avatarReady && goTo('avatar')}>
          <div className="avatar-card-preview">
            <div className="avatar-card-gradient" />
            <div className="avatar-card-content">
              {!avatarReady ? (
                <>
                  <div className="avatar-loading-spinner" />
                  <div className="avatar-loading-text">Creating your avatar…</div>
                  <div className="progress-dots">
                    <div className="progress-dot" />
                    <div className="progress-dot" />
                    <div className="progress-dot" />
                  </div>
                </>
              ) : (
                <>
                  <div className="avatar-ready-icon">✅</div>
                  <div className="avatar-ready-label fade-in">Avatar is ready!</div>
                </>
              )}
            </div>
          </div>
          <div className="avatar-card-footer">
            <div>
              <div className="avatar-card-name">My Avatar</div>
              <div className="avatar-card-status">
                {avatarReady ? '✓ Ready to use' : 'Processing…'}
              </div>
            </div>
            {avatarReady && (
              <button
                className="create-video-btn fade-in"
                onClick={() => setActiveTab('generate')}
              >
                Create a video →
              </button>
            )}
          </div>
        </div>

        {/* Queue items */}
        {queue.length > 0 && (
          <div className="queue-section">
            {queue.map(item => (
              <div key={item.id} className={`queue-card ${item.status === 'ready' ? 'ready' : ''}`}>
                <div className="queue-card-left">
                  <div className="queue-thumb">
                    {item.status === 'ready'
                      ? <span style={{ fontSize: 22 }}>🎬</span>
                      : <div className="queue-spinner" />
                    }
                  </div>
                  <div className="queue-info">
                    <div className="queue-prompt">{item.prompt.length > 48 ? item.prompt.slice(0, 48) + '…' : item.prompt}</div>
                    <div className="queue-meta">
                      {FORMAT_LABELS[item.format]}
                      {item.variations > 1 && <span className="queue-var-badge">{item.variations} variations</span>}
                    </div>
                  </div>
                </div>

                <div className="queue-status-col">
                  {item.status === 'generating' ? (
                    <>
                      <div className="queue-timer">{item.timeLeft}s</div>
                      <div className="queue-status-label">Generating…</div>
                      <div className="queue-progress-bar">
                        <div
                          className="queue-progress-fill"
                          style={{ width: `${((10 - item.timeLeft) / 10) * 100}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <button className="queue-download-btn fade-in">Download ↓</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {queue.length === 0 && (
          <p className="library-empty-hint">Videos you generate will appear here</p>
        )}
      </div>

      {/* ── Notification prompt sheet ── */}
      {showNotifPrompt && (
        <div className="notif-overlay" onClick={() => setShowNotifPrompt(false)}>
          <div className="notif-sheet" onClick={e => e.stopPropagation()}>
            <div className="notif-icon">🔔</div>
            <div className="notif-title">Get notified when ready?</div>
            <div className="notif-body">
              Your video is generating. We'll send you a notification the moment it's done — no need to wait here.
            </div>
            <button className="notif-enable-btn" onClick={enableNotifications}>
              Enable notifications
            </button>
            <button className="notif-skip-btn" onClick={() => setShowNotifPrompt(false)}>
              I'll check back manually
            </button>
          </div>
        </div>
      )}

      {/* ── Tab bar ── */}
      <div className="tab-bar">
        <button
          className={`tab-item ${activeTab === 'inspiration' ? 'active' : ''}`}
          onClick={() => setActiveTab('inspiration')}
        >
          <span className="tab-icon">💡</span>
          <span className="tab-label">Inspiration</span>
        </button>
        <button
          className={`tab-item ${activeTab === 'generate' ? 'active' : ''}`}
          onClick={() => setActiveTab('generate')}
        >
          <span className="tab-icon">✨</span>
          <span className="tab-label">Generate</span>
        </button>
        <button
          className={`tab-item ${activeTab === 'library' ? 'active' : ''}`}
          onClick={() => setActiveTab('library')}
        >
          <span className="tab-icon">🎬</span>
          <span className="tab-label">Library</span>
        </button>
      </div>
    </div>
  )
}

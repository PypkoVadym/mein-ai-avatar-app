import { useState, useEffect } from 'react'

const STEPS = [
  { id: 1, label: 'Processing video' },
  { id: 2, label: 'Analysing facial geometry' },
  { id: 3, label: 'Generating avatar' },
  { id: 4, label: 'Final processing' },
  { id: 5, label: 'Deleting source files', sub: '✓ Your privacy is protected' },
]

const STEP_DURATIONS = [1500, 1800, 2000, 1500, 1200]

export default function AvatarGeneration({ goTo }) {
  const [activeStep, setActiveStep] = useState(1)
  const [doneSteps, setDoneSteps] = useState([])
  const [showNotif, setShowNotif] = useState(false)
  const [notifEnabled, setNotifEnabled] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let current = 1
    let elapsed = 0

    const advance = () => {
      if (current > STEPS.length) {
        setReady(true)
        setTimeout(() => goTo('library'), 1500)
        return
      }

      const delay = STEP_DURATIONS[current - 1] ?? 1500
      setTimeout(() => {
        setDoneSteps(prev => [...prev, current])
        current++
        setActiveStep(current)

        // Show notification card after step 2 is done
        if (current === 3) setShowNotif(true)

        advance()
      }, delay)
    }

    advance()
  }, [])

  const stepStatus = (id) => {
    if (doneSteps.includes(id)) return 'done'
    if (activeStep === id) return 'active'
    return 'pending'
  }

  return (
    <div className="screen generation-screen">
      {ready ? (
        <div
          className="fade-in"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 64 }}>🎉</div>
          <div className="ready-message">Your avatar is ready!</div>
        </div>
      ) : (
        <>
          <div className="generation-title">Creating your avatar</div>
          <p className="generation-subtitle">This usually takes a few minutes</p>

          {/* Steps */}
          <div className="steps-container">
            {STEPS.map(step => {
              const status = stepStatus(step.id)
              return (
                <div key={step.id} className="step-row">
                  <div className={`step-icon ${status}`}>
                    {status === 'done' && '✓'}
                    {status === 'active' && <div className="step-spinner" />}
                    {status === 'pending' && (
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{step.id}</span>
                    )}
                  </div>
                  <div>
                    <div className={`step-text ${status}`}>{step.label}</div>
                    {status === 'done' && step.sub && (
                      <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 2 }}>
                        {step.sub}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Notification opt-in */}
          {showNotif && (
            <div className="notification-card fade-in">
              <div className="notif-header">
                <span className="notif-icon">🔔</span>
                <span className="notif-title">Get notified when ready</span>
              </div>
              <p className="notif-desc">
                We'll ping you when your avatar is done — no need to wait here.
              </p>
              {notifEnabled ? (
                <div className="notif-enabled">Notifications enabled ✓</div>
              ) : (
                <button className="notif-btn" onClick={() => setNotifEnabled(true)}>
                  Enable notifications
                </button>
              )}
            </div>
          )}

          <p className="generation-hint">
            You can close the app — we'll notify you when it's ready
          </p>
        </>
      )}
    </div>
  )
}

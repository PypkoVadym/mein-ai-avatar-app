import { useState, useEffect, useRef } from 'react'

export default function FaceScan({ goTo, onBack }) {
  const [recording, setRecording] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15)
  const [done, setDone] = useState(false)
  const [showConsent, setShowConsent] = useState(false)
  const [consent1, setConsent1] = useState(false)
  const [consent2, setConsent2] = useState(false)

  const timerRef = useRef(null)

  const startRecording = () => {
    setRecording(true)
    setTimeLeft(15)
  }

  useEffect(() => {
    if (!recording) return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          setRecording(false)
          setDone(true)
          setTimeout(() => setShowConsent(true), 1500)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [recording])

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `0:${sec < 10 ? '0' : ''}${sec}`
  }

  const canSubmit = consent1 && consent2

  return (
    <div className="screen" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <div className="nav-bar">
        <button className="back-btn" onClick={onBack}>←</button>
        <span className="nav-title">Record yourself</span>
      </div>

      <div className="face-scan-screen">
        <p className="face-scan-subtitle">
          This is the last time you'll need to do this.
        </p>

        {/* Head turn instructions */}
        <div className="head-turn-row">
          <div className="head-turn-item">
            <span className="head-turn-emoji">👈</span>
            <span className="head-turn-label">Turn left</span>
          </div>
          <div className="head-turn-item">
            <span className="head-turn-emoji">😐</span>
            <span className="head-turn-label">Face forward</span>
          </div>
          <div className="head-turn-item">
            <span className="head-turn-emoji">👉</span>
            <span className="head-turn-label">Turn right</span>
          </div>
        </div>

        {/* Viewfinder */}
        <div style={{ position: 'relative', marginBottom: recording ? 52 : 20 }}>
          <div className="face-viewfinder">
            <div className={`face-oval ${recording ? 'recording' : ''} ${done ? 'done' : ''}`} />
            <div className={`scan-ring ${recording ? 'fast' : ''}`} />
            {done && (
              <div className="face-done-overlay">✅</div>
            )}
          </div>
          {recording && (
            <div className="timer-text">{formatTime(timeLeft)}</div>
          )}
        </div>

        {/* Done message */}
        {done && (
          <p className="great-text fade-in">Great! Looking good ✓</p>
        )}

        {/* Record button */}
        {!done && (
          <div className="record-btn-area">
            <button
              className={`record-btn ${recording ? 'recording' : ''}`}
              onClick={startRecording}
              disabled={recording}
            >
              <div className={`record-btn-inner ${recording ? 'recording' : ''}`} />
            </button>
          </div>
        )}

        {!recording && !done && (
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
            Tap to start recording
          </p>
        )}

        {/* Consent section */}
        {showConsent && (
          <div className="consent-section visible">
            <p className="consent-title">Before we submit</p>

            <div
              className="checkbox-row"
              onClick={() => setConsent1(v => !v)}
            >
              <div className={`custom-checkbox ${consent1 ? 'checked' : ''}`}>
                {consent1 && <span className="checkbox-check">✓</span>}
              </div>
              <span className="checkbox-label">
                I consent to processing my biometric data to create an AI avatar (
                <span className="link-text">Privacy Policy</span>)
              </span>
            </div>

            <div
              className="checkbox-row"
              onClick={() => setConsent2(v => !v)}
            >
              <div className={`custom-checkbox ${consent2 ? 'checked' : ''}`}>
                {consent2 && <span className="checkbox-check">✓</span>}
              </div>
              <span className="checkbox-label">
                I understand the avatar is for my personal use only
              </span>
            </div>

            <button
              className="btn-primary"
              disabled={!canSubmit}
              onClick={() => goTo('voice')}
              style={{ marginTop: 4 }}
            >
              Submit &amp; Create Avatar →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

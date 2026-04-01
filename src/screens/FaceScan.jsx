import { useState } from 'react'

const STEPS = [
  { emoji: '👈', label: 'Turn left',    hint: 'Turn left' },
  { emoji: '😐', label: 'Face forward', hint: 'Face forward' },
  { emoji: '👉', label: 'Turn right',   hint: 'Turn right' },
]

export default function FaceScan({ goTo, onBack }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [captured, setCaptured] = useState([false, false, false])
  const [flash, setFlash] = useState(false)
  const [showConsent, setShowConsent] = useState(false)
  const [consent1, setConsent1] = useState(false)
  const [consent2, setConsent2] = useState(false)

  const done = captured.every(Boolean)
  const canSubmit = consent1 && consent2

  const takePhoto = () => {
    setFlash(true)
    setTimeout(() => setFlash(false), 200)
    const next = captured.map((v, i) => i === currentStep ? true : v)
    setCaptured(next)
    if (currentStep < 2) {
      setTimeout(() => setCurrentStep(s => s + 1), 500)
    } else {
      setTimeout(() => setShowConsent(true), 800)
    }
  }

  return (
    <div className="screen" style={{ display: 'flex', flexDirection: 'column', background: '#000', overflow: 'hidden' }}>

      {/* ── Camera top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px 10px', zIndex: 10,
      }}>
        <button onClick={onBack} style={{
          background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff',
          width: 34, height: 34, borderRadius: '50%', fontSize: 16,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>←</button>

        <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, letterSpacing: 0.3 }}>
          {done ? 'All photos taken' : `Photo ${currentStep + 1} of 3`}
        </span>

        {/* Flash icon placeholder */}
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
        }}>⚡</div>
      </div>

      {/* ── Viewfinder ── */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* Flash overlay */}
        {flash && (
          <div style={{
            position: 'absolute', inset: 0, background: '#fff',
            animation: 'camFlash 0.2s ease forwards', zIndex: 20,
          }} />
        )}

        {/* Rule-of-thirds grid */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', left: '33%', top: 0, bottom: 0, width: 1, background: '#fff' }} />
          <div style={{ position: 'absolute', left: '66%', top: 0, bottom: 0, width: 1, background: '#fff' }} />
          <div style={{ position: 'absolute', top: '33%', left: 0, right: 0, height: 1, background: '#fff' }} />
          <div style={{ position: 'absolute', top: '66%', left: 0, right: 0, height: 1, background: '#fff' }} />
        </div>

        {/* Face oval guide */}
        <div style={{ position: 'relative', width: 200, height: 260 }}>
          {/* Corner brackets */}
          {[
            { top: 0, left: 0, borderTop: '3px solid #fff', borderLeft: '3px solid #fff', borderRadius: '4px 0 0 0' },
            { top: 0, right: 0, borderTop: '3px solid #fff', borderRight: '3px solid #fff', borderRadius: '0 4px 0 0' },
            { bottom: 0, left: 0, borderBottom: '3px solid #fff', borderLeft: '3px solid #fff', borderRadius: '0 0 0 4px' },
            { bottom: 0, right: 0, borderBottom: '3px solid #fff', borderRight: '3px solid #fff', borderRadius: '0 0 4px 0' },
          ].map((s, i) => (
            <div key={i} style={{ position: 'absolute', width: 22, height: 22, ...s }} />
          ))}

          {/* Oval */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 150, height: 200,
            border: done ? '2px solid #4ade80' : `2px dashed rgba(255,255,255,0.5)`,
            borderRadius: '50%',
            transition: 'border-color 0.3s',
          }} />

          {/* Done checkmark */}
          {done && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 52, animation: 'fadeInUp 0.4s ease',
            }}>✅</div>
          )}
        </div>

        {/* Direction hint overlay */}
        {!done && (
          <div style={{
            position: 'absolute', bottom: 24, left: 0, right: 0,
            display: 'flex', justifyContent: 'center',
          }}>
            <div style={{
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
              borderRadius: 20, padding: '6px 18px',
              color: '#fff', fontSize: 14, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span>{STEPS[currentStep].emoji}</span>
              <span>{STEPS[currentStep].hint}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom controls ── */}
      <div style={{ padding: '16px 24px 32px', background: '#111' }}>

        {/* Photo thumbnails row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{
              width: 52, height: 52, borderRadius: 10,
              border: captured[i]
                ? '2px solid #4ade80'
                : i === currentStep && !done
                  ? '2px solid #fff'
                  : '2px solid rgba(255,255,255,0.2)',
              background: captured[i] ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 3,
              transition: 'all 0.25s',
            }}>
              <span style={{ fontSize: 18, opacity: captured[i] ? 1 : i === currentStep ? 1 : 0.3 }}>
                {captured[i] ? '✅' : step.emoji}
              </span>
              <span style={{
                fontSize: 9, fontWeight: 600,
                color: captured[i] ? '#4ade80' : i === currentStep ? '#fff' : 'rgba(255,255,255,0.3)',
                textAlign: 'center', lineHeight: 1.2,
              }}>
                {step.label.split(' ')[0]}<br />{step.label.split(' ')[1] || ''}
              </span>
            </div>
          ))}
        </div>

        {/* Shutter button */}
        {!done && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={takePhoto} style={{
              width: 76, height: 76, borderRadius: '50%',
              background: 'transparent',
              border: '4px solid #fff',
              padding: 4, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 0.1s',
            }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#fff' }} />
            </button>
          </div>
        )}
      </div>

      {/* ── Consent sheet (slides up over the camera) ── */}
      {showConsent && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'var(--bg-card)', borderRadius: '20px 20px 0 0',
          padding: '24px 20px 40px',
          animation: 'slideUp 0.35s ease',
          display: 'flex', flexDirection: 'column', gap: 14,
          zIndex: 30,
        }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', alignSelf: 'center', marginBottom: 4 }} />
          <p className="consent-title">Before we submit</p>

          <div className="checkbox-row" onClick={() => setConsent1(v => !v)}>
            <div className={`custom-checkbox ${consent1 ? 'checked' : ''}`}>
              {consent1 && <span className="checkbox-check">✓</span>}
            </div>
            <span className="checkbox-label">
              I consent to processing my biometric data to create an AI avatar (
              <span className="link-text">Privacy Policy</span>)
            </span>
          </div>

          <div className="checkbox-row" onClick={() => setConsent2(v => !v)}>
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

      <style>{`
        @keyframes camFlash { from { opacity: 0.9 } to { opacity: 0 } }
        @keyframes slideUp  { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </div>
  )
}

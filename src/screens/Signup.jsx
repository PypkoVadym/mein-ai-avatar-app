import { useState } from 'react'

function calculateAge(dob) {
  if (!dob) return null
  const today = new Date()
  const birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export default function Signup({ goTo, showCookie, setShowCookie }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [dob, setDob] = useState('')
  const [tosChecked, setTosChecked] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const age = calculateAge(dob)
  const isUnderage = dob && age !== null && age < 18

  const canSubmit = tosChecked && email && password && dob && !isUnderage

  const handleSubmit = () => {
    if (!canSubmit) return
    setSubmitted(true)
    setTimeout(() => goTo('q1'), 100)
  }

  if (isUnderage) {
    return (
      <div className="screen">
        <div className="age-gate">
          <div className="age-gate-emoji">🙏</div>
          <div className="age-gate-title">You need to be 18+</div>
          <div className="age-gate-desc">
            We're sorry — TWIN is only available for adults. Your data hasn't been stored and no account was created.
          </div>
          <button
            className="btn-secondary"
            style={{ marginTop: 12 }}
            onClick={() => setDob('')}
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen signup-screen">
      {/* Logo */}
      <div className="logo-area">
        <div className="logo-text">TWIN</div>
        <div className="logo-tagline">Create your AI avatar</div>
      </div>

      {/* Form */}
      <div className="signup-form">
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-input"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-input"
            placeholder="At least 8 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Date of birth</label>
          <input
            type="date"
            className="form-input"
            value={dob}
            onChange={e => setDob(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
          <p className="dob-note">
            🔒 For age verification only (18+). Not stored.
          </p>
        </div>

        <div className="signup-tos">
          <div
            className="checkbox-row"
            onClick={() => setTosChecked(v => !v)}
          >
            <div className={`custom-checkbox ${tosChecked ? 'checked' : ''}`}>
              {tosChecked && <span className="checkbox-check">✓</span>}
            </div>
            <span className="checkbox-label">
              I agree to the{' '}
              <span className="link-text">Terms of Service</span>
              {' '}and{' '}
              <span className="link-text">Privacy Policy</span>
            </span>
          </div>
        </div>

        <div className="signup-submit">
          <button
            className="btn-primary"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            Create account
          </button>
        </div>
      </div>

      {/* Cookie Banner */}
      {showCookie && (
        <div className="cookie-overlay">
          <div className="cookie-sheet">
            <div className="cookie-title">🍪 About cookies</div>
            <div className="cookie-desc">
              We use only essential cookies. No tracking, no third-party ads.
            </div>
            <div className="cookie-actions">
              <button
                className="cookie-accept"
                onClick={() => setShowCookie(false)}
              >
                Got it
              </button>
              <span className="cookie-link">Privacy Policy</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

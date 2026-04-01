import { useState } from 'react'

const QUALITY_SCORE = 79

const BREAKDOWN = [
  { label: 'Facial clarity',    score: 88, icon: '👁️' },
  { label: 'Expression range',  score: 68, icon: '😊' },
  { label: 'Lighting quality',  score: 76, icon: '☀️' },
  { label: 'Voice sync',        score: 84, icon: '🎤' },
]

const TIPS = [
  {
    id: 1,
    priority: 'High impact',
    priorityColor: '#C0513A',
    priorityBg: '#FAEEE9',
    icon: '☀️',
    title: 'Shoot in natural lighting',
    desc: 'Soft, even light from a window improves facial sharpness by up to 30%.',
    cta: 'Reshoot now',
    gain: '+12%',
  },
  {
    id: 2,
    priority: 'Medium',
    priorityColor: '#9A6B00',
    priorityBg: '#FEF3C7',
    icon: '🔄',
    title: 'Add more angles',
    desc: 'Upload 2 extra angles to unlock a wider expression range for your avatar.',
    cta: 'Upload photos',
    gain: '+8%',
  },
  {
    id: 3,
    priority: 'Medium',
    priorityColor: '#285BB0',
    priorityBg: '#EAF1FC',
    icon: '🎙️',
    title: 'Calibrate your voice',
    desc: 'A 30-second voice sample in a quiet room significantly improves lip sync.',
    cta: 'Record now',
    gain: '+6%',
  },
  {
    id: 4,
    priority: 'Low',
    priorityColor: '#7B7B7B',
    priorityBg: '#F2F2F2',
    icon: '🖼️',
    title: 'Use a plain background',
    desc: 'A neutral background helps the model isolate your face more precisely.',
    cta: 'Reshoot',
    gain: '+4%',
  },
]

// SVG ring: r=52, circumference ≈ 326.7
const R = 52
const CIRC = 2 * Math.PI * R

function QualityRing({ score }) {
  const fill = CIRC * (1 - score / 100)
  const label = score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : 'Fair'
  const labelColor = score >= 85 ? '#2D7A5F' : score >= 70 ? '#C0513A' : '#9A6B00'

  return (
    <div className="av-ring-wrap">
      <svg width="132" height="132" viewBox="0 0 132 132">
        <circle cx="66" cy="66" r={R} fill="none" stroke="var(--border)" strokeWidth="10" />
        <circle
          cx="66" cy="66" r={R}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={fill}
          transform="rotate(-90 66 66)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="av-ring-inner">
        <div className="av-ring-score">{score}<span className="av-ring-pct">%</span></div>
        <div className="av-ring-label" style={{ color: labelColor }}>{label}</div>
      </div>
    </div>
  )
}

export default function AvatarScreen({ goTo, path }) {
  const [doneTips, setDoneTips] = useState([])
  const [showReshootToast, setShowReshootToast] = useState(false)

  const handleTip = (id) => {
    if (doneTips.includes(id)) return
    setDoneTips(prev => [...prev, id])
    setShowReshootToast(true)
    setTimeout(() => setShowReshootToast(false), 2200)
  }

  const completedGain = doneTips.reduce((sum, id) => {
    const tip = TIPS.find(t => t.id === id)
    return sum + (tip ? parseInt(tip.gain) : 0)
  }, 0)

  const effectiveScore = Math.min(100, QUALITY_SCORE + completedGain)

  return (
    <div className="screen av-screen">

      {/* ── Nav ── */}
      <div className="av-nav">
        <button className="back-btn" onClick={() => goTo('library', true)}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="av-nav-title">My Avatar</span>
        <button className="av-edit-btn" onClick={() => {}}>Edit</button>
      </div>

      <div className="av-scroll">

        {/* ── Hero ── */}
        <div className="av-hero">
          <div className="av-hero-bg" />
          <div className="av-avatar-circle">
            <span style={{ fontSize: 48 }}>{path === 'B' ? '👩‍🎤' : '🧑‍💼'}</span>
          </div>
          <div className="av-hero-name">My Avatar</div>
          <div className="av-hero-meta">
            Created just now · {path === 'A' ? 'Personal scan' : 'Seed character'}
          </div>
          <div className="av-hero-actions">
            <button className="av-preview-btn">▶ Preview</button>
            <button className="av-share-btn">Share</button>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="av-stats-row">
          <div className="av-stat">
            <div className="av-stat-value">0</div>
            <div className="av-stat-label">Videos</div>
          </div>
          <div className="av-stat-divider" />
          <div className="av-stat">
            <div className="av-stat-value">0</div>
            <div className="av-stat-label">Views</div>
          </div>
          <div className="av-stat-divider" />
          <div className="av-stat">
            <div className="av-stat-value">—</div>
            <div className="av-stat-label">Avg. engagement</div>
          </div>
        </div>

        {/* ── Quality Score ── */}
        <div className="av-section">
          <div className="av-section-title">Avatar Quality</div>
          <div className="av-quality-card">
            <QualityRing score={effectiveScore} />
            <div className="av-quality-right">
              <div className="av-quality-headline">
                {effectiveScore >= 85 ? 'Excellent avatar!' : effectiveScore >= 70 ? 'Good start!' : 'Needs work'}
              </div>
              <div className="av-quality-sub">
                {completedGain > 0
                  ? `+${completedGain}% from your improvements`
                  : 'Complete the tips below to reach 90%+'}
              </div>
              <div className="av-quality-tips-done">
                {doneTips.length}/{TIPS.length} improvements done
              </div>
            </div>
          </div>
        </div>

        {/* ── Quality Breakdown ── */}
        <div className="av-section">
          <div className="av-section-title">Quality Breakdown</div>
          <div className="av-breakdown-card">
            {BREAKDOWN.map((item, i) => (
              <div key={item.label} className="av-breakdown-row">
                <span className="av-breakdown-icon">{item.icon}</span>
                <div className="av-breakdown-info">
                  <div className="av-breakdown-header">
                    <span className="av-breakdown-label">{item.label}</span>
                    <span className="av-breakdown-pct">{item.score}%</span>
                  </div>
                  <div className="av-breakdown-track">
                    <div
                      className="av-breakdown-fill"
                      style={{
                        width: `${item.score}%`,
                        background: item.score >= 80
                          ? 'var(--accent)'
                          : item.score >= 65
                          ? '#E8A43A'
                          : '#DC6B6B',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Ways to Improve ── */}
        <div className="av-section">
          <div className="av-section-header">
            <div className="av-section-title">Improve Your Avatar</div>
            <div className="av-section-sub">Up to +30% quality</div>
          </div>
          <div className="av-tips-list">
            {TIPS.map(tip => {
              const done = doneTips.includes(tip.id)
              return (
                <div key={tip.id} className={`av-tip-card ${done ? 'done' : ''}`}>
                  <div className="av-tip-top">
                    <span className="av-tip-icon">{tip.icon}</span>
                    <div className="av-tip-badges">
                      <span
                        className="av-tip-priority"
                        style={{ color: tip.priorityColor, background: tip.priorityBg }}
                      >
                        {tip.priority}
                      </span>
                      {!done && (
                        <span className="av-tip-gain">{tip.gain} quality</span>
                      )}
                      {done && (
                        <span className="av-tip-done-badge">✓ Done</span>
                      )}
                    </div>
                  </div>
                  <div className="av-tip-title">{tip.title}</div>
                  <div className="av-tip-desc">{tip.desc}</div>
                  {!done && (
                    <button
                      className="av-tip-cta"
                      onClick={() => handleTip(tip.id)}
                    >
                      {tip.cta} →
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Go to Library ── */}
        <div className="av-bottom-action">
          <button className="btn-primary" onClick={() => goTo('library')}>
            Start creating videos →
          </button>
        </div>

      </div>

      {showReshootToast && (
        <div className="toast">✅ Improvement applied!</div>
      )}
    </div>
  )
}

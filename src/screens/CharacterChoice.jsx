export default function CharacterChoice({ answers, path, setPath, goTo, onBack }) {
  const isNew = answers.experience === "No, I'm new 👋"

  const handleContinue = () => {
    if (path === 'A') {
      goTo('face_scan')
    } else {
      goTo('seed_selection')
    }
  }

  return (
    <div className="screen" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <div className="nav-bar">
        <button className="back-btn" onClick={onBack}>←</button>
        <span className="nav-title">Create your character</span>
      </div>

      {/* Content */}
      <div className="character-screen">
        {isNew && (
          <div className="character-rec-note">
            ✨ We recommend starting with <strong>Choose a look</strong> — it's faster and easier.
          </div>
        )}

        {!isNew && answers.experience && (
          <p className="character-subtitle">
            Most popular for creators like you ✦
          </p>
        )}

        <div className="character-cards">
          {/* Card A — That's me */}
          <div
            className={`character-card character-card-hero ${path === 'A' ? 'selected' : ''}`}
            onClick={() => setPath('A')}
          >
            {/* Hero photo */}
            <div className="card-hero-preview">
              <img
                src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=320&fit=crop&crop=face"
                alt="Happy person smiling"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {/* Subtle gradient so text below feels connected */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 48,
                background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.35))',
              }} />
            </div>

            {/* Card body */}
            <div className="character-card-body" style={{ padding: '14px 16px 16px' }}>
              <div className="character-card-header">
                <span className="character-card-title">That's me</span>
                <span className="character-badge badge-personal">Personal</span>
              </div>
              <p className="character-card-sub">
                Take 3 quick photos — left, forward, right — to create your exact AI twin
              </p>

              {/* Step pills */}
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                {['👈 Turn left', '😐 Forward', '👉 Turn right'].map((s, i) => (
                  <span key={i} style={{
                    fontSize: 11, fontWeight: 600,
                    background: path === 'A' ? 'rgba(40,91,176,0.12)' : 'var(--bg-deep)',
                    color: 'var(--text-secondary)',
                    borderRadius: 20, padding: '3px 10px',
                  }}>{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Card B */}
          <div
            className={`character-card ${path === 'B' ? 'selected' : ''}`}
            onClick={() => setPath('B')}
          >
            <div className="character-card-icon">🎭</div>
            <div className="character-card-body">
              <div className="character-card-header">
                <span className="character-card-title">Choose a look</span>
                <span className="character-badge badge-quick">Quick Start</span>
              </div>
              <p className="character-card-sub">
                Pick from AI-generated characters and customize your avatar
              </p>
            </div>
          </div>
        </div>

        <button className="btn-primary" onClick={handleContinue}>
          Continue
        </button>
      </div>
    </div>
  )
}

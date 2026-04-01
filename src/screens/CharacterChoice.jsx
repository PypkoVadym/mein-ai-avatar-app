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
          {/* Card A */}
          <div
            className={`character-card ${path === 'A' ? 'selected' : ''}`}
            onClick={() => setPath('A')}
          >
            <div className="character-card-icon">🤳</div>
            <div className="character-card-body">
              <div className="character-card-header">
                <span className="character-card-title">That's me</span>
                <span className="character-badge badge-personal">Personal</span>
              </div>
              <p className="character-card-sub">
                Record a short video to create your personal AI avatar
              </p>
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

const MY_AVATAR = {
  id: 'mine',
  name: 'My Avatar',
  style: 'Personal',
  emoji: '🧑‍💼',
  gradient: 'linear-gradient(135deg, #F4C5B0 0%, #C0513A 100%)',
  mine: true,
}

const PRESETS = [
  { id: 'sophia', name: 'Sophia',  style: 'Professional', emoji: '👩‍💼', gradient: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { id: 'marcus', name: 'Marcus',  style: 'Creative',     emoji: '🧑‍🎨', gradient: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { id: 'elena',  name: 'Elena',   style: 'Tech',         emoji: '👩‍💻', gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
  { id: 'jordan', name: 'Jordan',  style: 'Energetic',    emoji: '🧑‍🚀', gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
  { id: 'zoe',    name: 'Zoe',     style: 'Lifestyle',    emoji: '👩‍🎤', gradient: 'linear-gradient(135deg,#fa709a,#fee140)' },
  { id: 'alex',   name: 'Alex',    style: 'Business',     emoji: '🧑‍💼', gradient: 'linear-gradient(135deg,#a18cd1,#fbc2eb)' },
  { id: 'luna',   name: 'Luna',    style: 'Minimal',      emoji: '👩‍🦱', gradient: 'linear-gradient(135deg,#ffecd2,#fcb69f)' },
  { id: 'kai',    name: 'Kai',     style: 'Bold',         emoji: '🧑‍🦲', gradient: 'linear-gradient(135deg,#2d3436,#636e72)' },
]

export default function AvatarBrowser({ selectedAvatar, onSelect, onViewMine, goBack }) {
  const currentId = selectedAvatar?.id ?? 'mine'

  const handleSelect = (avatar) => {
    onSelect(avatar)
    goBack()
  }

  return (
    <div className="screen avb-screen">

      {/* Nav */}
      <div className="av-nav">
        <button className="back-btn" onClick={goBack}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="av-nav-title">Choose Avatar</span>
        <div style={{ width: 36 }} />
      </div>

      <div className="avb-scroll">

        {/* ── My Avatar ── */}
        <div className="avb-section-label">My Avatar</div>
        <div
          className={`avb-mine-card ${currentId === 'mine' ? 'selected' : ''}`}
          onClick={() => handleSelect(MY_AVATAR)}
        >
          <div className="avb-mine-thumb" style={{ background: MY_AVATAR.gradient }}>
            <span style={{ fontSize: 36 }}>{MY_AVATAR.emoji}</span>
            {currentId === 'mine' && <div className="avb-check">✓</div>}
          </div>
          <div className="avb-mine-info">
            <div className="avb-mine-name">My Avatar</div>
            <div className="avb-mine-sub">Personal · Created by you</div>
          </div>
          <button
            className="avb-view-btn"
            onClick={e => { e.stopPropagation(); onViewMine() }}
          >
            Details
          </button>
        </div>

        {/* ── Preset Avatars ── */}
        <div className="avb-section-label" style={{ marginTop: 8 }}>
          Preset Avatars
          <span className="avb-section-sub">AI-generated · free to use</span>
        </div>
        <div className="avb-grid">
          {PRESETS.map(avatar => {
            const active = currentId === avatar.id
            return (
              <div
                key={avatar.id}
                className={`avb-card ${active ? 'selected' : ''}`}
                onClick={() => handleSelect(avatar)}
              >
                <div className="avb-card-thumb" style={{ background: avatar.gradient }}>
                  <span style={{ fontSize: 32 }}>{avatar.emoji}</span>
                  {active && <div className="avb-check">✓</div>}
                </div>
                <div className="avb-card-name">{avatar.name}</div>
                <div className="avb-card-style">{avatar.style}</div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'

const SEEDS = [
  { id: 1, name: 'Sophia', desc: 'Professional · Confident', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', emoji: '👩‍💼' },
  { id: 2, name: 'Marcus', desc: 'Energetic · Creative',    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', emoji: '🧑‍🎨' },
  { id: 3, name: 'Elena',  desc: 'Sophisticated · Calm',    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', emoji: '👩‍💻' },
  { id: 4, name: 'Jordan', desc: 'Dynamic · Modern',        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', emoji: '🧑‍🚀' },
  { id: 5, name: 'Zoe',    desc: 'Vibrant · Engaging',      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', emoji: '👩‍🎤' },
  { id: 6, name: 'Alex',   desc: 'Expert · Authoritative',  gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', emoji: '🧑‍💼' },
]

export default function SeedSelection({ selectedSeed, setSelectedSeed, goTo, onBack }) {
  const [revealed, setRevealed] = useState([])
  const [badgesVisible, setBadgesVisible] = useState([])

  useEffect(() => {
    SEEDS.forEach((seed, i) => {
      const revealDelay = 300 + i * 300
      const badgeDelay = revealDelay + 400

      setTimeout(() => {
        setRevealed(prev => [...prev, seed.id])
      }, revealDelay)

      setTimeout(() => {
        setBadgesVisible(prev => [...prev, seed.id])
      }, badgeDelay)
    })
  }, [])

  const selected = selectedSeed
  const selectedInfo = SEEDS.find(s => s.id === selected)

  const btnLabel = selectedInfo
    ? `Create based on ${selectedInfo.name} →`
    : 'Choose a character →'

  return (
    <div className="screen" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <div className="nav-bar">
        <button className="back-btn" onClick={onBack}>←</button>
        <span className="nav-title">Choose a look</span>
      </div>

      <div className="seed-screen">
        {/* Banner */}
        <div className="seed-banner">✦ Generated just for you.</div>

        {/* Grid */}
        <div className="seed-grid">
          {SEEDS.map(seed => {
            const isRevealed = revealed.includes(seed.id)
            const isBadge = badgesVisible.includes(seed.id)
            const isSelected = selected === seed.id

            if (!isRevealed) {
              return <div key={seed.id} className="seed-card-skeleton" />
            }

            return (
              <div
                key={seed.id}
                className={`seed-card revealed ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedSeed(isSelected ? null : seed.id)}
              >
                <div
                  className="seed-card-inner"
                  style={{ background: seed.gradient }}
                >
                  <span className="seed-card-emoji">{seed.emoji}</span>

                  <div className={`seed-card-badge ${isBadge ? 'visible' : ''}`}>
                    <span className="tag-for-you">FOR YOU</span>
                  </div>

                  <div>
                    <div className="seed-card-name">{seed.name}</div>
                    <div className="seed-card-desc">{seed.desc}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Info box */}
        <div className="seed-infobox">
          🔒 We'll create a unique character based on this look. The seed is never reused.
        </div>

        {/* CTA */}
        <div className="seed-bottom">
          <button
            className="btn-primary"
            disabled={!selected}
            onClick={() => goTo('voice')}
          >
            {btnLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

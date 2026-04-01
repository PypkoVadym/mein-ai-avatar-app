import { useState, useEffect, useRef } from 'react'

const FEMALE_VOICES = [
  { id: 'soft',    name: 'Soft',    desc: 'warm, trustworthy',      forYou: true },
  { id: 'clear',   name: 'Clear',   desc: 'articulate, professional' },
  { id: 'vibrant', name: 'Vibrant', desc: 'energetic, engaging' },
  { id: 'firm',    name: 'Firm',    desc: 'confident, professional' },
]

const MALE_VOICES = [
  { id: 'neutral',  name: 'Neutral',  desc: 'clear, universal',      forYou: true },
  { id: 'energetic',name: 'Energetic',desc: 'lively, dynamic' },
  { id: 'calm',     name: 'Calm',     desc: 'gentle, thoughtful' },
  { id: 'expert',   name: 'Expert',   desc: 'authoritative, business' },
]

const NICHE_PROMPTS = {
  'Technology 💻':         "Today we'll look at how neural networks work — simply and clearly.",
  'Business & Finance 📈': 'Let me share three things that changed how I think about money.',
  'Education 📚':          'I\'ll explain this topic so it makes sense in under two minutes.',
  'Lifestyle 🌿':          'Sharing what actually works in my life — no filters.',
}

function WaveformBars({ playing }) {
  return (
    <div className="waveform">
      {[4, 10, 14, 8, 6].map((h, i) => (
        <div
          key={i}
          className="waveform-bar"
          style={{ height: playing ? undefined : `${h}px` }}
        />
      ))}
    </div>
  )
}

function VoiceCard({ voice, isSelected, isPlaying, onSelect, onPlay }) {
  return (
    <div
      className={`voice-card ${isSelected ? 'selected' : ''} ${isPlaying ? 'playing' : ''}`}
      onClick={onSelect}
    >
      <div className="voice-card-header">
        <div className="voice-card-info">
          <div className="voice-card-name">{voice.name}</div>
          <div className="voice-card-desc">{voice.desc}</div>
        </div>
        {voice.forYou && (
          <div className="voice-card-badge">For You</div>
        )}
      </div>
      <div className="voice-card-footer">
        <button
          className="voice-play-btn"
          onClick={(e) => { e.stopPropagation(); onPlay() }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <WaveformBars playing={isPlaying} />
      </div>
    </div>
  )
}

export default function VoiceSelection({
  gender, setGender, answers, selectedVoice, setSelectedVoice, goTo, onBack,
}) {
  const [playingId, setPlayingId] = useState(null)
  const [micRecording, setMicRecording] = useState(false)
  const [recordingDone, setRecordingDone] = useState(false)
  const playTimerRef = useRef(null)
  const micTimerRef = useRef(null)

  const voices = gender === 'female' ? FEMALE_VOICES : MALE_VOICES

  // Determine prompt from niches
  const niches = answers.niches || []
  let prompt = NICHE_PROMPTS['Lifestyle 🌿'] // default fallback
  for (const n of niches) {
    if (NICHE_PROMPTS[n]) { prompt = NICHE_PROMPTS[n]; break }
  }
  if (!niches.length) prompt = 'Hi! I create content about what matters and interests me.'

  const handlePlay = (id) => {
    clearTimeout(playTimerRef.current)
    if (playingId === id) {
      setPlayingId(null)
      return
    }
    setPlayingId(id)
    playTimerRef.current = setTimeout(() => setPlayingId(null), 3000)
  }

  const handleMicStart = () => {
    setMicRecording(true)
    setRecordingDone(false)
    micTimerRef.current = setTimeout(() => {
      setMicRecording(false)
      setRecordingDone(true)
      setSelectedVoice('own')
    }, 5000)
  }

  const handleRecordAgain = () => {
    clearTimeout(micTimerRef.current)
    setRecordingDone(false)
    setMicRecording(false)
    if (selectedVoice === 'own') setSelectedVoice(null)
  }

  useEffect(() => () => {
    clearTimeout(playTimerRef.current)
    clearTimeout(micTimerRef.current)
  }, [])

  const canContinue = !!selectedVoice

  return (
    <div className="screen" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <div className="nav-bar">
        <button className="back-btn" onClick={onBack}>←</button>
        <span className="nav-title">Choose your voice</span>
      </div>

      <div className="voice-screen">
        {/* Gender toggle */}
        <div className="gender-toggle">
          <button
            className={`gender-btn ${gender === 'female' ? 'active' : ''}`}
            onClick={() => { setGender('female'); setSelectedVoice(null) }}
          >
            Female
          </button>
          <button
            className={`gender-btn ${gender === 'male' ? 'active' : ''}`}
            onClick={() => { setGender('male'); setSelectedVoice(null) }}
          >
            Male
          </button>
        </div>
        <p className="gender-label">Showing {gender} voices</p>

        {/* Voice grid */}
        <div className="voice-grid">
          {voices.map(voice => (
            <VoiceCard
              key={voice.id}
              voice={voice}
              isSelected={selectedVoice === voice.id}
              isPlaying={playingId === voice.id}
              onSelect={() => setSelectedVoice(voice.id)}
              onPlay={() => handlePlay(voice.id)}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="voice-divider">
          <div className="voice-divider-line" />
          <span className="voice-divider-text">or record your own</span>
          <div className="voice-divider-line" />
        </div>

        {/* Prompt */}
        <div className="voice-prompt-block">
          <div className="voice-prompt-label">Read aloud</div>
          <div className="voice-prompt-text">"{prompt}"</div>
        </div>

        {/* Mic button / player */}
        {!recordingDone ? (
          <>
            <div className="mic-btn-area">
              <button
                className={`mic-btn ${micRecording ? 'recording' : ''}`}
                onClick={!micRecording ? handleMicStart : undefined}
                disabled={micRecording}
              >
                🎤
              </button>
            </div>
            {micRecording && (
              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
                Recording… speak clearly
              </p>
            )}
          </>
        ) : (
          <>
            <div className="voice-recording-player">
              <span style={{ fontSize: 20 }}>🎤</span>
              <div className="player-progress">
                <div className="player-progress-fill" />
              </div>
              <span className="player-time">0:05</span>
            </div>
            <button className="record-again-btn" onClick={handleRecordAgain}>
              Record again
            </button>
          </>
        )}

        {/* Spacer for fixed button */}
        <div style={{ height: 80 }} />
      </div>

      {/* Fixed Continue */}
      <div className="voice-bottom">
        <button
          className="btn-primary"
          disabled={!canContinue}
          onClick={() => goTo('generation')}
        >
          Continue →
        </button>
      </div>
    </div>
  )
}

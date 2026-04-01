import { useState, useEffect, useRef } from 'react'

// ── Data ──────────────────────────────────────────────────────────────────────

const SEEDS = [
  { id: 1, name: 'Sophia', desc: 'Professional',  gradient: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { id: 2, name: 'Marcus', desc: 'Energetic',     gradient: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { id: 3, name: 'Elena',  desc: 'Calm',          gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
  { id: 4, name: 'Jordan', desc: 'Dynamic',       gradient: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
  { id: 5, name: 'Zoe',    desc: 'Vibrant',       gradient: 'linear-gradient(135deg,#fa709a,#fee140)' },
  { id: 6, name: 'Alex',   desc: 'Authoritative', gradient: 'linear-gradient(135deg,#a18cd1,#fbc2eb)' },
]

const MALE_VOICES   = [
  { id: 'neutral',   name: 'Neutral',   desc: 'Clear, universal',    forYou: true },
  { id: 'energetic', name: 'Energetic', desc: 'Lively, dynamic' },
  { id: 'calm',      name: 'Calm',      desc: 'Gentle, thoughtful' },
  { id: 'expert',    name: 'Expert',    desc: 'Authoritative' },
]
const FEMALE_VOICES = [
  { id: 'soft',    name: 'Soft',    desc: 'Warm, trustworthy', forYou: true },
  { id: 'clear',   name: 'Clear',   desc: 'Articulate, pro' },
  { id: 'vibrant', name: 'Vibrant', desc: 'Energetic, engaging' },
  { id: 'firm',    name: 'Firm',    desc: 'Confident, pro' },
]

const SCAN_STEPS = [
  { emoji: '👈', label: 'Turn left' },
  { emoji: '😐', label: 'Forward' },
  { emoji: '👉', label: 'Turn right' },
]

const FORMATS = ['TikTok · 15s', 'Reel · 30s', 'YouTube Short', 'TED Talk · 3min']
const GEN_STEPS_AVATAR = ['Processing input', 'Analysing features', 'Generating avatar', 'Final rendering', 'Deleting source files']
const GEN_STEPS_VIDEO  = ['Content moderation', 'Writing script', 'Generating video', 'Adding AI watermark']

// ── Helpers ───────────────────────────────────────────────────────────────────

function WaveBars({ playing, color = 'var(--border)' }) {
  const heights = [6, 10, 14, 9, 12, 7, 11, 8, 13, 6, 10, 14]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 16 }}>
      {heights.map((h, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 2, background: color,
          height: playing ? 14 : h,
          ...(playing ? { animation: `vpa .55s ease-in-out ${i * 0.07}s infinite alternate` } : {}),
        }} />
      ))}
    </div>
  )
}

function GenProgress({ steps, progress, done }) {
  const activeIdx = done ? steps.length : Math.floor((progress / 100) * steps.length)
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: 16, marginBottom: 16 }}>
      <div style={{ height: 4, background: 'var(--bg-deep)', borderRadius: 2, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ height: '100%', background: 'var(--text)', borderRadius: 2, width: `${progress}%`, transition: 'width 1.2s ease' }} />
      </div>
      {steps.map((s, i) => {
        const isDone = i < activeIdx
        const isActive = i === activeIdx && !done
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '7px 0', borderBottom: i < steps.length - 1 ? '1px solid var(--bg-deep)' : 'none',
            fontSize: 13, color: isDone || isActive ? 'var(--text)' : 'var(--text-secondary)',
            fontWeight: isActive ? 600 : 400,
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: isDone ? 'var(--green)' : isActive ? 'var(--text)' : 'var(--border)',
              animation: isActive ? 'gpa 1s ease-in-out infinite' : 'none',
            }} />
            {s}
          </div>
        )
      })}
    </div>
  )
}

// ── Sheet primitives ──────────────────────────────────────────────────────────

function Sheet({ open, children }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: 'var(--bg)', borderRadius: '24px 24px 0 0',
      zIndex: 210,
      transform: open ? 'translateY(0)' : 'translateY(100%)',
      transition: 'transform .36s cubic-bezier(.32,0,.15,1)',
      maxHeight: '92%',
      display: 'flex', flexDirection: 'column',
      pointerEvents: open ? 'all' : 'none',
    }}>
      {children}
    </div>
  )
}

const Handle = () => (
  <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '12px auto 0', flexShrink: 0 }} />
)
const STitle = ({ children }) => (
  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', padding: '16px 0 4px', lineHeight: 1.25 }}>{children}</div>
)
const SSub = ({ children }) => (
  <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 18 }}>{children}</div>
)
const SScroll = ({ children }) => (
  <div style={{ flex: 1, overflowY: 'auto', padding: '0 22px', scrollbarWidth: 'none' }}>{children}</div>
)
const SSticky = ({ children }) => (
  <div style={{ padding: '12px 22px 36px', background: 'linear-gradient(to top, var(--bg) 70%, transparent)', flexShrink: 0 }}>
    {children}
  </div>
)

// ── Main ──────────────────────────────────────────────────────────────────────

export default function V2App() {
  const [activeTab,    setActiveTab]    = useState('generate')
  const [avatar,       setAvatar]       = useState(null)
  const [activeSheet,  setActiveSheet]  = useState(null)

  const goSheet  = (id) => setActiveSheet(id)
  const closeSheet = ()  => setActiveSheet(null)

  // Path
  const [path, setPath] = useState('A')

  // Scan
  const [scanStep,     setScanStep]     = useState(0)
  const [scanCaptured, setScanCaptured] = useState([false, false, false])
  const [scanFlash,    setScanFlash]    = useState(false)
  const scanDone = scanCaptured.every(Boolean)

  // Consent
  const [consent1, setConsent1] = useState(false)
  const [consent2, setConsent2] = useState(false)

  // Seed
  const [selectedSeed, setSelectedSeed] = useState(null)

  // Voice preset
  const [gender,        setGender]        = useState('male')
  const [selectedVoice, setSelectedVoice] = useState('neutral')
  const [playingVoice,  setPlayingVoice]  = useState(null)
  const playTimerRef = useRef(null)

  // Voice recording
  const [vrecState, setVrecState] = useState('idle') // idle | recording | done
  const [vrecSec,   setVrecSec]   = useState(0)
  const vrecTimerRef = useRef(null)

  // Avatar gen
  const [avatarGenProgress, setAvatarGenProgress] = useState(0)
  const [avatarGenDone,     setAvatarGenDone]     = useState(false)

  // Prompt / format
  const [prompt,     setPrompt]     = useState('')
  const [format,     setFormat]     = useState('TikTok · 15s')
  const [variations, setVariations] = useState('1 video')

  // Video gen
  const [videoGenProgress, setVideoGenProgress] = useState(0)
  const [videoGenDone,     setVideoGenDone]     = useState(false)
  const [recentVideos, setRecentVideos] = useState([])

  // ── Scan ──────────────────────────────────────────────────────────────────

  const takePhoto = () => {
    setScanFlash(true)
    setTimeout(() => setScanFlash(false), 180)
    const next = scanCaptured.map((v, i) => i === scanStep ? true : v)
    setScanCaptured(next)
    if (scanStep < 2) setTimeout(() => setScanStep(s => s + 1), 450)
    else setTimeout(() => goSheet('sh-consent'), 600)
  }

  const resetScan = () => {
    setScanStep(0); setScanCaptured([false, false, false])
    setScanFlash(false); setConsent1(false); setConsent2(false)
  }

  // ── Voice recording ────────────────────────────────────────────────────────

  const toggleVrec = () => {
    if (vrecState === 'recording') {
      clearInterval(vrecTimerRef.current)
      setVrecState('done')
    } else {
      setVrecState('recording')
      setVrecSec(0)
      vrecTimerRef.current = setInterval(() => setVrecSec(s => s + 1), 1000)
    }
  }

  useEffect(() => () => {
    clearInterval(vrecTimerRef.current)
    clearTimeout(playTimerRef.current)
  }, [])

  const fmtSec = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`

  // ── Voice preset play ─────────────────────────────────────────────────────

  const playVoice = (id) => {
    if (playingVoice === id) { setPlayingVoice(null); clearTimeout(playTimerRef.current) }
    else {
      setPlayingVoice(id)
      clearTimeout(playTimerRef.current)
      playTimerRef.current = setTimeout(() => setPlayingVoice(null), 2500)
    }
  }

  // ── Avatar creation ──────────────────────────────────────────────────────

  const handlePathNext = () => goSheet(path === 'A' ? 'sh-scan' : 'sh-seed')

  const handleConsentNext = () => goSheet('sh-voice')

  const handleSeedNext = () => goSheet('sh-voice')

  const handleVoiceNext = () => {
    goSheet('sh-gen')
    setAvatarGenProgress(0); setAvatarGenDone(false)
    let p = 0
    const t = setInterval(() => {
      p += 19 + Math.random() * 5
      if (p >= 100) { p = 100; clearInterval(t); setAvatarGenDone(true) }
      setAvatarGenProgress(Math.min(p, 100))
    }, 800)
  }

  const handleAvatarDone = () => {
    const seed = SEEDS.find(s => s.id === selectedSeed)
    const v    = (gender === 'male' ? MALE_VOICES : FEMALE_VOICES).find(v => v.id === selectedVoice)
    setAvatar({
      name: path === 'A' ? 'My Avatar' : (seed?.name || 'Avatar'),
      meta: `Ready · ${gender === 'male' ? 'Male' : 'Female'} · ${vrecState === 'done' ? 'Custom' : v?.name} voice`,
      gradient: path === 'A' ? 'linear-gradient(135deg,#F4C5B0,#C0513A)' : (seed?.gradient || 'linear-gradient(135deg,#667eea,#764ba2)'),
      symbol: path === 'A' ? '🧑‍💼' : seed?.name[0] || '✦',
    })
    closeSheet(); resetScan()
    setVrecState('idle'); setVrecSec(0)
  }

  // ── Video generation ─────────────────────────────────────────────────────

  const handleGenerate = () => {
    goSheet('sh-vgen')
    setVideoGenProgress(0); setVideoGenDone(false)
    let p = 0
    const t = setInterval(() => {
      p += 24 + Math.random() * 5
      if (p >= 100) { p = 100; clearInterval(t); setVideoGenDone(true) }
      setVideoGenProgress(Math.min(p, 100))
    }, 700)
  }

  const handleVideoClose = () => {
    setRecentVideos(v => [{ id: Date.now(), gradient: 'linear-gradient(160deg,#3A3835,#1A1916)' }, ...v])
    setPrompt(''); closeSheet()
  }

  const voices = gender === 'male' ? MALE_VOICES : FEMALE_VOICES

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', background: 'var(--bg)' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 22px 12px', flexShrink: 0 }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>TWIN</span>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16 }}>☰</div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 22px 20px', scrollbarWidth: 'none' }}>

        {!avatar ? (
          <div onClick={() => goSheet('sh-path')} style={{
            background: 'var(--text)', borderRadius: 24, padding: '28px 24px',
            textAlign: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg,transparent 30%,rgba(255,255,255,.04) 50%,transparent 70%)', backgroundSize: '200% 100%', animation: 'shimmer 2.5s linear infinite' }} />
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,.08)', border: '2px dashed rgba(255,255,255,.2)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>✦</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#FAFAF8', marginBottom: 8 }}>Create your character</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', lineHeight: 1.6 }}>Tap to set up your AI avatar.<br />You only do this once.</div>
            <div style={{ marginTop: 22, padding: '13px 24px', borderRadius: 12, background: '#FAFAF8', color: 'var(--text)', fontSize: 14, fontWeight: 600, display: 'inline-block' }}>Get started →</div>
          </div>
        ) : (
          <>
            {/* Avatar card */}
            <div onClick={() => goSheet('sh-path')} style={{ background: 'var(--text)', borderRadius: 24, marginBottom: 18, overflow: 'hidden', cursor: 'pointer' }}>
              <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: avatar.gradient }}>
                <span style={{ fontSize: 64 }}>{avatar.symbol}</span>
              </div>
              <div style={{ padding: '16px 20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#FAFAF8' }}>{avatar.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 3 }}>{avatar.meta}</div>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', padding: '6px 12px', borderRadius: 20, border: '1px solid rgba(255,255,255,.15)' }}>Change</div>
              </div>
            </div>

            {/* Prompt card */}
            <div onClick={() => goSheet('sh-prompt')} style={{
              borderRadius: 20, overflow: 'visible', marginBottom: 12, cursor: 'pointer',
              background: prompt ? '#fff' : 'linear-gradient(135deg, #285BB0 0%, #3B7DD8 100%)',
              border: prompt ? '1.5px solid var(--border)' : 'none',
              position: 'relative',
              boxShadow: prompt ? 'none' : '0 4px 20px rgba(40,91,176,.45)',
              animation: prompt ? 'none' : 'promptPulse 2s ease-in-out infinite',
            }}>
              {/* Pulse rings */}
              {!prompt && <>
                <div style={{ position: 'absolute', inset: -5, borderRadius: 25, border: '2px solid rgba(40,91,176,.5)', opacity: 0, animation: 'ringOut 2s ease-out infinite', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', inset: -5, borderRadius: 25, border: '2px solid rgba(40,91,176,.5)', opacity: 0, animation: 'ringOut 2s ease-out .7s infinite', pointerEvents: 'none' }} />
              </>}
              <div style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: prompt ? 'var(--text-secondary)' : 'rgba(255,255,255,.7)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Your idea</div>
                  {!prompt && <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}>Tap here <span style={{ display: 'inline-block', animation: 'nudge .8s ease-in-out infinite' }}>→</span></div>}
                </div>
                <div style={{ fontSize: 16, fontWeight: prompt ? 400 : 600, color: prompt ? 'var(--text)' : '#fff', lineHeight: 1.5 }}>
                  {prompt || 'What's your video about?'}
                </div>
              </div>
            </div>
            <button onClick={() => prompt ? handleGenerate() : goSheet('sh-prompt')} style={{
              width: '100%', padding: 16, borderRadius: 16, border: 'none', cursor: 'pointer',
              background: prompt ? 'var(--text)' : 'var(--border)',
              color: prompt ? '#FAFAF8' : 'var(--text-secondary)',
              fontSize: 15, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 16 16"><polygon points="3,2 14,8 3,14" fill={prompt ? '#fff' : '#9B9894'} /></svg>
              Generate video
            </button>

            {recentVideos.length > 0 && <>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.06em', margin: '20px 0 12px' }}>Recent</div>
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
                {recentVideos.map(v => (
                  <div key={v.id} style={{ flexShrink: 0, width: 100, aspectRatio: '9/16', borderRadius: 14, overflow: 'hidden', position: 'relative', background: v.gradient }}>
                    <div style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(0,0,0,.5)', borderRadius: 8, padding: '2px 6px', fontSize: 8, fontWeight: 700, color: '#fff' }}>AI</div>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 0, height: 0, borderStyle: 'solid', borderWidth: '5px 0 5px 9px', borderColor: 'transparent transparent transparent rgba(255,255,255,.9)', marginLeft: 2 }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>}
          </>
        )}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderTop: '0.5px solid var(--border)', padding: '10px 0 28px', flexShrink: 0, background: 'var(--bg)' }}>
        {[{ id: 'generate', icon: '✦', label: 'Generate' }, { id: 'library', icon: '▶', label: 'Library' }, { id: 'account', icon: '☰', label: 'Account' }].map(t => (
          <div key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: activeTab === t.id ? 'var(--text)' : 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: activeTab === t.id ? '#fff' : 'var(--text-secondary)' }}>{t.icon}</div>
            <div style={{ fontSize: 10, color: activeTab === t.id ? 'var(--text)' : 'var(--text-secondary)', fontWeight: activeTab === t.id ? 600 : 500 }}>{t.label}</div>
          </div>
        ))}
      </div>

      {/* Overlay */}
      {activeSheet && (
        <div onClick={closeSheet} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200 }} />
      )}

      {/* ══════════════════════════════════════
          SH-PATH — Choose path
      ══════════════════════════════════════ */}
      <Sheet open={activeSheet === 'sh-path'}>
        <Handle />
        <SScroll>
          <STitle>Create your character</STitle>
          <SSub>You only do this once — after this, just type and your video is ready.</SSub>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {[
              { id: 'A', icon: '🤳', bg: 'var(--blue-light)', title: "That's me", desc: "Take 3 quick photos. We'll build your personal avatar.", tag: 'Personal avatar', tagC: 'var(--blue)', tagBg: 'var(--blue-light)' },
              { id: 'B', icon: '✦',  bg: 'var(--green-light)', title: 'Choose a look', desc: 'Pick a seed image — we generate a unique character.', tag: 'Seed-based', tagC: 'var(--green)', tagBg: 'var(--green-light)' },
            ].map(c => (
              <div key={c.id} onClick={() => setPath(c.id)} style={{
                background: '#fff', borderRadius: 18, padding: 16, cursor: 'pointer',
                display: 'flex', gap: 14, alignItems: 'flex-start',
                border: `1.5px solid ${path === c.id ? 'var(--text)' : 'var(--border)'}`,
                boxShadow: path === c.id ? '0 0 0 3px rgba(26,25,22,.07)' : 'none',
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 13, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{c.icon}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{c.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c.desc}</div>
                  <span style={{ display: 'inline-block', marginTop: 7, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 7, background: c.tagBg, color: c.tagC }}>{c.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </SScroll>
        <SSticky>
          <button className="btn-primary" onClick={handlePathNext}>
            {path === 'A' ? 'Continue with face scan →' : 'Continue with seed →'}
          </button>
        </SSticky>
      </Sheet>

      {/* ══════════════════════════════════════
          SH-SCAN — Camera / 3 photos
      ══════════════════════════════════════ */}
      <Sheet open={activeSheet === 'sh-scan'}>
        <Handle />
        <SScroll>
          <STitle>Take 3 photos</STitle>
          <SSub>Position your face in the oval and tap the shutter.</SSub>

          {/* Full-width camera viewfinder */}
          <div style={{
            width: '100%', aspectRatio: '3/4', maxHeight: 340,
            borderRadius: 20, overflow: 'hidden',
            background: '#0a0a0f', position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
          }}>
            {/* Flash */}
            {scanFlash && <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: .85, animation: 'camFlash .2s ease forwards', zIndex: 10 }} />}

            {/* Grid */}
            {['33%','66%'].map(p => <div key={'v'+p} style={{ position: 'absolute', left: p, top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,.07)', pointerEvents: 'none' }} />)}
            {['33%','66%'].map(p => <div key={'h'+p} style={{ position: 'absolute', top: p, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,.07)', pointerEvents: 'none' }} />)}

            {/* Corner brackets */}
            {[
              { top: 12, left: 12,  borderTop: '2px solid rgba(255,255,255,.65)', borderLeft:  '2px solid rgba(255,255,255,.65)' },
              { top: 12, right: 12, borderTop: '2px solid rgba(255,255,255,.65)', borderRight: '2px solid rgba(255,255,255,.65)' },
              { bottom: 12, left: 12,  borderBottom: '2px solid rgba(255,255,255,.65)', borderLeft:  '2px solid rgba(255,255,255,.65)' },
              { bottom: 12, right: 12, borderBottom: '2px solid rgba(255,255,255,.65)', borderRight: '2px solid rgba(255,255,255,.65)' },
            ].map((s, i) => <div key={i} style={{ position: 'absolute', width: 20, height: 20, ...s }} />)}

            {/* Face oval */}
            <div style={{
              width: '42%', aspectRatio: '2/3',
              border: '2px dashed rgba(255,255,255,.4)', borderRadius: '50%',
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-54%)',
            }} />

            {/* Step indicators (bottom strip) */}
            <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14, display: 'flex', gap: 8 }}>
              {SCAN_STEPS.map((s, i) => (
                <div key={i} style={{
                  flex: 1, borderRadius: 12, padding: '8px 4px', textAlign: 'center',
                  background: scanCaptured[i]
                    ? 'rgba(74,222,128,.25)' : i === scanStep
                    ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.07)',
                  border: i === scanStep && !scanCaptured[i] ? '1px solid rgba(255,255,255,.3)' : '1px solid transparent',
                }}>
                  <div style={{ fontSize: 18 }}>{scanCaptured[i] ? '✅' : s.emoji}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.8)', marginTop: 3, fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Shutter */}
            {!scanDone && (
              <button onClick={takePhoto} style={{
                position: 'absolute', bottom: 70,
                width: 58, height: 58, borderRadius: '50%',
                background: 'transparent', border: '3.5px solid #fff',
                padding: 3, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#fff' }} />
              </button>
            )}
          </div>

          {/* Counter */}
          {!scanDone && (
            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Photo {scanStep + 1} of 3
            </div>
          )}
          {scanDone && (
            <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 600, color: 'var(--green)', marginBottom: 4 }}>
              All photos taken ✓
            </div>
          )}
        </SScroll>
        <SSticky>
          <button className="btn-primary" disabled={!scanDone} onClick={() => goSheet('sh-consent')}>
            {scanDone ? 'Continue →' : `Photo ${scanStep + 1} of 3`}
          </button>
        </SSticky>
      </Sheet>

      {/* ══════════════════════════════════════
          SH-CONSENT — Biometric consent
      ══════════════════════════════════════ */}
      <Sheet open={activeSheet === 'sh-consent'}>
        <Handle />
        <SScroll>
          <STitle>Before we continue</STitle>
          <SSub>We need your consent before processing your photos.</SSub>
          {[
            { key: 'c1', val: consent1, set: setConsent1, text: 'I consent to processing my biometric data (photos) to create an AI avatar', link: 'Privacy Policy' },
            { key: 'c2', val: consent2, set: setConsent2, text: 'This avatar is for my personal use only' },
          ].map(c => (
            <div key={c.key} onClick={() => c.set(v => !v)} style={{
              display: 'flex', gap: 12, alignItems: 'flex-start',
              padding: '14px 16px', background: '#fff',
              borderRadius: 14, border: `1.5px solid ${c.val ? 'var(--text)' : 'var(--border)'}`,
              cursor: 'pointer', marginBottom: 10,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                border: `1.5px solid ${c.val ? 'var(--text)' : 'var(--border)'}`,
                background: c.val ? 'var(--text)' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {c.val && <svg width="11" height="8" viewBox="0 0 11 8" fill="none"><polyline points="1,4 4,7 10,1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>
                {c.text}{c.link && <> — <span style={{ color: 'var(--blue)' }}>{c.link}</span></>}
              </div>
            </div>
          ))}

          {/* Privacy note */}
          <div style={{ background: 'var(--bg-deep)', borderRadius: 12, padding: '12px 14px', display: 'flex', gap: 10, marginTop: 4 }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>🔒</span>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Your photos are processed securely and <strong style={{ color: 'var(--text)' }}>deleted after avatar creation</strong>. We never share your data.
            </div>
          </div>
        </SScroll>
        <SSticky>
          <button className="btn-primary" disabled={!consent1 || !consent2} onClick={handleConsentNext}>
            I agree — choose my voice →
          </button>
        </SSticky>
      </Sheet>

      {/* ══════════════════════════════════════
          SH-SEED — Seed selection
      ══════════════════════════════════════ */}
      <Sheet open={activeSheet === 'sh-seed'}>
        <Handle />
        <SScroll>
          <STitle>Choose a look</STitle>
          <div style={{ background: 'var(--text)', borderRadius: 14, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 16 }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>✦</span>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.8)', lineHeight: 1.6 }}><strong style={{ color: '#fff' }}>Generated just for you.</strong> These looks are shown to no one else.</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9, marginBottom: 14 }}>
            {SEEDS.map(seed => (
              <div key={seed.id} onClick={() => setSelectedSeed(seed.id)} style={{
                borderRadius: 14, overflow: 'hidden', position: 'relative', aspectRatio: '3/4', cursor: 'pointer',
                background: seed.gradient, boxShadow: selectedSeed === seed.id ? '0 0 0 3px var(--text)' : 'none',
              }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 55%)' }} />
                <div style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(0,0,0,.4)', borderRadius: 20, padding: '2px 7px', fontSize: 9, fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '.04em' }}>For you</div>
                {selectedSeed === seed.id && (
                  <div style={{ position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: '50%', background: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><polyline points="1,3.5 3,5.5 8,1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: 0, padding: '7px 8px 9px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{seed.name}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.7)', marginTop: 1 }}>{seed.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', padding: '10px 13px', display: 'flex', gap: 9 }}>
            <span style={{ fontSize: 13, flexShrink: 0 }}>🔒</span>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>We'll create a character <strong style={{ color: 'var(--text)' }}>similar to this look, but unique</strong> — yours only.</div>
          </div>
        </SScroll>
        <SSticky>
          <button className="btn-primary" disabled={!selectedSeed} onClick={handleSeedNext}>
            {selectedSeed ? `Continue with ${SEEDS.find(s => s.id === selectedSeed)?.name} →` : 'Select a look first'}
          </button>
        </SSticky>
      </Sheet>

      {/* ══════════════════════════════════════
          SH-VOICE — Voice selection
      ══════════════════════════════════════ */}
      <Sheet open={activeSheet === 'sh-voice'}>
        <Handle />
        <SScroll>
          <STitle>Choose a voice</STitle>
          <SSub>It'll narrate your videos. Listen to each or record your own.</SSub>

          {/* Gender toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Voice type</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Showing {gender} voices</div>
            </div>
            <div style={{ display: 'flex', background: 'var(--bg-deep)', borderRadius: 10, padding: 3 }}>
              {['female','male'].map(g => (
                <div key={g} onClick={() => { setGender(g); setSelectedVoice(g === 'male' ? 'neutral' : 'soft') }} style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize',
                  background: gender === g ? 'var(--text)' : 'transparent',
                  color: gender === g ? '#F7F5F0' : 'var(--text-secondary)',
                }}>{g}</div>
              ))}
            </div>
          </div>

          {/* Voice grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 16, opacity: vrecState === 'done' ? .45 : 1, transition: 'opacity .2s' }}>
            {voices.map(v => (
              <div key={v.id} onClick={() => { if (vrecState !== 'done') { setSelectedVoice(v.id) } }} style={{
                background: '#fff', borderRadius: 14, padding: '12px 12px 10px', cursor: 'pointer', position: 'relative',
                border: `1.5px solid ${selectedVoice === v.id && vrecState !== 'done' ? 'var(--text)' : 'var(--border)'}`,
                boxShadow: selectedVoice === v.id && vrecState !== 'done' ? '0 0 0 3px rgba(26,25,22,.07)' : 'none',
              }}>
                {v.forYou && <div style={{ position: 'absolute', top: -1, right: 10, background: 'var(--text)', color: '#F7F5F0', fontSize: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', padding: '2px 7px', borderRadius: '0 0 6px 6px' }}>For you</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{v.name}</div>
                  <div onClick={e => { e.stopPropagation(); playVoice(v.id) }} style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    border: '1.5px solid var(--border)',
                    background: playingVoice === v.id ? 'var(--text)' : 'var(--bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}>
                    <div style={{ width: 0, height: 0, borderStyle: 'solid', borderWidth: '3.5px 0 3.5px 6px', borderColor: `transparent transparent transparent ${playingVoice === v.id ? '#fff' : 'var(--text-secondary)'}`, marginLeft: 1 }} />
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>{v.desc}</div>
                <WaveBars playing={playingVoice === v.id} />
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 14px' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>or record your own</div>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Voice recording box */}
          <div style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${vrecState === 'done' ? 'var(--text)' : 'var(--border)'}`, padding: '14px 16px', marginBottom: 8 }}>
            {/* Sample prompt */}
            <div style={{ background: 'var(--bg-deep)', borderRadius: 9, padding: '8px 11px', fontSize: 12, color: 'var(--text)', fontStyle: 'italic', lineHeight: 1.55, marginBottom: 12 }}>
              "Today we'll look at how neural networks work — simply and clearly."
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Mic button */}
              <button onClick={toggleVrec} style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0, border: 'none', cursor: 'pointer',
                background: vrecState === 'recording' ? '#E53935' : vrecState === 'done' ? 'var(--green)' : 'var(--text)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: vrecState === 'recording' ? 'recPulse 1.2s ease-in-out infinite' : 'none',
              }}>
                {vrecState === 'done'
                  ? <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><polyline points="1,6 5.5,10.5 15,1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  : <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
                      <rect x="3.5" y="0" width="5" height="10" rx="2.5" fill="#fff" />
                      <path d="M1 7.5C1 10.538 3.238 13 6 13s5-2.462 5-5.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="6" y1="13" x2="6" y2="16" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                }
              </button>

              {/* Waveform / status */}
              <div style={{ flex: 1 }}>
                {vrecState === 'idle' && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Tap to record your voice</div>}
                {vrecState === 'recording' && <WaveBars playing={true} color="var(--text)" />}
                {vrecState === 'done' && <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)' }}>Recording saved ✓</div>}
              </div>

              {/* Timer / reset */}
              {vrecState === 'recording' && (
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, minWidth: 32 }}>{fmtSec(vrecSec)}</div>
              )}
              {vrecState === 'done' && (
                <div onClick={() => { setVrecState('idle'); setVrecSec(0) }} style={{ fontSize: 11, color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px 8px', borderRadius: 8, border: '1px solid var(--border)' }}>Redo</div>
              )}
            </div>
          </div>

          {vrecState === 'done' && (
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 4 }}>Your recorded voice will be used instead of a preset</div>
          )}
        </SScroll>
        <SSticky>
          <button className="btn-primary" onClick={handleVoiceNext}>
            {vrecState === 'done' ? 'Use my voice →' : `Use ${voices.find(v => v.id === selectedVoice)?.name} voice →`}
          </button>
        </SSticky>
      </Sheet>

      {/* ══════════════════════════════════════
          SH-GEN — Avatar generation
      ══════════════════════════════════════ */}
      <Sheet open={activeSheet === 'sh-gen'}>
        <Handle />
        <SScroll>
          <STitle>Creating your avatar</STitle>
          <SSub>You can close the app — we'll notify you when ready.</SSub>
          <GenProgress steps={GEN_STEPS_AVATAR} progress={avatarGenProgress} done={avatarGenDone} />
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: 14 }}>
            {avatarGenDone ? <>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>🎉 Avatar is ready!</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>Your character has been created successfully.</div>
              <button className="btn-primary" onClick={handleAvatarDone}>Start creating videos →</button>
            </> : <>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>🔔 Notify when ready?</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>We'll push when your avatar is created</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, textAlign: 'center', padding: 9, borderRadius: 10, background: 'var(--text)', color: '#FAFAF8', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Enable</div>
                <div style={{ flex: 1, textAlign: 'center', padding: 9, borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>Not now</div>
              </div>
            </>}
          </div>
        </SScroll>
      </Sheet>

      {/* ══════════════════════════════════════
          SH-PROMPT — Prompt input
      ══════════════════════════════════════ */}
      <Sheet open={activeSheet === 'sh-prompt'}>
        <Handle />
        <SScroll>
          <STitle>What's your video about?</STitle>
          <SSub>Any idea or topic — we'll write the script.</SSub>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Your idea</div>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
            placeholder="e.g. 3 mistakes creators make when using AI…"
            style={{ width: '100%', minHeight: 110, padding: 14, borderRadius: 14, border: '1.5px solid var(--border)', background: '#fff', fontSize: 15, color: 'var(--text)', fontFamily: 'inherit', resize: 'none', outline: 'none', lineHeight: 1.55, marginBottom: 14 }}
          />
          {[['Reference link','https://…'],['Hashtag or trend','#topic']].map(([label, ph]) => (
            <div key={label} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{label} <span style={{ color: 'var(--border)' }}>(optional)</span></div>
              <input type="text" placeholder={ph} style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid var(--border)', background: '#fff', fontSize: 13, color: 'var(--text)', fontFamily: 'inherit', outline: 'none' }} />
            </div>
          ))}
        </SScroll>
        <SSticky>
          <button className="btn-primary" disabled={!prompt.trim()} onClick={() => goSheet('sh-format')}>Choose format →</button>
        </SSticky>
      </Sheet>

      {/* ══════════════════════════════════════
          SH-FORMAT — Format & variations
      ══════════════════════════════════════ */}
      <Sheet open={activeSheet === 'sh-format'}>
        <Handle />
        <SScroll>
          <STitle>Format & variations</STitle>
          <SSub>Pick your format and how many versions to generate.</SSub>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Format</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {FORMATS.map(f => (
              <div key={f} onClick={() => setFormat(f)} style={{
                padding: '8px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
                background: format === f ? 'var(--text)' : '#fff', color: format === f ? '#FAFAF8' : 'var(--text)',
                border: `1.5px solid ${format === f ? 'var(--text)' : 'var(--border)'}`,
              }}>{f}</div>
            ))}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Variations</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['1 video','2–3 (A/B)'].map(v => (
              <div key={v} onClick={() => setVariations(v)} style={{
                flex: 1, padding: 11, borderRadius: 12, fontSize: 13, fontWeight: 500, textAlign: 'center', cursor: 'pointer',
                background: variations === v ? 'var(--text)' : '#fff', color: variations === v ? '#FAFAF8' : 'var(--text)',
                border: `1.5px solid ${variations === v ? 'var(--text)' : 'var(--border)'}`,
              }}>{v}</div>
            ))}
          </div>
        </SScroll>
        <SSticky>
          <button className="btn-primary" onClick={handleGenerate}>Generate →</button>
        </SSticky>
      </Sheet>

      {/* ══════════════════════════════════════
          SH-VGEN — Video generation
      ══════════════════════════════════════ */}
      <Sheet open={activeSheet === 'sh-vgen'}>
        <Handle />
        <SScroll>
          <STitle>Generating your video</STitle>
          <SSub>Sit back — this usually takes a few minutes.</SSub>
          <GenProgress steps={GEN_STEPS_VIDEO} progress={videoGenProgress} done={videoGenDone} />
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>🔔 Notify when done?</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>We'll push when your video is ready in Library</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, textAlign: 'center', padding: 9, borderRadius: 10, background: 'var(--text)', color: '#FAFAF8', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Enable</div>
              <div onClick={handleVideoClose} style={{ flex: 1, textAlign: 'center', padding: 9, borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>Not now</div>
            </div>
          </div>
        </SScroll>
      </Sheet>

      <style>{`
        @keyframes shimmer    { from{background-position:200% 0} to{background-position:-200% 0} }
        @keyframes camFlash   { from{opacity:.9} to{opacity:0} }
        @keyframes gpa        { 0%,100%{opacity:1} 50%{opacity:.25} }
        @keyframes vpa        { from{transform:scaleY(1)} to{transform:scaleY(2.1)} }
        @keyframes recPulse   { 0%,100%{box-shadow:0 0 0 0 rgba(229,57,53,.4)} 50%{box-shadow:0 0 0 10px rgba(229,57,53,0)} }
        @keyframes promptPulse{ 0%,100%{box-shadow:0 0 0 0 rgba(40,91,176,.25)} 50%{box-shadow:0 0 0 8px rgba(40,91,176,0)} }
        @keyframes ringOut    { 0%{opacity:.5;transform:scale(1)} 100%{opacity:0;transform:scale(1.07)} }
        @keyframes nudge      { 0%,100%{transform:translateX(0)} 50%{transform:translateX(4px)} }
      `}</style>
    </div>
  )
}

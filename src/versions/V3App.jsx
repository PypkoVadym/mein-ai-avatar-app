import { useState, useRef, useEffect } from 'react'

// ── Data ──────────────────────────────────────────────────────────────────────

const SEEDS = [
  { id: 1, name: 'Sophia', desc: 'Professional',  gradient: 'linear-gradient(160deg,#667eea,#764ba2)' },
  { id: 2, name: 'Marcus', desc: 'Energetic',      gradient: 'linear-gradient(160deg,#f093fb,#f5576c)' },
  { id: 3, name: 'Elena',  desc: 'Calm',           gradient: 'linear-gradient(160deg,#4facfe,#00f2fe)' },
  { id: 4, name: 'Jordan', desc: 'Dynamic',        gradient: 'linear-gradient(160deg,#43e97b,#38f9d7)' },
  { id: 5, name: 'Zoe',    desc: 'Vibrant',        gradient: 'linear-gradient(160deg,#fa709a,#fee140)' },
  { id: 6, name: 'Alex',   desc: 'Authoritative',  gradient: 'linear-gradient(160deg,#a18cd1,#fbc2eb)' },
]

const MALE_VOICES   = [
  { id: 'neutral',   name: 'Neutral',   desc: 'Clear, universal',   forYou: true },
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

// Feed templates — each is a pre-built style the user can adopt
const TEMPLATES = [
  { id: 1, label: 'Expert take',   tone: 'Expert',     mood: 'Formal',   gradient: 'linear-gradient(160deg,#0f0c29,#302b63,#24243e)', avatar: '🧑‍💼', caption: 'The one thing nobody tells you about AI content 👇', tag: '#business',    likes: '48.2K', comments: '312' },
  { id: 2, label: 'Hype drop',     tone: 'Energetic',  mood: 'Hype',     gradient: 'linear-gradient(160deg,#f953c6,#b91d73)',           avatar: '🧑‍🎤', caption: 'POV: Your AI twin just went viral 🔥🔥🔥',            tag: '#creator',     likes: '92.1K', comments: '1.4K' },
  { id: 3, label: 'Calm explainer',tone: 'Calm',        mood: 'Chill',    gradient: 'linear-gradient(160deg,#1a1a2e,#16213e,#0f3460)',   avatar: '👩‍💻', caption: 'Let me explain this in under 60 seconds 🧠',           tag: '#education',   likes: '21.8K', comments: '204' },
  { id: 4, label: 'Lifestyle',     tone: 'Soft',        mood: 'Warm',     gradient: 'linear-gradient(160deg,#fc5c7d,#6a3093)',           avatar: '👩‍🌾', caption: 'My morning routine that changed everything ✨',         tag: '#lifestyle',   likes: '67.4K', comments: '891' },
  { id: 5, label: 'Tech breakdown',tone: 'Neutral',     mood: 'Sharp',    gradient: 'linear-gradient(160deg,#141e30,#243b55)',           avatar: '🧑‍🔬', caption: 'Why everyone is sleeping on this tool 🛠️',             tag: '#tech',        likes: '33.5K', comments: '447' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function WaveBars({ playing, color = 'rgba(255,255,255,.5)' }) {
  const heights = [5, 9, 13, 8, 11, 6, 10, 7, 12, 5, 9, 13]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 16 }}>
      {heights.map((h, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 2, background: color,
          height: playing ? 13 : h,
          ...(playing ? { animation: `vpa3 .55s ease-in-out ${i * 0.07}s infinite alternate` } : {}),
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
        const isDone = i < activeIdx, isActive = i === activeIdx && !done
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < steps.length - 1 ? '1px solid var(--bg-deep)' : 'none', fontSize: 13, color: isDone || isActive ? 'var(--text)' : 'var(--text-secondary)', fontWeight: isActive ? 600 : 400 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: isDone ? 'var(--green)' : isActive ? 'var(--text)' : 'var(--border)', animation: isActive ? 'gpa3 1s ease-in-out infinite' : 'none' }} />
            {s}
          </div>
        )
      })}
    </div>
  )
}

// Sheet primitives
function Sheet({ open, tall, children }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: '#fff', borderRadius: '24px 24px 0 0',
      zIndex: 210, maxHeight: tall ? '96%' : '88%',
      display: 'flex', flexDirection: 'column',
      transform: open ? 'translateY(0)' : 'translateY(100%)',
      transition: 'transform .36s cubic-bezier(.32,0,.15,1)',
      pointerEvents: open ? 'all' : 'none',
    }}>
      {children}
    </div>
  )
}
const Handle  = () => <div style={{ width: 36, height: 4, background: '#E0DDD6', borderRadius: 2, margin: '12px auto 0', flexShrink: 0 }} />
const SScroll = ({ children }) => <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px', scrollbarWidth: 'none' }}>{children}</div>
const STitle  = ({ children }) => <div style={{ fontSize: 20, fontWeight: 700, color: '#1A1916', padding: '16px 0 4px', lineHeight: 1.25 }}>{children}</div>
const SSub    = ({ children }) => <div style={{ fontSize: 14, color: '#9B9894', lineHeight: 1.6, marginBottom: 16 }}>{children}</div>
const SSticky = ({ children }) => <div style={{ padding: '10px 20px 32px', background: 'linear-gradient(to top,#fff 70%,transparent)', flexShrink: 0 }}>{children}</div>
const PrimaryBtn = ({ children, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{ width: '100%', padding: 16, borderRadius: 16, border: 'none', cursor: disabled ? 'default' : 'pointer', background: disabled ? '#D4D1CB' : '#1A1916', color: disabled ? '#9B9894' : '#FAFAF8', fontSize: 15, fontWeight: 600, fontFamily: 'inherit' }}>
    {children}
  </button>
)

// ── V3 App ────────────────────────────────────────────────────────────────────

export default function V3App() {
  const [activeTab,    setActiveTab]    = useState('home')
  const [activeSheet,  setActiveSheet]  = useState(null)
  const [avatar,       setAvatar]       = useState(null)

  // Active template (style preset)
  const [activeTemplate, setActiveTemplate] = useState(TEMPLATES[0])

  // Videos generated
  const [myVideos, setMyVideos] = useState([])

  // Path / avatar creation
  const [path,         setPath]         = useState('A')
  const [scanStep,     setScanStep]     = useState(0)
  const [scanCaptured, setScanCaptured] = useState([false, false, false])
  const [scanFlash,    setScanFlash]    = useState(false)
  const [consent1,     setConsent1]     = useState(false)
  const [consent2,     setConsent2]     = useState(false)
  const [selectedSeed, setSelectedSeed] = useState(null)
  const scanDone = scanCaptured.every(Boolean)

  // Voice
  const [gender,        setGender]        = useState('male')
  const [selectedVoice, setSelectedVoice] = useState('neutral')
  const [playingVoice,  setPlayingVoice]  = useState(null)
  const [vrecState,     setVrecState]     = useState('idle')
  const [vrecSec,       setVrecSec]       = useState(0)
  const playTimerRef = useRef(null)
  const vrecTimerRef = useRef(null)

  // Avatar gen
  const [avatarGenProgress, setAvatarGenProgress] = useState(0)
  const [avatarGenDone,     setAvatarGenDone]     = useState(false)

  // Prompt / format / video gen
  const [prompt,           setPrompt]           = useState('')
  const [format,           setFormat]           = useState('TikTok · 15s')
  const [videoGenProgress, setVideoGenProgress] = useState(0)
  const [videoGenDone,     setVideoGenDone]     = useState(false)

  useEffect(() => () => { clearInterval(vrecTimerRef.current); clearTimeout(playTimerRef.current) }, [])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const goSheet   = (id) => setActiveSheet(id)
  const closeSheet = ()  => setActiveSheet(null)

  const onPlusPress = () => {
    if (!avatar) goSheet('sh-path')
    else goSheet('sh-prompt')
  }

  const takePhoto = () => {
    setScanFlash(true)
    setTimeout(() => setScanFlash(false), 180)
    const next = scanCaptured.map((v, i) => i === scanStep ? true : v)
    setScanCaptured(next)
    if (scanStep < 2) setTimeout(() => setScanStep(s => s + 1), 450)
    else setTimeout(() => goSheet('sh-consent'), 600)
  }

  const resetScan = () => { setScanStep(0); setScanCaptured([false,false,false]); setScanFlash(false); setConsent1(false); setConsent2(false) }

  const toggleVrec = () => {
    if (vrecState === 'recording') { clearInterval(vrecTimerRef.current); setVrecState('done') }
    else { setVrecState('recording'); setVrecSec(0); vrecTimerRef.current = setInterval(() => setVrecSec(s => s + 1), 1000) }
  }

  const playVoice = (id) => {
    if (playingVoice === id) { setPlayingVoice(null); clearTimeout(playTimerRef.current) }
    else { setPlayingVoice(id); clearTimeout(playTimerRef.current); playTimerRef.current = setTimeout(() => setPlayingVoice(null), 2500) }
  }

  const handlePathNext = () => goSheet(path === 'A' ? 'sh-scan' : 'sh-seed')

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
      gradient: path === 'A' ? 'linear-gradient(160deg,#F4C5B0,#C0513A)' : (seed?.gradient || SEEDS[0].gradient),
      voice: vrecState === 'done' ? 'Custom' : v?.name,
    })
    closeSheet(); resetScan(); setVrecState('idle'); setVrecSec(0)
  }

  const handleGenerate = () => {
    if (!prompt.trim()) return
    goSheet('sh-format')
  }

  const startVideoGen = () => {
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
    setMyVideos(v => [{
      id: Date.now(),
      gradient: activeTemplate.gradient,
      caption: prompt,
      template: activeTemplate.label,
      likes: '0', comments: '0',
    }, ...v])
    setPrompt(''); closeSheet()
  }

  const voices = gender === 'male' ? MALE_VOICES : FEMALE_VOICES
  const fmtSec = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`

  // ── Feed items = myVideos + templates ─────────────────────────────────────
  const feedItems = [
    ...myVideos.map(v => ({ ...v, isMine: true })),
    ...TEMPLATES.map(t => ({ ...t, isMine: false })),
  ]

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', isolation: 'isolate', background: '#000' }}>

      {/* ── Video feed — fills entire screen ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'scroll', scrollSnapType: 'y mandatory', scrollbarWidth: 'none', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
        {feedItems.map((item) => (
          <FeedCard
            key={item.id}
            item={item}
            onUseTemplate={() => { setActiveTemplate(item.isMine ? activeTemplate : item); goSheet('sh-prompt') }}
          />
        ))}
      </div>

      {/* ── FOR YOU label — floats at top ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        display: 'flex', justifyContent: 'center',
        padding: '14px 0 10px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,.55) 0%, transparent 100%)',
        pointerEvents: 'none',
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', borderBottom: '2px solid #fff', paddingBottom: 4 }}>For You</div>
      </div>

      {/* ── Tab bar — floats at bottom over the feed ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
        display: 'flex', alignItems: 'center',
        background: 'rgba(0,0,0,.85)',
        borderTop: '0.5px solid rgba(255,255,255,.1)',
        padding: '8px 0 20px',
      }}>
        {[
          { id: 'home',    icon: HomeIcon,    label: 'Home' },
          { id: 'plus',    icon: null,         label: '' },
          { id: 'profile', icon: ProfileIcon, label: 'Profile' },
        ].map(t => {
          if (t.id === 'plus') return (
            <div key="plus" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <button onClick={onPlusPress} style={{
                width: 48, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(90deg,#69C9D0,#fff,#EE1D52)',
                padding: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <line x1="9" y1="3" x2="9" y2="15" stroke="#1A1916" strokeWidth="2.2" strokeLinecap="round"/>
                    <line x1="3" y1="9" x2="15" y2="9" stroke="#1A1916" strokeWidth="2.2" strokeLinecap="round"/>
                  </svg>
                </div>
              </button>
            </div>
          )
          const Icon = t.icon
          return (
            <div key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
              <Icon active={activeTab === t.id} />
              <div style={{ fontSize: 10, color: activeTab === t.id ? '#fff' : 'rgba(255,255,255,.5)', fontWeight: activeTab === t.id ? 600 : 400 }}>{t.label}</div>
            </div>
          )
        })}
      </div>

      {/* Overlay */}
      {activeSheet && <div onClick={closeSheet} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,.6)', zIndex: 200 }} />}

      {/* ══════════════════════════════════════
          SH-PATH
      ══════════════════════════════════════ */}
      <Sheet open={activeSheet === 'sh-path'}>
        <Handle />
        <SScroll>
          <STitle>Create your character</STitle>
          <SSub>You only do this once — then just type and generate.</SSub>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {[
              { id: 'A', icon: '🤳', bg: 'var(--blue-light)', title: "That's me", desc: "Take 3 quick photos. We'll build your personal avatar.", tagC: 'var(--blue)', tagBg: 'var(--blue-light)', tag: 'Personal' },
              { id: 'B', icon: '✦',  bg: 'var(--green-light)', title: 'Choose a look', desc: 'Pick a seed — we generate a unique character.', tagC: 'var(--green)', tagBg: 'var(--green-light)', tag: 'Seed-based' },
            ].map(c => (
              <div key={c.id} onClick={() => setPath(c.id)} style={{ background: path === c.id ? '#F7F5F0' : '#fff', borderRadius: 18, padding: 16, cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'flex-start', border: `1.5px solid ${path === c.id ? '#1A1916' : '#E8E5E0'}`, boxShadow: path === c.id ? '0 0 0 3px rgba(26,25,22,.07)' : 'none' }}>
                <div style={{ width: 48, height: 48, borderRadius: 13, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{c.icon}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1916', marginBottom: 3 }}>{c.title}</div>
                  <div style={{ fontSize: 13, color: '#9B9894', lineHeight: 1.5 }}>{c.desc}</div>
                  <span style={{ display: 'inline-block', marginTop: 7, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 7, background: c.tagBg, color: c.tagC }}>{c.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </SScroll>
        <SSticky><PrimaryBtn onClick={handlePathNext}>{path === 'A' ? 'Continue with face scan →' : 'Continue with seed →'}</PrimaryBtn></SSticky>
      </Sheet>

      {/* ══════════════════════════════════════
          SH-SCAN
      ══════════════════════════════════════ */}
      <Sheet open={activeSheet === 'sh-scan'} tall>
        <Handle />
        <SScroll>
          <STitle>Take 3 photos</STitle>
          <SSub>Position your face in the oval and tap the shutter.</SSub>
          <div style={{ width: '100%', aspectRatio: '3/4', maxHeight: 320, borderRadius: 20, overflow: 'hidden', background: '#0a0a0f', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            {scanFlash && <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: .85, animation: 'camFlash3 .2s ease forwards', zIndex: 10 }} />}
            {['33%','66%'].map(p => <div key={'v'+p} style={{ position: 'absolute', left: p, top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,.07)' }} />)}
            {['33%','66%'].map(p => <div key={'h'+p} style={{ position: 'absolute', top: p, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,.07)' }} />)}
            {[{t:12,l:12,bT:'2px solid rgba(255,255,255,.65)',bL:'2px solid rgba(255,255,255,.65)'},{t:12,r:12,bT:'2px solid rgba(255,255,255,.65)',bR:'2px solid rgba(255,255,255,.65)'},{b:12,l:12,bB:'2px solid rgba(255,255,255,.65)',bL:'2px solid rgba(255,255,255,.65)'},{b:12,r:12,bB:'2px solid rgba(255,255,255,.65)',bR:'2px solid rgba(255,255,255,.65)'}].map((s,i) => (
              <div key={i} style={{ position: 'absolute', width: 20, height: 20, top: s.t, left: s.l, bottom: s.b, right: s.r, borderTop: s.bT, borderLeft: s.bL, borderBottom: s.bB, borderRight: s.bR }} />
            ))}
            <div style={{ width: '42%', aspectRatio: '2/3', border: scanDone ? '2px solid #4ade80' : '2px dashed rgba(255,255,255,.4)', borderRadius: '50%', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-54%)' }} />
            {scanDone
              ? <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>✅</div>
              : <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14, display: 'flex', gap: 8 }}>
                  {SCAN_STEPS.map((s, i) => (
                    <div key={i} style={{ flex: 1, borderRadius: 12, padding: '8px 4px', textAlign: 'center', background: scanCaptured[i] ? 'rgba(74,222,128,.25)' : i === scanStep ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.07)', border: i === scanStep && !scanCaptured[i] ? '1px solid rgba(255,255,255,.3)' : '1px solid transparent' }}>
                      <div style={{ fontSize: 18 }}>{scanCaptured[i] ? '✅' : s.emoji}</div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,.8)', marginTop: 3, fontWeight: 500 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
            }
            {!scanDone && (
              <button onClick={takePhoto} style={{ position: 'absolute', bottom: 68, width: 56, height: 56, borderRadius: '50%', background: 'transparent', border: '3.5px solid #fff', padding: 3, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#fff' }} />
              </button>
            )}
          </div>
          {scanDone && <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 600, color: 'var(--green)', marginBottom: 8 }}>All photos taken ✓</div>}
        </SScroll>
        <SSticky><PrimaryBtn disabled={!scanDone} onClick={() => goSheet('sh-consent')}>{scanDone ? 'Continue →' : `Photo ${scanStep + 1} of 3`}</PrimaryBtn></SSticky>
      </Sheet>

      {/* ══════════════════════════════════════
          SH-CONSENT
      ══════════════════════════════════════ */}
      <Sheet open={activeSheet === 'sh-consent'}>
        <Handle />
        <SScroll>
          <STitle>Before we continue</STitle>
          <SSub>We need your consent before processing your photos.</SSub>
          {[
            { key:'c1', val:consent1, set:setConsent1, text:'I consent to processing my biometric data to create an AI avatar', link:'Privacy Policy' },
            { key:'c2', val:consent2, set:setConsent2, text:'This avatar is for my personal use only' },
          ].map(c => (
            <div key={c.key} onClick={() => c.set(v => !v)} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 16px', background: '#fff', borderRadius: 14, border: `1.5px solid ${c.val ? '#1A1916' : '#E8E5E0'}`, cursor: 'pointer', marginBottom: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1, border: `1.5px solid ${c.val ? '#1A1916' : '#D4D1CB'}`, background: c.val ? '#1A1916' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {c.val && <svg width="11" height="8" viewBox="0 0 11 8" fill="none"><polyline points="1,4 4,7 10,1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <div style={{ fontSize: 13, color: '#1A1916', lineHeight: 1.6 }}>{c.text}{c.link && <> — <span style={{ color: '#2E6FD8' }}>{c.link}</span></>}</div>
            </div>
          ))}
          <div style={{ background: '#F7F5F0', borderRadius: 12, padding: '12px 14px', display: 'flex', gap: 10 }}>
            <span style={{ flexShrink: 0 }}>🔒</span>
            <div style={{ fontSize: 12, color: '#9B9894', lineHeight: 1.6 }}>Photos are processed securely and <strong style={{ color: '#1A1916' }}>deleted after avatar creation</strong>.</div>
          </div>
        </SScroll>
        <SSticky><PrimaryBtn disabled={!consent1 || !consent2} onClick={() => goSheet('sh-voice')}>I agree — choose my voice →</PrimaryBtn></SSticky>
      </Sheet>

      {/* ══════════════════════════════════════
          SH-SEED
      ══════════════════════════════════════ */}
      <Sheet open={activeSheet === 'sh-seed'} tall>
        <Handle />
        <SScroll>
          <STitle>Choose a look</STitle>
          <SSub>Generated just for you — shown to no one else.</SSub>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9, marginBottom: 14 }}>
            {SEEDS.map(seed => (
              <div key={seed.id} onClick={() => setSelectedSeed(seed.id)} style={{ borderRadius: 14, overflow: 'hidden', position: 'relative', aspectRatio: '3/4', cursor: 'pointer', background: seed.gradient, boxShadow: selectedSeed === seed.id ? '0 0 0 3px #1A1916' : 'none' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 55%)' }} />
                <div style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(0,0,0,.4)', borderRadius: 20, padding: '2px 7px', fontSize: 9, fontWeight: 600, color: '#fff', textTransform: 'uppercase' }}>For you</div>
                {selectedSeed === seed.id && <div style={{ position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: '50%', background: '#1A1916', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="9" height="7" viewBox="0 0 9 7" fill="none"><polyline points="1,3.5 3,5.5 8,1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
                <div style={{ position: 'absolute', bottom: 0, padding: '7px 8px 9px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{seed.name}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.7)', marginTop: 1 }}>{seed.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </SScroll>
        <SSticky><PrimaryBtn disabled={!selectedSeed} onClick={handleSeedNext}>{selectedSeed ? `Continue with ${SEEDS.find(s=>s.id===selectedSeed)?.name} →` : 'Select a look first'}</PrimaryBtn></SSticky>
      </Sheet>

      {/* ══════════════════════════════════════
          SH-VOICE
      ══════════════════════════════════════ */}
      <Sheet open={activeSheet === 'sh-voice'} tall>
        <Handle />
        <SScroll>
          <STitle>Choose a voice</STitle>
          <SSub>It'll narrate your videos. Listen or record your own.</SSub>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1916' }}>Voice type</div>
            <div style={{ display: 'flex', background: '#F0EEE9', borderRadius: 10, padding: 3 }}>
              {['female','male'].map(g => (
                <div key={g} onClick={() => { setGender(g); setSelectedVoice(g==='male'?'neutral':'soft') }} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize', background: gender===g ? '#1A1916' : 'transparent', color: gender===g ? '#F7F5F0' : '#9B9894' }}>{g}</div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 16, opacity: vrecState==='done' ? .45 : 1, transition: 'opacity .2s' }}>
            {voices.map(v => (
              <div key={v.id} onClick={() => vrecState !== 'done' && setSelectedVoice(v.id)} style={{ background: '#fff', borderRadius: 14, padding: '12px 12px 10px', cursor: 'pointer', position: 'relative', border: `1.5px solid ${selectedVoice===v.id && vrecState!=='done' ? '#1A1916' : '#E8E5E0'}`, boxShadow: selectedVoice===v.id && vrecState!=='done' ? '0 0 0 3px rgba(26,25,22,.07)' : 'none' }}>
                {v.forYou && <div style={{ position: 'absolute', top: -1, right: 10, background: '#1A1916', color: '#F7F5F0', fontSize: 8, fontWeight: 600, textTransform: 'uppercase', padding: '2px 7px', borderRadius: '0 0 6px 6px' }}>For you</div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1916' }}>{v.name}</div>
                  <div onClick={e => { e.stopPropagation(); playVoice(v.id) }} style={{ width: 24, height: 24, borderRadius: '50%', border: '1.5px solid #E0DDD6', background: playingVoice===v.id ? '#1A1916' : '#F7F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                    <div style={{ width: 0, height: 0, borderStyle: 'solid', borderWidth: '3.5px 0 3.5px 6px', borderColor: `transparent transparent transparent ${playingVoice===v.id ? '#fff' : '#9B9894'}`, marginLeft: 1 }} />
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#9B9894', marginBottom: 8 }}>{v.desc}</div>
                <WaveBars playing={playingVoice===v.id} color="#D4D1CB" />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 14px' }}>
            <div style={{ flex: 1, height: 1, background: '#E8E5E0' }} />
            <div style={{ fontSize: 11, color: '#9B9894', whiteSpace: 'nowrap' }}>or record your own</div>
            <div style={{ flex: 1, height: 1, background: '#E8E5E0' }} />
          </div>
          <div style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${vrecState==='done' ? '#1A1916' : '#E8E5E0'}`, padding: '14px 16px', marginBottom: 8 }}>
            <div style={{ background: '#F0EEE9', borderRadius: 9, padding: '8px 11px', fontSize: 12, color: '#1A1916', fontStyle: 'italic', lineHeight: 1.55, marginBottom: 12 }}>"Today we'll look at how neural networks work — simply and clearly."</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={toggleVrec} style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, border: 'none', cursor: 'pointer', background: vrecState==='recording' ? '#E53935' : vrecState==='done' ? 'var(--green)' : '#1A1916', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: vrecState==='recording' ? 'recPulse3 1.2s ease-in-out infinite' : 'none' }}>
                {vrecState==='done'
                  ? <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><polyline points="1,6 5.5,10.5 15,1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : <svg width="12" height="16" viewBox="0 0 12 16" fill="none"><rect x="3.5" y="0" width="5" height="10" rx="2.5" fill="#fff"/><path d="M1 7.5C1 10.538 3.238 13 6 13s5-2.462 5-5.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/><line x1="6" y1="13" x2="6" y2="16" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
                }
              </button>
              <div style={{ flex: 1 }}>
                {vrecState==='idle' && <div style={{ fontSize: 12, color: '#9B9894' }}>Tap to record</div>}
                {vrecState==='recording' && <WaveBars playing color="#1A1916" />}
                {vrecState==='done' && <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)' }}>Recording saved ✓</div>}
              </div>
              {vrecState==='recording' && <div style={{ fontSize: 11, color: '#9B9894', fontWeight: 600 }}>{fmtSec(vrecSec)}</div>}
              {vrecState==='done' && <div onClick={() => { setVrecState('idle'); setVrecSec(0) }} style={{ fontSize: 11, color: '#9B9894', cursor: 'pointer', padding: '4px 8px', borderRadius: 8, border: '1px solid #E0DDD6' }}>Redo</div>}
            </div>
          </div>
        </SScroll>
        <SSticky><PrimaryBtn onClick={handleVoiceNext}>{vrecState==='done' ? 'Use my voice →' : `Use ${voices.find(v=>v.id===selectedVoice)?.name} voice →`}</PrimaryBtn></SSticky>
      </Sheet>

      {/* ══════════════════════════════════════
          SH-GEN (avatar)
      ══════════════════════════════════════ */}
      <Sheet open={activeSheet === 'sh-gen'}>
        <Handle />
        <SScroll>
          <STitle>Creating your avatar</STitle>
          <SSub>We'll notify you when it's ready.</SSub>
          <GenProgress steps={GEN_STEPS_AVATAR} progress={avatarGenProgress} done={avatarGenDone} />
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8E5E0', padding: 14 }}>
            {avatarGenDone ? <>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1916', marginBottom: 4 }}>🎉 Avatar is ready!</div>
              <div style={{ fontSize: 12, color: '#9B9894', marginBottom: 12 }}>Your character has been created successfully.</div>
              <PrimaryBtn onClick={handleAvatarDone}>Start creating videos →</PrimaryBtn>
            </> : <>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1916', marginBottom: 4 }}>🔔 Notify when ready?</div>
              <div style={{ fontSize: 12, color: '#9B9894', marginBottom: 12 }}>We'll push when your avatar is created</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, textAlign: 'center', padding: 9, borderRadius: 10, background: '#1A1916', color: '#FAFAF8', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Enable</div>
                <div style={{ flex: 1, textAlign: 'center', padding: 9, borderRadius: 10, border: '1.5px solid #E0DDD6', fontSize: 13, color: '#6B6966', cursor: 'pointer' }}>Not now</div>
              </div>
            </>}
          </div>
        </SScroll>
      </Sheet>

      {/* ══════════════════════════════════════
          SH-PROMPT
      ══════════════════════════════════════ */}
      <Sheet open={activeSheet === 'sh-prompt'}>
        <Handle />
        <SScroll>
          <STitle>What's your video about?</STitle>

          {/* Active template pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: '#9B9894' }}>Style:</div>
            <div onClick={() => goSheet('sh-templates')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: '#F0EEE9', border: '1px solid #E0DDD6', cursor: 'pointer' }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: activeTemplate.gradient }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1916' }}>{activeTemplate.label}</span>
              <span style={{ fontSize: 11, color: '#9B9894' }}>· {activeTemplate.tone}</span>
              <span style={{ fontSize: 10, color: '#B0ADA8' }}>✎</span>
            </div>
          </div>

          <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
            placeholder="e.g. 3 mistakes creators make when using AI…"
            style={{ width: '100%', minHeight: 110, padding: 14, borderRadius: 14, border: '1.5px solid #E0DDD6', background: '#fff', fontSize: 15, color: '#1A1916', fontFamily: 'inherit', resize: 'none', outline: 'none', lineHeight: 1.55, marginBottom: 14 }}
            autoFocus
          />

          {/* Quick suggestions */}
          <div style={{ fontSize: 11, fontWeight: 600, color: '#9B9894', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Quick ideas</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {['3 tips for…', 'Why nobody talks about…', 'The secret to…', 'POV: You just…'].map(s => (
              <div key={s} onClick={() => setPrompt(s)} style={{ padding: '7px 12px', borderRadius: 20, border: '1px solid #E8E5E0', background: '#fff', fontSize: 12, color: '#1A1916', cursor: 'pointer', whiteSpace: 'nowrap' }}>{s}</div>
            ))}
          </div>
        </SScroll>
        <SSticky><PrimaryBtn disabled={!prompt.trim()} onClick={handleGenerate}>Choose format →</PrimaryBtn></SSticky>
      </Sheet>

      {/* ══════════════════════════════════════
          SH-TEMPLATES — change style
      ══════════════════════════════════════ */}
      <Sheet open={activeSheet === 'sh-templates'}>
        <Handle />
        <SScroll>
          <STitle>Choose a style</STitle>
          <SSub>Pick the vibe for your next video.</SSub>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {TEMPLATES.map(t => (
              <div key={t.id} onClick={() => { setActiveTemplate(t); goSheet('sh-prompt') }} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 16, border: `1.5px solid ${activeTemplate.id===t.id ? '#1A1916' : '#E8E5E0'}`, background: '#fff', cursor: 'pointer', boxShadow: activeTemplate.id===t.id ? '0 0 0 3px rgba(26,25,22,.07)' : 'none' }}>
                <div style={{ width: 44, height: 56, borderRadius: 10, background: t.gradient, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{t.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1916', marginBottom: 2 }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: '#9B9894' }}>{t.tone} · {t.mood} · {t.tag}</div>
                </div>
                {activeTemplate.id===t.id && <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7.5" stroke="#1A1916"/><polyline points="4.5,8 7,10.5 11.5,5.5" stroke="#1A1916" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            ))}
          </div>
        </SScroll>
      </Sheet>

      {/* ══════════════════════════════════════
          SH-FORMAT
      ══════════════════════════════════════ */}
      <Sheet open={activeSheet === 'sh-format'}>
        <Handle />
        <SScroll>
          <STitle>Format</STitle>
          <SSub>Pick the format for your video.</SSub>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {FORMATS.map(f => (
              <div key={f} onClick={() => setFormat(f)} style={{ padding: '9px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', background: format===f ? '#1A1916' : '#fff', color: format===f ? '#FAFAF8' : '#1A1916', border: `1.5px solid ${format===f ? '#1A1916' : '#E0DDD6'}` }}>{f}</div>
            ))}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#9B9894', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Variations</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['1 video','2–3 (A/B)'].map(v => (
              <div key={v} onClick={() => {}} style={{ flex: 1, padding: 11, borderRadius: 12, fontSize: 13, fontWeight: 500, textAlign: 'center', cursor: 'pointer', background: v==='1 video' ? '#1A1916' : '#fff', color: v==='1 video' ? '#FAFAF8' : '#1A1916', border: `1.5px solid ${v==='1 video' ? '#1A1916' : '#E0DDD6'}` }}>{v}</div>
            ))}
          </div>
        </SScroll>
        <SSticky><PrimaryBtn onClick={startVideoGen}>Generate →</PrimaryBtn></SSticky>
      </Sheet>

      {/* ══════════════════════════════════════
          SH-VGEN
      ══════════════════════════════════════ */}
      <Sheet open={activeSheet === 'sh-vgen'}>
        <Handle />
        <SScroll>
          <STitle>Generating your video</STitle>
          <SSub>Sit back — usually a few minutes.</SSub>
          <GenProgress steps={GEN_STEPS_VIDEO} progress={videoGenProgress} done={videoGenDone} />
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8E5E0', padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1916', marginBottom: 4 }}>🔔 Notify when done?</div>
            <div style={{ fontSize: 12, color: '#9B9894', marginBottom: 12 }}>We'll push when your video is ready</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, textAlign: 'center', padding: 9, borderRadius: 10, background: '#1A1916', color: '#FAFAF8', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Enable</div>
              <div onClick={handleVideoClose} style={{ flex: 1, textAlign: 'center', padding: 9, borderRadius: 10, border: '1.5px solid #E0DDD6', fontSize: 13, color: '#6B6966', cursor: 'pointer' }}>Not now</div>
            </div>
          </div>
        </SScroll>
      </Sheet>

      <style>{`
        @keyframes camFlash3  { from{opacity:.9} to{opacity:0} }
        @keyframes gpa3       { 0%,100%{opacity:1} 50%{opacity:.25} }
        @keyframes vpa3       { from{transform:scaleY(1)} to{transform:scaleY(2.2)} }
        @keyframes recPulse3  { 0%,100%{box-shadow:0 0 0 0 rgba(229,57,53,.4)} 50%{box-shadow:0 0 0 10px rgba(229,57,53,0)} }
      `}</style>
    </div>
  )
}

// ── Feed Card ─────────────────────────────────────────────────────────────────

function FeedCard({ item, onUseTemplate }) {
  const [liked, setLiked] = useState(false)

  return (
    <div style={{ flex: '0 0 100%', scrollSnapAlign: 'start', position: 'relative', background: item.gradient, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>

      {/* Gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.75) 0%, transparent 50%)' }} />

      {/* Bottom info — padded above the floating tab bar */}
      <div style={{ position: 'relative', zIndex: 1, padding: '0 16px 88px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 }}>@twin_ai_{item.id}</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,.9)', lineHeight: 1.45, marginBottom: 14 }}>{item.caption || item.label}</div>

        {/* Use this style — full-width prominent CTA */}
        <div onClick={onUseTemplate} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 20px', borderRadius: 14, background: 'rgba(255,255,255,.18)', border: '1.5px solid rgba(255,255,255,.45)', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
            {item.isMine ? '🔁 Make similar' : '✦ Use this style'}
          </span>
        </div>
      </div>

      {/* Play icon overlay */}
      <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,0,0,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 0, height: 0, borderStyle: 'solid', borderWidth: '12px 0 12px 20px', borderColor: 'transparent transparent transparent rgba(255,255,255,.85)', marginLeft: 4 }} />
      </div>

      {/* AI badge */}
      {!item.isMine && <div style={{ position: 'absolute', top: 60, left: 12, background: 'rgba(0,0,0,.5)', borderRadius: 8, padding: '3px 8px', fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '.04em' }}>AI TEMPLATE</div>}
      {item.isMine && <div style={{ position: 'absolute', top: 60, left: 12, background: 'rgba(238,29,82,.8)', borderRadius: 8, padding: '3px 8px', fontSize: 10, fontWeight: 700, color: '#fff' }}>MY VIDEO</div>}
    </div>
  )
}

function ActionBtn({ icon, count, onPress }) {
  return (
    <div onClick={onPress} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>{count}</div>
    </div>
  )
}

// Tab bar icons
const HomeIcon    = ({ active }) => <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#fff' : 'none'} stroke={active ? '#fff' : 'rgba(255,255,255,.5)'} strokeWidth="1.8"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>
const SearchIcon  = ({ active }) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : 'rgba(255,255,255,.5)'} strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/></svg>
const InboxIcon   = ({ active }) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : 'rgba(255,255,255,.5)'} strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
const ProfileIcon = ({ active }) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : 'rgba(255,255,255,.5)'} strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>

// Global style for disc spin (added once)
const discStyle = document.createElement('style')
discStyle.textContent = '@keyframes spinDisc{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}'
if (!document.head.querySelector('[data-v3]')) { discStyle.setAttribute('data-v3',''); document.head.appendChild(discStyle) }

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
const MALE_VOICES = [
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
const SCAN_STEPS   = [{ emoji:'👈',label:'Left' },{ emoji:'😐',label:'Forward' },{ emoji:'👉',label:'Right' }]
const GEN_STEPS    = ['Processing input','Analysing features','Generating avatar','Final rendering','Deleting source files']
const TEMPLATES    = [
  { id:1, label:'Expert take',    video:'/video1.mp4', caption:'The one thing nobody tells you about AI content 👇', gradient:'linear-gradient(160deg,#667eea,#764ba2)', metric:{value:'47 new leads',context:'this week'},    avatar:{gradient:'linear-gradient(160deg,#667eea,#764ba2)',name:'Sophia'} },
  { id:2, label:'Hype drop',      video:'/video2.mp4', caption:'POV: Your AI twin just went viral 🔥',               gradient:'linear-gradient(160deg,#f093fb,#f5576c)', metric:{value:'$1.1K/day',    context:'dropshipping'}, avatar:{gradient:'linear-gradient(160deg,#f093fb,#f5576c)',name:'Marcus'} },
  { id:3, label:'Calm explainer', video:'/video3.mp4', caption:'Let me explain this in under 60 seconds 🧠',         gradient:'linear-gradient(160deg,#4facfe,#00f2fe)', metric:{value:'+12K followers',context:'2 weeks'},      avatar:{gradient:'linear-gradient(160deg,#4facfe,#00f2fe)',name:'Elena'}  },
]

// Step accent gradients
const STEP_GLOW = {
  path:    ['#667eea','#764ba2'],
  scan:    ['#4facfe','#00f2fe'],
  consent: ['#a18cd1','#fbc2eb'],
  seed:    ['#43e97b','#38f9d7'],
  voice:   ['#fa709a','#fee140'],
  gen:     ['#667eea','#764ba2'],
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function WaveBars({ playing, color = 'rgba(255,255,255,.4)' }) {
  const hh = [5,9,13,8,11,6,10,7,12,5,9,13]
  return (
    <div style={{ display:'flex', alignItems:'center', gap:2, height:16 }}>
      {hh.map((h,i) => (
        <div key={i} style={{ width:3, borderRadius:2, background:color, height: playing?13:h,
          ...(playing?{animation:`vpa4 .55s ease-in-out ${i*.07}s infinite alternate`}:{}) }} />
      ))}
    </div>
  )
}

// ── Progress Bar — Instagram Stories style ────────────────────────────────────

function StoryBar({ total, current }) {
  return (
    <div style={{ display:'flex', gap:4, padding:'0 14px', position:'absolute', top:52, left:0, right:0, zIndex:60, pointerEvents:'none' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i <= current ? '#fff' : 'rgba(255,255,255,.22)', position:'relative', overflow:'hidden' }}>
          {i === current && <div style={{ position:'absolute', inset:0, background:'#fff', animation:'storyFill4 .22s ease forwards' }} />}
        </div>
      ))}
    </div>
  )
}

// ── Glow blob behind step content ────────────────────────────────────────────

function StepGlow({ stepId }) {
  const [c1, c2] = STEP_GLOW[stepId] || ['#667eea','#764ba2']
  return (
    <div style={{ position:'absolute', top:-80, left:'50%', transform:'translateX(-50%)', width:320, height:320,
      background:`radial-gradient(circle, ${c1}1a 0%, transparent 70%)`, pointerEvents:'none', zIndex:0 }} />
  )
}

// ── Shared primitives ─────────────────────────────────────────────────────────

const Label  = ({ n, children }) => <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.35)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:10 }}>{n && `${n} · `}{children}</div>
const Heading = ({ children }) => <div style={{ fontSize:30, fontWeight:900, color:'#fff', lineHeight:1.1, letterSpacing:'-.025em', marginBottom:8 }}>{children}</div>
const Sub     = ({ children }) => <div style={{ fontSize:15, color:'rgba(255,255,255,.45)', lineHeight:1.6, marginBottom:24 }}>{children}</div>
const Btn     = ({ children, onClick, disabled, gradient }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width:'100%', padding:'17px 0', borderRadius:16, border:'none', fontFamily:'inherit',
    fontSize:16, fontWeight:700, cursor: disabled?'default':'pointer',
    background: disabled ? 'rgba(255,255,255,.14)' : gradient || '#fff',
    color: disabled ? 'rgba(255,255,255,.3)' : gradient ? '#fff' : '#0b0b14',
    boxShadow: disabled ? 'none' : gradient ? '0 6px 24px rgba(118,75,162,.35)' : '0 4px 20px rgba(0,0,0,.3)',
  }}>{children}</button>
)

// ── Step: PATH ────────────────────────────────────────────────────────────────

function StepPath({ path, setPath, onNext }) {
  const opts = [
    { id:'A', icon:'🤳', title:"That's me",     desc:"Take 3 quick photos. We'll build your personal twin.", tag:'Personal',   accent:'#667eea' },
    { id:'B', icon:'✦',  title:'Choose a look', desc:'Pick a seed avatar — fully generated, no photos.',     tag:'Seed-based', accent:'#43e97b' },
  ]
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'94px 20px 0', position:'relative', zIndex:1 }}>
      <Label n={1}>Who will your avatar be?</Label>
      <Heading>Build your<br/>AI twin</Heading>
      <Sub>Choose how to create your character.</Sub>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {opts.map(c => (
          <div key={c.id} onClick={() => setPath(c.id)} style={{
            padding:'18px 18px', borderRadius:20, cursor:'pointer', display:'flex', gap:16, alignItems:'flex-start',
            background: path===c.id ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.05)',
            border:`1.5px solid ${path===c.id ? 'rgba(255,255,255,.4)' : 'rgba(255,255,255,.09)'}`,
            boxShadow: path===c.id ? `0 0 0 3px ${c.accent}33` : 'none', transition:'all .18s',
          }}>
            <div style={{ fontSize:26, lineHeight:1, marginTop:2 }}>{c.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:16, fontWeight:700, color:'#fff', marginBottom:4 }}>{c.title}</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,.45)', lineHeight:1.5, marginBottom:9 }}>{c.desc}</div>
              <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20, background:`${c.accent}18`, color:c.accent, border:`1px solid ${c.accent}33` }}>{c.tag}</span>
            </div>
            {path===c.id && <div style={{ width:20, height:20, borderRadius:'50%', background:'#fff', flexShrink:0, marginTop:2, display:'flex', alignItems:'center', justifyContent:'center' }}><svg width="9" height="7" viewBox="0 0 9 7" fill="none"><polyline points="1,3.5 3.5,6 8,1" stroke="#0b0b14" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
          </div>
        ))}
      </div>
      <div style={{ flex:1 }} />
      <div style={{ paddingBottom:32 }}><Btn onClick={onNext}>{path==='A'?'Continue with face scan →':'Continue with seed →'}</Btn></div>
    </div>
  )
}

// ── Step: SCAN ────────────────────────────────────────────────────────────────

function StepScan({ scanStep, scanCaptured, scanFlash, scanDone, onPhoto, onNext }) {
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'94px 20px 0', position:'relative', zIndex:1 }}>
      <Label n={2}>Face scan</Label>
      <Heading>Take 3 photos</Heading>
      <Sub>Position your face and tap the shutter.</Sub>

      <div style={{ width:'100%', aspectRatio:'3/4', maxHeight:250, borderRadius:20, overflow:'hidden', background:'#06060c', position:'relative', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14, flexShrink:0 }}>
        {scanFlash && <div style={{ position:'absolute', inset:0, background:'#fff', opacity:.85, animation:'camFlash4 .18s ease forwards', zIndex:10 }} />}
        {['33%','66%'].map(p => <div key={'v'+p} style={{ position:'absolute', left:p, top:0, bottom:0, width:1, background:'rgba(255,255,255,.05)' }} />)}
        {['33%','66%'].map(p => <div key={'h'+p} style={{ position:'absolute', top:p, left:0, right:0, height:1, background:'rgba(255,255,255,.05)' }} />)}
        <div style={{ width:'42%', aspectRatio:'2/3', border: scanDone?'2px solid #4ade80':'2px dashed rgba(255,255,255,.3)', borderRadius:'50%', position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-54%)' }} />
        {scanDone
          ? <div style={{ fontSize:42 }}>✅</div>
          : <>
              <div style={{ position:'absolute', bottom:10, left:10, right:10, display:'flex', gap:6 }}>
                {SCAN_STEPS.map((s,i) => (
                  <div key={i} style={{ flex:1, borderRadius:10, padding:'7px 4px', textAlign:'center', background: scanCaptured[i]?'rgba(74,222,128,.22)':i===scanStep?'rgba(255,255,255,.15)':'rgba(255,255,255,.05)', border: i===scanStep&&!scanCaptured[i]?'1px solid rgba(255,255,255,.22)':'1px solid transparent' }}>
                    <div style={{ fontSize:15 }}>{scanCaptured[i]?'✅':s.emoji}</div>
                    <div style={{ fontSize:8, color:'rgba(255,255,255,.6)', marginTop:2, fontWeight:500 }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <button onClick={onPhoto} style={{ position:'absolute', bottom:55, width:50, height:50, borderRadius:'50%', background:'transparent', border:'3px solid #fff', padding:3, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ width:'100%', height:'100%', borderRadius:'50%', background:'#fff' }} />
              </button>
            </>
        }
      </div>
      {scanDone && <div style={{ textAlign:'center', fontSize:13, fontWeight:600, color:'#4ade80', marginBottom:6 }}>All 3 photos captured ✓</div>}
      <div style={{ flex:1 }} />
      <div style={{ paddingBottom:32 }}><Btn onClick={onNext} disabled={!scanDone}>{scanDone?'Continue →':`Photo ${scanStep+1} of 3`}</Btn></div>
    </div>
  )
}

// ── Step: CONSENT ─────────────────────────────────────────────────────────────

function StepConsent({ c1, c2, setC1, setC2, onNext }) {
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'94px 20px 0', position:'relative', zIndex:1 }}>
      <div style={{ fontSize:52, textAlign:'center', marginBottom:16 }}>🔒</div>
      <Heading><span style={{ display:'block', textAlign:'center' }}>A quick promise</span></Heading>
      <Sub><span style={{ display:'block', textAlign:'center' }}>We need consent before processing your photos.</span></Sub>
      {[
        { val:c1, set:setC1, text:'I consent to processing my biometric data to create an AI avatar' },
        { val:c2, set:setC2, text:'This avatar is for my personal use only' },
      ].map((item,i) => (
        <div key={i} onClick={() => item.set(v => !v)} style={{
          display:'flex', gap:14, alignItems:'flex-start', padding:'15px 16px', marginBottom:10, cursor:'pointer',
          background: item.val ? 'rgba(255,255,255,.09)' : 'rgba(255,255,255,.04)',
          borderRadius:16, border:`1.5px solid ${item.val ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.08)'}`,
        }}>
          <div style={{ width:22, height:22, borderRadius:6, flexShrink:0, marginTop:1, border:`1.5px solid ${item.val?'#fff':'rgba(255,255,255,.25)'}`, background:item.val?'#fff':'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
            {item.val && <svg width="11" height="8" viewBox="0 0 11 8" fill="none"><polyline points="1,4 4,7 10,1" stroke="#0b0b14" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,.75)', lineHeight:1.6 }}>{item.text}</div>
        </div>
      ))}
      <div style={{ background:'rgba(255,255,255,.04)', borderRadius:12, padding:'11px 14px', marginTop:4 }}>
        <div style={{ fontSize:12, color:'rgba(255,255,255,.35)', lineHeight:1.6 }}>Photos are processed securely and <strong style={{ color:'rgba(255,255,255,.6)' }}>deleted after avatar creation</strong>.</div>
      </div>
      <div style={{ flex:1 }} />
      <div style={{ paddingBottom:32 }}><Btn onClick={onNext} disabled={!c1||!c2}>I agree — pick my voice →</Btn></div>
    </div>
  )
}

// ── Step: SEED ────────────────────────────────────────────────────────────────

function StepSeed({ selected, setSelected, onNext }) {
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'94px 20px 0', position:'relative', zIndex:1 }}>
      <Label n={2}>Seed avatar</Label>
      <Heading>Pick your look</Heading>
      <Sub>Generated just for you — shown to no one else.</Sub>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:9, marginBottom:16 }}>
        {SEEDS.map(seed => (
          <div key={seed.id} onClick={() => setSelected(seed.id)} style={{
            borderRadius:14, overflow:'hidden', position:'relative', aspectRatio:'3/4', cursor:'pointer',
            background:seed.gradient, outline: selected===seed.id ? '2.5px solid #fff' : '2.5px solid transparent',
            outlineOffset: selected===seed.id ? '2px' : '0px', transition:'outline .12s',
          }}>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 55%)' }} />
            {selected===seed.id && <div style={{ position:'absolute', top:6, right:6, width:18, height:18, borderRadius:'50%', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}><svg width="9" height="7" viewBox="0 0 9 7" fill="none"><polyline points="1,3.5 3.5,6 8,1" stroke="#0b0b14" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
            <div style={{ position:'absolute', bottom:0, padding:'6px 8px 8px' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#fff' }}>{seed.name}</div>
              <div style={{ fontSize:9, color:'rgba(255,255,255,.6)', marginTop:1 }}>{seed.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ paddingBottom:32 }}><Btn onClick={onNext} disabled={!selected}>{selected?`Continue with ${SEEDS.find(s=>s.id===selected)?.name} →`:'Select a look first'}</Btn></div>
    </div>
  )
}

// ── Step: VOICE ───────────────────────────────────────────────────────────────

function StepVoice({ gender, setGender, selectedVoice, setSelectedVoice, playingVoice, playVoice, vrecState, vrecSec, toggleVrec, resetRec, onNext }) {
  const voices = gender==='male' ? MALE_VOICES : FEMALE_VOICES
  const fmt    = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'94px 20px 0', overflowY:'auto', scrollbarWidth:'none', position:'relative', zIndex:1 }}>
      <Label>Almost there</Label>
      <Heading>Find your voice</Heading>
      <Sub>It'll narrate every video your twin creates.</Sub>

      {/* Gender toggle */}
      <div style={{ display:'flex', background:'rgba(255,255,255,.07)', borderRadius:12, padding:3, marginBottom:16 }}>
        {['female','male'].map(g => (
          <div key={g} onClick={() => { setGender(g); setSelectedVoice(g==='male'?'neutral':'soft') }} style={{
            flex:1, padding:'8px 0', borderRadius:10, textAlign:'center', fontSize:13, fontWeight:600, cursor:'pointer', textTransform:'capitalize',
            background:gender===g?'rgba(255,255,255,.14)':'transparent',
            color:gender===g?'#fff':'rgba(255,255,255,.38)',
            border:gender===g?'1px solid rgba(255,255,255,.18)':'1px solid transparent',
          }}>{g}</div>
        ))}
      </div>

      {/* Voice grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16, opacity:vrecState==='done'?.4:1, transition:'opacity .2s' }}>
        {voices.map(v => (
          <div key={v.id} onClick={() => vrecState!=='done' && setSelectedVoice(v.id)} style={{
            background:'rgba(255,255,255,.06)', borderRadius:14, padding:'12px 12px 10px', cursor:'pointer', position:'relative',
            border:`1.5px solid ${selectedVoice===v.id&&vrecState!=='done'?'rgba(255,255,255,.4)':'rgba(255,255,255,.08)'}`,
            boxShadow:selectedVoice===v.id&&vrecState!=='done'?'0 0 0 3px rgba(255,255,255,.07)':'none',
          }}>
            {v.forYou && <div style={{ position:'absolute', top:-1, right:10, background:'#fff', color:'#0b0b14', fontSize:8, fontWeight:700, textTransform:'uppercase', padding:'2px 7px', borderRadius:'0 0 6px 6px' }}>For you</div>}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#fff' }}>{v.name}</div>
              <div onClick={e => { e.stopPropagation(); playVoice(v.id) }} style={{ width:24, height:24, borderRadius:'50%', border:'1px solid rgba(255,255,255,.2)', background:playingVoice===v.id?'#fff':'rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                <div style={{ width:0, height:0, borderStyle:'solid', borderWidth:'3.5px 0 3.5px 6px', borderColor:`transparent transparent transparent ${playingVoice===v.id?'#0b0b14':'rgba(255,255,255,.6)'}`, marginLeft:1 }} />
              </div>
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.35)', marginBottom:8 }}>{v.desc}</div>
            <WaveBars playing={playingVoice===v.id} color="rgba(255,255,255,.25)" />
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ display:'flex', alignItems:'center', gap:10, margin:'2px 0 14px' }}>
        <div style={{ flex:1, height:1, background:'rgba(255,255,255,.08)' }} />
        <div style={{ fontSize:11, color:'rgba(255,255,255,.28)', whiteSpace:'nowrap' }}>or record your own</div>
        <div style={{ flex:1, height:1, background:'rgba(255,255,255,.08)' }} />
      </div>

      {/* Recorder */}
      <div style={{ background:'rgba(255,255,255,.05)', borderRadius:14, border:`1.5px solid ${vrecState==='done'?'rgba(255,255,255,.35)':'rgba(255,255,255,.08)'}`, padding:'14px 16px', marginBottom:8 }}>
        <div style={{ background:'rgba(255,255,255,.05)', borderRadius:9, padding:'8px 11px', fontSize:12, color:'rgba(255,255,255,.4)', fontStyle:'italic', lineHeight:1.55, marginBottom:12 }}>"Today we'll look at how neural networks work — simply and clearly."</div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={toggleVrec} style={{ width:44, height:44, borderRadius:'50%', flexShrink:0, border:'none', cursor:'pointer', background:vrecState==='recording'?'#E53935':vrecState==='done'?'#4ade80':'rgba(255,255,255,.12)', display:'flex', alignItems:'center', justifyContent:'center', animation:vrecState==='recording'?'recPulse4 1.2s ease-in-out infinite':'none' }}>
            {vrecState==='done'
              ? <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><polyline points="1,6 5.5,10.5 15,1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              : <svg width="12" height="16" viewBox="0 0 12 16" fill="none"><rect x="3.5" y="0" width="5" height="10" rx="2.5" fill="#fff"/><path d="M1 7.5C1 10.538 3.238 13 6 13s5-2.462 5-5.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/><line x1="6" y1="13" x2="6" y2="16" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>}
          </button>
          <div style={{ flex:1 }}>
            {vrecState==='idle'      && <div style={{ fontSize:12, color:'rgba(255,255,255,.35)' }}>Tap to record a sample</div>}
            {vrecState==='recording' && <WaveBars playing color="rgba(255,255,255,.65)" />}
            {vrecState==='done'      && <div style={{ fontSize:12, fontWeight:600, color:'#4ade80' }}>Recording saved ✓</div>}
          </div>
          {vrecState==='recording' && <div style={{ fontSize:11, color:'rgba(255,255,255,.45)', fontWeight:600 }}>{fmt(vrecSec)}</div>}
          {vrecState==='done'      && <div onClick={resetRec} style={{ fontSize:11, color:'rgba(255,255,255,.35)', cursor:'pointer', padding:'4px 8px', borderRadius:8, border:'1px solid rgba(255,255,255,.12)' }}>Redo</div>}
        </div>
      </div>

      <div style={{ paddingBottom:32, paddingTop:8, flexShrink:0 }}>
        <Btn onClick={onNext}>{vrecState==='done'?'Use my voice →':`Use ${voices.find(v=>v.id===selectedVoice)?.name||''} voice →`}</Btn>
      </div>
    </div>
  )
}

// ── Step: GEN ─────────────────────────────────────────────────────────────────

function StepGen({ progress, done, onDone }) {
  const activeIdx = done ? GEN_STEPS.length : Math.floor((progress/100)*GEN_STEPS.length)
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', padding:'94px 20px 0', position:'relative', zIndex:1 }}>
      {/* Animated orb */}
      <div style={{ position:'relative', marginBottom:24 }}>
        <div style={{ width:96, height:96, borderRadius:'50%', background:'conic-gradient(from 0deg,#667eea,#764ba2,#f093fb,#667eea)', animation:done?'none':'orbSpin4 2s linear infinite', boxShadow:'0 0 48px rgba(118,75,162,.55)' }} />
        {done && <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, borderRadius:'50%', background:'rgba(0,0,0,.45)' }}>✅</div>}
        {!done && <div style={{ position:'absolute', inset:3, borderRadius:'50%', background:'#0b0b14' }} />}
      </div>
      <Heading><span style={{ textAlign:'center', display:'block' }}>{done?'Avatar ready!':'Building your avatar'}</span></Heading>
      <Sub><span style={{ textAlign:'center', display:'block' }}>{done?'Your AI twin has been created.':'This takes just a moment…'}</span></Sub>

      {/* Progress bar */}
      <div style={{ width:'100%', height:4, background:'rgba(255,255,255,.08)', borderRadius:2, overflow:'hidden', marginBottom:20 }}>
        <div style={{ height:'100%', background:'linear-gradient(90deg,#667eea,#764ba2)', borderRadius:2, width:`${progress}%`, transition:'width 1.2s ease' }} />
      </div>

      {/* Steps list */}
      <div style={{ width:'100%', background:'rgba(255,255,255,.04)', borderRadius:16, border:'1px solid rgba(255,255,255,.07)', overflow:'hidden', marginBottom:24 }}>
        {GEN_STEPS.map((s,i) => {
          const isDone=i<activeIdx, isActive=i===activeIdx&&!done
          return (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 16px', borderBottom:i<GEN_STEPS.length-1?'1px solid rgba(255,255,255,.05)':'none', fontSize:13, color:isDone||isActive?'#fff':'rgba(255,255,255,.28)', fontWeight:isActive?600:400 }}>
              <div style={{ width:7, height:7, borderRadius:'50%', flexShrink:0, background:isDone?'#4ade80':isActive?'#fff':'rgba(255,255,255,.12)', animation:isActive?'gpaSpin4 1s ease-in-out infinite':'none' }} />
              {s}
              {isDone && <div style={{ marginLeft:'auto' }}><svg width="12" height="9" viewBox="0 0 12 9" fill="none"><polyline points="1,4.5 4.5,8 11,1" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
            </div>
          )
        })}
      </div>
      <div style={{ flex:1 }} />
      {done && <div style={{ width:'100%', paddingBottom:32 }}><Btn onClick={onDone} gradient="linear-gradient(135deg,#667eea,#764ba2)">Start creating videos →</Btn></div>}
    </div>
  )
}

// ── Done screen ───────────────────────────────────────────────────────────────

function DoneScreen({ avatar, onStart }) {
  return (
    <div style={{ flex:1, background:'#0b0b14', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 28px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:-60, left:'50%', transform:'translateX(-50%)', width:340, height:340, background:'radial-gradient(circle,#667eea18 0%,transparent 70%)', pointerEvents:'none' }} />
      <div style={{ width:104, height:104, borderRadius:'50%', background:avatar?.gradient||'linear-gradient(160deg,#667eea,#764ba2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:42, fontWeight:900, color:'#fff', marginBottom:24, boxShadow:'0 0 0 6px rgba(255,255,255,.08), 0 12px 40px rgba(0,0,0,.5)', animation:'avatarPop4 .45s cubic-bezier(.34,1.56,.64,1) both' }}>
        {avatar?.name?.[0]||'✦'}
      </div>
      <div style={{ fontSize:32, fontWeight:900, color:'#fff', textAlign:'center', lineHeight:1.12, letterSpacing:'-.025em', marginBottom:10, animation:'slideUp4 .35s ease .08s both' }}>
        Meet {avatar?.name||'your twin'} 👋
      </div>
      <div style={{ fontSize:15, color:'rgba(255,255,255,.45)', textAlign:'center', marginBottom:10, animation:'slideUp4 .35s ease .14s both' }}>
        Voice: <strong style={{ color:'rgba(255,255,255,.75)' }}>{avatar?.voice}</strong>
      </div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center', marginBottom:44, animation:'slideUp4 .35s ease .2s both' }}>
        {['Content','Reels','TikTok','Shorts'].map(tag => (
          <span key={tag} style={{ fontSize:11, fontWeight:600, padding:'4px 11px', borderRadius:20, background:'rgba(255,255,255,.08)', color:'rgba(255,255,255,.5)', border:'1px solid rgba(255,255,255,.1)' }}>{tag}</span>
        ))}
      </div>
      <div style={{ width:'100%', animation:'slideUp4 .35s ease .26s both' }}>
        <Btn onClick={onStart}>Let's make your first video →</Btn>
      </div>
    </div>
  )
}

// ── V4 App — Stories Wizard ───────────────────────────────────────────────────

export default function V4App() {
  const [phase,    setPhase]    = useState('wizard')   // 'wizard' | 'done' | 'feed'
  const [stepIdx,  setStepIdx]  = useState(0)
  const [animDir,  setAnimDir]  = useState(1)
  const [animKey,  setAnimKey]  = useState(0)

  // Avatar creation state
  const [path,         setPath]         = useState('A')
  const [scanStep,     setScanStep]     = useState(0)
  const [scanCaptured, setScanCaptured] = useState([false,false,false])
  const [scanFlash,    setScanFlash]    = useState(false)
  const [consent1,     setConsent1]     = useState(false)
  const [consent2,     setConsent2]     = useState(false)
  const [selectedSeed, setSelectedSeed] = useState(null)
  const [gender,       setGender]       = useState('male')
  const [selVoice,     setSelVoice]     = useState('neutral')
  const [playingVoice, setPlayingVoice] = useState(null)
  const [vrecState,    setVrecState]    = useState('idle')
  const [vrecSec,      setVrecSec]      = useState(0)
  const [genProgress,  setGenProgress]  = useState(0)
  const [genDone,      setGenDone]      = useState(false)
  const [avatar,       setAvatar]       = useState(null)

  const vrecRef  = useRef(null)
  const playRef  = useRef(null)
  const touchX   = useRef(0)

  useEffect(() => () => { clearInterval(vrecRef.current); clearTimeout(playRef.current) }, [])

  // Steps depend on chosen path
  const steps = path === 'A'
    ? ['path','scan','consent','voice','gen']
    : ['path','seed','voice','gen']

  const currentStep = steps[stepIdx]

  // Navigate
  const nav = (delta) => {
    const next = stepIdx + delta
    if (next < 0 || next >= steps.length) return
    setAnimDir(delta)
    setAnimKey(k => k + 1)
    setStepIdx(next)
  }

  // Touch swipe
  const onTouchStart = e => { touchX.current = e.touches[0].clientX }
  const onTouchEnd   = e => {
    const dx = e.changedTouches[0].clientX - touchX.current
    if (dx < -55 && currentStep !== 'gen') nav(1)
    else if (dx > 55) nav(-1)
  }

  // Start gen when reaching gen step
  useEffect(() => {
    if (currentStep !== 'gen') return
    setGenProgress(0); setGenDone(false)
    let p = 0
    const t = setInterval(() => {
      p += 19 + Math.random() * 5
      if (p >= 100) { p = 100; clearInterval(t); setGenDone(true) }
      setGenProgress(Math.min(p, 100))
    }, 800)
    return () => clearInterval(t)
  }, [currentStep, animKey])

  // Scan
  const scanDone = scanCaptured.every(Boolean)
  const takePhoto = () => {
    setScanFlash(true)
    setTimeout(() => setScanFlash(false), 180)
    const next = scanCaptured.map((v,i) => i===scanStep?true:v)
    setScanCaptured(next)
    if (scanStep < 2) setTimeout(() => setScanStep(s=>s+1), 450)
  }

  // Voice
  const playVoice = id => {
    if (playingVoice===id) { setPlayingVoice(null); clearTimeout(playRef.current) }
    else { setPlayingVoice(id); clearTimeout(playRef.current); playRef.current = setTimeout(() => setPlayingVoice(null), 2500) }
  }
  const toggleVrec = () => {
    if (vrecState==='recording') { clearInterval(vrecRef.current); setVrecState('done') }
    else { setVrecState('recording'); setVrecSec(0); vrecRef.current = setInterval(() => setVrecSec(s=>s+1), 1000) }
  }

  // Finish wizard
  const finishAvatar = () => {
    const seed = SEEDS.find(s => s.id===selectedSeed)
    const voices = gender==='male' ? MALE_VOICES : FEMALE_VOICES
    const v = voices.find(v => v.id===selVoice)
    setAvatar({
      name:     path==='A' ? 'My Avatar' : (seed?.name||'Avatar'),
      gradient: path==='A' ? 'linear-gradient(160deg,#F4C5B0,#C0513A)' : (seed?.gradient||SEEDS[0].gradient),
      voice:    vrecState==='done' ? 'Custom' : v?.name,
    })
    setPhase('done')
  }

  // ── Phases ───────────────────────────────────────────────────────────────────

  if (phase === 'done') return <DoneScreen avatar={avatar} onStart={() => setPhase('feed')} />
  if (phase === 'feed') return <FeedPhase avatar={avatar} />

  // ── Wizard ───────────────────────────────────────────────────────────────────

  const [g1, g2] = STEP_GLOW[currentStep] || ['#667eea','#764ba2']

  return (
    <div
      style={{ flex:1, position:'relative', overflow:'hidden', background:'#0b0b14', display:'flex', flexDirection:'column' }}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
    >
      {/* Ambient glow changes per step */}
      <div style={{ position:'absolute', top:-100, left:'50%', transform:'translateX(-50%)', width:380, height:380, background:`radial-gradient(circle, ${g1}1c 0%, transparent 65%)`, pointerEvents:'none', zIndex:0, transition:'background .5s ease' }} />

      {/* Progress bar */}
      <StoryBar total={steps.length} current={stepIdx} />

      {/* Back button */}
      {stepIdx > 0 && (
        <button onClick={() => nav(-1)} style={{ position:'absolute', top:70, left:14, zIndex:60, background:'none', border:'none', cursor:'pointer', padding:'6px 8px', display:'flex', alignItems:'center', gap:5, color:'rgba(255,255,255,.5)', fontSize:13, fontWeight:500, fontFamily:'inherit' }}>
          <svg width="7" height="13" viewBox="0 0 7 13" fill="none"><polyline points="6,1 1,6.5 6,12" stroke="rgba(255,255,255,.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </button>
      )}

      {/* Step content — slides in */}
      <div key={animKey} style={{ flex:1, display:'flex', flexDirection:'column', animation:`${animDir>0?'wizRight4':'wizLeft4'} .27s cubic-bezier(.32,0,.15,1) both` }}>
        {currentStep==='path'    && <StepPath    path={path} setPath={setPath} onNext={() => nav(1)} />}
        {currentStep==='scan'    && <StepScan    scanStep={scanStep} scanCaptured={scanCaptured} scanFlash={scanFlash} scanDone={scanDone} onPhoto={takePhoto} onNext={() => nav(1)} />}
        {currentStep==='consent' && <StepConsent c1={consent1} c2={consent2} setC1={setConsent1} setC2={setConsent2} onNext={() => nav(1)} />}
        {currentStep==='seed'    && <StepSeed    selected={selectedSeed} setSelected={setSelectedSeed} onNext={() => nav(1)} />}
        {currentStep==='voice'   && <StepVoice   gender={gender} setGender={setGender} selectedVoice={selVoice} setSelectedVoice={setSelVoice} playingVoice={playingVoice} playVoice={playVoice} vrecState={vrecState} vrecSec={vrecSec} toggleVrec={toggleVrec} resetRec={() => { setVrecState('idle'); setVrecSec(0) }} onNext={() => nav(1)} />}
        {currentStep==='gen'     && <StepGen     progress={genProgress} done={genDone} onDone={finishAvatar} />}
      </div>

      <style>{`
        @keyframes storyFill4  { from{transform:scaleX(0);transform-origin:left} to{transform:scaleX(1);transform-origin:left} }
        @keyframes wizRight4   { from{opacity:0;transform:translateX(48px)} to{opacity:1;transform:translateX(0)} }
        @keyframes wizLeft4    { from{opacity:0;transform:translateX(-48px)} to{opacity:1;transform:translateX(0)} }
        @keyframes vpa4        { from{transform:scaleY(1)} to{transform:scaleY(2.2)} }
        @keyframes camFlash4   { from{opacity:.85} to{opacity:0} }
        @keyframes recPulse4   { 0%,100%{box-shadow:0 0 0 0 rgba(229,57,53,.4)} 50%{box-shadow:0 0 0 10px rgba(229,57,53,0)} }
        @keyframes gpaSpin4    { 0%,100%{opacity:1} 50%{opacity:.2} }
        @keyframes orbSpin4    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes avatarPop4  { from{opacity:0;transform:scale(.5)} to{opacity:1;transform:scale(1)} }
        @keyframes slideUp4    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}

// ── Feed Phase ────────────────────────────────────────────────────────────────

function FeedPhase({ avatar }) {
  const [myVideos,   setMyVideos]   = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [prompt,     setPrompt]     = useState('')
  const [genProg,    setGenProg]    = useState(0)
  const [genDone,    setGenDone]    = useState(false)
  const [genPhase,   setGenPhase]   = useState('prompt') // 'prompt' | 'gen'

  const feedItems = [...myVideos.map(v=>({...v,isMine:true})), ...TEMPLATES.map(t=>({...t,isMine:false}))]

  const startGen = () => {
    if (!prompt.trim()) return
    setGenPhase('gen'); setGenProg(0); setGenDone(false)
    let p = 0
    const t = setInterval(() => {
      p += 24 + Math.random() * 5
      if (p >= 100) { p = 100; clearInterval(t); setGenDone(true) }
      setGenProg(Math.min(p, 100))
    }, 650)
  }

  const finishVideo = () => {
    setMyVideos(v => [{ id:Date.now(), gradient:'linear-gradient(160deg,#667eea,#764ba2)', caption:prompt, isMine:true }, ...v])
    setPrompt(''); setShowCreate(false); setGenPhase('prompt')
  }

  const GEN_VID = ['Content moderation','Writing script','Generating video','Adding AI watermark']
  const activeGIdx = genDone ? GEN_VID.length : Math.floor((genProg/100)*GEN_VID.length)

  return (
    <div style={{ flex:1, position:'relative', background:'#000', overflow:'hidden' }}>

      {/* Feed */}
      <div style={{ position:'absolute', inset:0, overflowY:'scroll', scrollSnapType:'y mandatory', scrollbarWidth:'none' }}>
        {feedItems.map(item => <FeedCardV4 key={item.id} item={item} avatar={avatar} onUse={() => { setShowCreate(true); setGenPhase('prompt') }} />)}
      </div>

      {/* "For You" label */}
      <div style={{ position:'absolute', top:0, left:0, right:0, zIndex:20, display:'flex', justifyContent:'center', padding:'14px 0 10px', background:'linear-gradient(to bottom,rgba(0,0,0,.5) 0%,transparent 100%)', pointerEvents:'none' }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#fff', borderBottom:'2px solid #fff', paddingBottom:4 }}>For You</div>
      </div>

      {/* Avatar pill top-left */}
      <div style={{ position:'absolute', top:10, left:14, zIndex:25, display:'flex', alignItems:'center', gap:8, background:'rgba(0,0,0,.55)', borderRadius:20, padding:'5px 12px 5px 5px', backdropFilter:'blur(8px)' }}>
        <div style={{ width:28, height:28, borderRadius:'50%', background:avatar?.gradient||'linear-gradient(160deg,#667eea,#764ba2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#fff' }}>{avatar?.name?.[0]||'✦'}</div>
        <span style={{ fontSize:12, fontWeight:600, color:'#fff' }}>{avatar?.name||'My Avatar'}</span>
      </div>

      {/* Tab bar */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, zIndex:30, display:'flex', alignItems:'center', background:'rgba(0,0,0,.88)', borderTop:'0.5px solid rgba(255,255,255,.1)', padding:'8px 0 20px' }}>
        <div style={{ flex:1, display:'flex', justifyContent:'center' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="1.8"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9" fill="none"/></svg></div>
        <div style={{ flex:1, display:'flex', justifyContent:'center' }}>
          <button onClick={() => { setShowCreate(true); setGenPhase('prompt') }} style={{ width:48, height:32, borderRadius:8, border:'none', cursor:'pointer', background:'linear-gradient(90deg,#69C9D0,#fff,#EE1D52)', padding:1.5, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:'100%', height:'100%', background:'#fff', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><line x1="9" y1="3" x2="9" y2="15" stroke="#1A1916" strokeWidth="2.2" strokeLinecap="round"/><line x1="3" y1="9" x2="15" y2="9" stroke="#1A1916" strokeWidth="2.2" strokeLinecap="round"/></svg>
            </div>
          </button>
        </div>
        <div style={{ flex:1, display:'flex', justifyContent:'center' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div style={{ position:'absolute', inset:0, zIndex:200 }}>
          <div onClick={() => setShowCreate(false)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.6)' }} />
          <div onClick={e => e.stopPropagation()} style={{ position:'absolute', bottom:0, left:0, right:0, background:'#fff', borderRadius:'24px 24px 0 0', maxHeight:'82%', display:'flex', flexDirection:'column', animation:'feedModalUp4 .3s cubic-bezier(.32,0,.15,1) both' }}>
            <div style={{ display:'flex', justifyContent:'flex-end', padding:'14px 16px 0' }}>
              <button onClick={() => setShowCreate(false)} style={{ width:28, height:28, borderRadius:'50%', border:'none', background:'#F0EEE9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><line x1="1" y1="1" x2="9" y2="9" stroke="#9B9894" strokeWidth="1.8" strokeLinecap="round"/><line x1="9" y1="1" x2="1" y2="9" stroke="#9B9894" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </button>
            </div>

            {genPhase === 'prompt' && (
              <div style={{ flex:1, overflowY:'auto', padding:'0 20px', scrollbarWidth:'none' }}>
                <div style={{ fontSize:20, fontWeight:700, color:'#1A1916', padding:'8px 0 4px' }}>What's your video about?</div>
                <div style={{ fontSize:14, color:'#9B9894', marginBottom:16 }}>Describe your idea — your twin does the rest.</div>
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g. 3 mistakes creators make when using AI…" style={{ width:'100%', minHeight:100, padding:14, borderRadius:14, border:'1.5px solid #E0DDD6', background:'#fff', fontSize:14, color:'#1A1916', fontFamily:'inherit', resize:'none', outline:'none', lineHeight:1.55, boxSizing:'border-box' }} />
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', margin:'10px 0 16px' }}>
                  {['3 tips for…','Why nobody talks about…','The secret to…'].map(s => (
                    <div key={s} onClick={() => setPrompt(s)} style={{ padding:'6px 12px', borderRadius:20, border:'1px solid #E8E5E0', background:'#fff', fontSize:12, color:'#1A1916', cursor:'pointer', whiteSpace:'nowrap' }}>{s}</div>
                  ))}
                </div>
              </div>
            )}

            {genPhase === 'gen' && (
              <div style={{ flex:1, overflowY:'auto', padding:'0 20px', scrollbarWidth:'none' }}>
                <div style={{ fontSize:20, fontWeight:700, color:'#1A1916', padding:'8px 0 4px' }}>{genDone?'Video ready! 🎉':'Generating your video'}</div>
                <div style={{ fontSize:14, color:'#9B9894', marginBottom:16 }}>{genDone?'Your AI video has been created.':'Sit back — usually a few minutes.'}</div>
                <div style={{ height:4, background:'#F0EEE9', borderRadius:2, overflow:'hidden', marginBottom:16 }}>
                  <div style={{ height:'100%', background:'#1A1916', borderRadius:2, width:`${genProg}%`, transition:'width 1.2s ease' }} />
                </div>
                <div style={{ background:'#fff', borderRadius:16, border:'1px solid #E8E5E0', overflow:'hidden' }}>
                  {GEN_VID.map((s,i) => {
                    const isDone=i<activeGIdx, isActive=i===activeGIdx&&!genDone
                    return (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderBottom:i<GEN_VID.length-1?'1px solid #F0EEE9':'none', fontSize:13, color:isDone||isActive?'#1A1916':'#C0BDB8', fontWeight:isActive?600:400 }}>
                        <div style={{ width:7, height:7, borderRadius:'50%', flexShrink:0, background:isDone?'#4ade80':isActive?'#1A1916':'#E0DDD6', animation:isActive?'gpaSpin4 1s ease-in-out infinite':'none' }} />
                        {s}
                        {isDone && <div style={{ marginLeft:'auto' }}><svg width="12" height="9" viewBox="0 0 12 9" fill="none"><polyline points="1,4.5 4.5,8 11,1" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div style={{ padding:'12px 20px 32px', background:'linear-gradient(to top,#fff 70%,transparent)', flexShrink:0 }}>
              {genPhase==='prompt' && <button onClick={startGen} disabled={!prompt.trim()} style={{ width:'100%', padding:16, borderRadius:16, border:'none', cursor:prompt.trim()?'pointer':'default', background:prompt.trim()?'#1A1916':'#D4D1CB', color:prompt.trim()?'#FAFAF8':'#9B9894', fontSize:15, fontWeight:600, fontFamily:'inherit' }}>Generate video →</button>}
              {genPhase==='gen' && genDone && <button onClick={finishVideo} style={{ width:'100%', padding:16, borderRadius:16, border:'none', cursor:'pointer', background:'#1A1916', color:'#FAFAF8', fontSize:15, fontWeight:600, fontFamily:'inherit' }}>See my video →</button>}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes feedModalUp4 { from{transform:translateY(100%)} to{transform:translateY(0)} }`}</style>
    </div>
  )
}

// ── Feed Card V4 ──────────────────────────────────────────────────────────────

function FeedCardV4({ item, avatar, onUse }) {
  const videoRef = useRef(null)
  useEffect(() => {
    const el = videoRef.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.currentTime=0; el.play().catch(()=>{}) } else el.pause() }, { threshold:0.6 })
    obs.observe(el); return () => obs.disconnect()
  }, [])

  return (
    <div style={{ flex:'0 0 100%', scrollSnapAlign:'start', position:'relative', background:'#000', display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      {item.video
        ? <video ref={videoRef} src={item.video} muted loop playsInline style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
        : <div style={{ position:'absolute', inset:0, background:item.gradient||'#111' }} />
      }
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.82) 0%,transparent 55%)' }} />

      {/* Avatar — show user's avatar if isMine, else template's */}
      {(item.isMine ? avatar : item.avatar) && (
        <div style={{ position:'absolute', top:14, right:12, zIndex:2 }}>
          <div style={{ width:42, height:42, borderRadius:'50%', background:(item.isMine?avatar:item.avatar)?.gradient, border:'2px solid rgba(255,255,255,.7)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'#fff', boxShadow:'0 2px 8px rgba(0,0,0,.4)' }}>
            {(item.isMine?avatar:item.avatar)?.name?.[0]||'✦'}
          </div>
        </div>
      )}

      <div style={{ position:'relative', zIndex:1, padding:'0 16px 88px' }}>
        {item.metric && (
          <div style={{ marginBottom:8 }}>
            <span style={{ fontSize:22, fontWeight:900, color:'#fff', letterSpacing:'-.02em', lineHeight:1 }}>{item.metric.value}</span>
            <span style={{ fontSize:13, fontWeight:500, color:'rgba(255,255,255,.6)', marginLeft:6 }}>· {item.metric.context}</span>
          </div>
        )}
        <div style={{ fontSize:13, fontWeight:600, color:'#fff', marginBottom:4 }}>@twin_ai_{item.id}</div>
        <div style={{ fontSize:14, color:'rgba(255,255,255,.9)', lineHeight:1.45, marginBottom:14 }}>{item.caption||item.label}</div>
        <div onClick={onUse} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'13px 20px', borderRadius:14, background:'linear-gradient(135deg,rgba(255,255,255,.26) 0%,rgba(180,160,255,.33) 50%,rgba(255,180,120,.26) 100%)', border:'1.5px solid rgba(255,255,255,.55)', cursor:'pointer', backdropFilter:'blur(12px)', boxShadow:'0 2px 16px rgba(160,120,255,.22)' }}>
          <span style={{ fontSize:15, fontWeight:700, color:'#fff', textShadow:'0 1px 6px rgba(0,0,0,.3)' }}>{item.isMine?'🔁 Make similar':'✦ Use this style'}</span>
        </div>
      </div>
    </div>
  )
}

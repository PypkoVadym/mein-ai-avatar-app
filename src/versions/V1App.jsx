import { useState } from 'react'
import Signup from '../screens/Signup.jsx'
import OnboardingQuestion from '../screens/OnboardingQuestion.jsx'
import CharacterChoice from '../screens/CharacterChoice.jsx'
import FaceScan from '../screens/FaceScan.jsx'
import SeedSelection from '../screens/SeedSelection.jsx'
import VoiceSelection from '../screens/VoiceSelection.jsx'
import AvatarGeneration from '../screens/AvatarGeneration.jsx'
import AvatarScreen from '../screens/AvatarScreen.jsx'
import AvatarBrowser from '../screens/AvatarBrowser.jsx'
import Library from '../screens/Library.jsx'

const PROGRESS_MAP = {
  q1: 1, q2: 2, q3: 3, q4: 4, q5: 5,
  character_choice: 6,
  face_scan: 7, seed_selection: 7,
  voice: 8,
  generation: 9,
}
const TOTAL_STEPS = 9

const QUESTIONS = [
  {
    key: 'q1', num: 1, field: 'purpose',
    question: 'What will you use it for?',
    options: ['Social media content 📱', 'Education 🎓', 'Business communication 💼', 'Personal blog ✍️', 'Other'],
    multiSelect: false,
  },
  {
    key: 'q2', num: 2, field: 'frequency',
    question: 'How often do you plan to post?',
    options: ['Every day', 'A few times a week', 'Occasionally'],
    multiSelect: false,
  },
  {
    key: 'q3', num: 3, field: 'experience',
    question: 'Experience with AI content?',
    options: ['Yes, actively 🚀', 'Tried before 🤔', "No, I'm new 👋"],
    multiSelect: false,
  },
  {
    key: 'q4', num: 4, field: 'platforms',
    question: 'Which platforms?',
    options: ['TikTok', 'YouTube', 'LinkedIn', 'Instagram', 'Other'],
    multiSelect: true,
  },
  {
    key: 'q5', num: 5, field: 'niches',
    question: "What's your niche?",
    options: ['Business & Finance 📈', 'Education 📚', 'Lifestyle 🌿', 'Technology 💻', 'Other'],
    multiSelect: true,
  },
]

export default function V1App() {
  const [screen, setScreen] = useState('library')
  const [prevScreen, setPrevScreen] = useState(null)
  const [direction, setDirection] = useState('forward')
  const [showCookie, setShowCookie] = useState(true)
  const [answers, setAnswers] = useState({
    purpose: null, frequency: null, experience: null, platforms: [], niches: [],
  })
  const [path, setPath] = useState('A')
  const [selectedSeed, setSelectedSeed] = useState(null)
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [gender, setGender] = useState('female')
  const [selectedAvatar, setSelectedAvatar] = useState({
    id: 'mine', name: 'My Avatar', emoji: '🧑‍💼',
    gradient: 'linear-gradient(135deg,#F4C5B0,#C0513A)', mine: true,
  })

  const goTo = (nextScreen, goingBack = false) => {
    setPrevScreen(screen)
    setDirection(goingBack ? 'back' : 'forward')
    setScreen(nextScreen)
  }

  const goBack = () => {
    const backMap = {
      q1: 'signup',
      q2: 'q1', q3: 'q2', q4: 'q3', q5: 'q4',
      character_choice: 'q5',
      face_scan: 'character_choice',
      seed_selection: 'character_choice',
      voice: path === 'A' ? 'face_scan' : 'seed_selection',
      generation: 'voice',
    }
    const target = backMap[screen]
    if (target) goTo(target, true)
  }

  const progress = PROGRESS_MAP[screen]
    ? (PROGRESS_MAP[screen] / TOTAL_STEPS) * 100
    : null

  const resetToOnboarding = () => {
    setScreen('signup')
    setPrevScreen(null)
    setDirection('forward')
    setShowCookie(true)
    setAnswers({ purpose: null, frequency: null, experience: null, platforms: [], niches: [] })
    setPath('A')
    setSelectedSeed(null)
    setSelectedVoice(null)
    setGender('female')
  }

  const currentQ = QUESTIONS.find(q => q.key === screen)

  const renderScreen = () => {
    if (currentQ) {
      const { field, question, options, multiSelect, num } = currentQ
      const selected = answers[field]
      const onSelect = (val) => {
        setAnswers(prev => {
          if (multiSelect) {
            const arr = prev[field] || []
            return { ...prev, [field]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] }
          }
          return { ...prev, [field]: val }
        })
      }
      const onContinue = () => {
        const nextQ = QUESTIONS.find(q => q.num === num + 1)
        goTo(nextQ ? nextQ.key : 'character_choice')
      }
      return (
        <OnboardingQuestion
          key={screen}
          questionNum={num}
          totalQuestions={5}
          question={question}
          options={options}
          multiSelect={multiSelect}
          selected={selected}
          onSelect={onSelect}
          onContinue={onContinue}
          onBack={goBack}
          direction={direction}
        />
      )
    }

    switch (screen) {
      case 'signup':
        return <Signup key="signup" goTo={goTo} showCookie={showCookie} setShowCookie={setShowCookie} direction={direction} />
      case 'character_choice':
        return <CharacterChoice key="character_choice" answers={answers} path={path} setPath={setPath} goTo={goTo} onBack={goBack} direction={direction} />
      case 'face_scan':
        return <FaceScan key="face_scan" goTo={goTo} onBack={goBack} direction={direction} />
      case 'seed_selection':
        return <SeedSelection key="seed_selection" selectedSeed={selectedSeed} setSelectedSeed={setSelectedSeed} goTo={goTo} onBack={goBack} direction={direction} />
      case 'voice':
        return <VoiceSelection key="voice" gender={gender} setGender={setGender} answers={answers} selectedVoice={selectedVoice} setSelectedVoice={setSelectedVoice} goTo={goTo} onBack={goBack} direction={direction} />
      case 'generation':
        return <AvatarGeneration key="generation" goTo={(s) => goTo(s === 'library' ? 'avatar' : s)} direction={direction} />
      case 'avatar':
        return <AvatarScreen key="avatar" goTo={goTo} path={path} direction={direction} />
      case 'avatar_browser':
        return <AvatarBrowser key="avatar_browser" selectedAvatar={selectedAvatar} onSelect={setSelectedAvatar} onViewMine={() => goTo('avatar')} goBack={() => goTo('library', true)} />
      case 'library':
        return <Library key="library" goTo={goTo} path={path} direction={direction} selectedAvatar={selectedAvatar} />
      default:
        return null
    }
  }

  return (
    <>
      {/* Debug buttons */}
      <button className="debug-btn" onClick={resetToOnboarding}>↺ Onboarding</button>
      <button className="debug-btn" style={{ top: 52 }} onClick={() => goTo('avatar')}>👤 Avatar</button>

      {/* Progress bar */}
      {progress !== null && (
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Screens */}
      <div className="screen-container">
        {renderScreen()}
      </div>
    </>
  )
}

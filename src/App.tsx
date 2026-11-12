import { useEffect, useState } from 'react'
import { BookOpen, Layers3, Menu, Search, ShoppingBag, X } from 'lucide-react'
import Batches from './pages/Batches'
import Focus from './pages/Focus'
import CourseDetail from './pages/CourseDetail'
import Study from './pages/Study'
import VirtualLibrary from './pages/VirtualLibrary'
import type { HighlightPage, SavedHighlight, StudyNoteTopic } from './types/StudyNotes'

type Screen = 'batches' | 'focus' | 'study' | 'virtual-library' | 'course-detail'
type CourseReturnScreen = 'batches' | 'study'
const STUDY_NOTES_STORAGE_KEY = 'pw-study-notes'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const values = crypto.getRandomValues(new Uint32Array(4))
    return Array.from(values, (value) => value.toString(36)).join('-')
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

function getHighlightPosition(highlight: SavedHighlight) {
  const firstPage = [...highlight.pages].sort((a, b) => a.pageNumber - b.pageNumber)[0]
  const firstRect = firstPage?.rects.slice().sort((a, b) => a.y - b.y || a.x - b.x)[0]
  return {
    pageNumber: firstPage?.pageNumber ?? Number.POSITIVE_INFINITY,
    y: firstRect?.y ?? Number.POSITIVE_INFINITY,
    x: firstRect?.x ?? Number.POSITIVE_INFINITY,
  }
}

function compareHighlightsByPdfPosition(a: SavedHighlight, b: SavedHighlight): number {
  const positionA = getHighlightPosition(a)
  const positionB = getHighlightPosition(b)
  return positionA.pageNumber - positionB.pageNumber
    || positionA.y - positionB.y
    || positionA.x - positionB.x
}

function isStudyNoteTopicList(value: unknown): value is StudyNoteTopic[] {
  if (!Array.isArray(value)) return false
  return value.every((item) => {
    if (!isRecord(item)) return false
    const topic = item
    return typeof topic.courseName === 'string'
      && typeof topic.title === 'string'
      && Array.isArray(topic.highlights)
      && Array.isArray(topic.notes)
      && topic.highlights.every((highlight) => {
        if (!isRecord(highlight) || !Array.isArray(highlight.pages)) return false
        return typeof highlight.id === 'string'
          && typeof highlight.text === 'string'
          && typeof highlight.createdAt === 'string'
          && highlight.pages.every((page) => {
            if (!isRecord(page) || !Array.isArray(page.rects)) return false
            return typeof page.pageNumber === 'number'
              && page.rects.every((rect) => isRecord(rect)
                && typeof rect.x === 'number'
                && typeof rect.y === 'number'
                && typeof rect.width === 'number'
                && typeof rect.height === 'number')
          })
      })
      && topic.notes.every((note) => isRecord(note)
        && typeof note.id === 'string'
        && typeof note.text === 'string'
        && typeof note.createdAt === 'string')
  })
}

function readStudyNotes(): StudyNoteTopic[] {
  try {
    const savedNotes = window.localStorage.getItem(STUDY_NOTES_STORAGE_KEY)
    if (!savedNotes) return []
    const parsedNotes: unknown = JSON.parse(savedNotes)
    if (!isStudyNoteTopicList(parsedNotes)) throw new Error('Saved study notes have an invalid format.')
    return parsedNotes.map((topic) => ({
      ...topic,
      highlights: [...topic.highlights].sort(compareHighlightsByPdfPosition),
    }))
  } catch (error) {
    console.error('Unable to read saved study notes.', error)
    return []
  }
}

function App() {
  const [splashVisible, setSplashVisible] = useState(true)
  const [screen, setScreen] = useState<Screen>('batches')
  const [query, setQuery] = useState('')
  const [navigationOpen, setNavigationOpen] = useState(false)
  const [activeCourseName, setActiveCourseName] = useState<string | null>(null)
  const [courseNoteTarget, setCourseNoteTarget] = useState<{ courseName: string; title: string; pageNumber: number; y?: number } | null>(null)
  const [courseReturnScreen, setCourseReturnScreen] = useState<CourseReturnScreen>('batches')
  const [studyNotes, setStudyNotes] = useState<StudyNoteTopic[]>(readStudyNotes)

  useEffect(() => {
    try {
      window.localStorage.setItem(STUDY_NOTES_STORAGE_KEY, JSON.stringify(studyNotes))
    } catch (error) {
      console.error('Unable to save study notes.', error)
    }
  }, [studyNotes])

  const updateStudyNotes = (update: (current: StudyNoteTopic[]) => StudyNoteTopic[]) => {
    setStudyNotes(update)
  }

  const savePersonalNote = (courseName: string, title: string, text: string, pages?: HighlightPage[]) => {
    const note = { id: createId(), text, createdAt: new Date().toISOString(), ...(pages ? { pages } : {}) }
    updateStudyNotes((current) => {
      const topicIndex = current.findIndex((topic) => topic.courseName === courseName && topic.title === title)
      if (topicIndex === -1) return [...current, { courseName, title, highlights: [], notes: [note] }]
      return current.map((topic, index) => index === topicIndex
        ? { ...topic, notes: [...topic.notes, note] }
        : topic)
    })
  }

  const savePdfHighlight = (courseName: string, title: string, text: string, pages: HighlightPage[]) => {
    const highlight: SavedHighlight = { id: createId(), text, pages, createdAt: new Date().toISOString() }
    updateStudyNotes((current) => {
      const topicIndex = current.findIndex((topic) => topic.courseName === courseName && topic.title === title)
      if (topicIndex === -1) return [...current, { courseName, title, highlights: [highlight], notes: [] }]
      return current.map((topic, index) => index === topicIndex
        ? { ...topic, highlights: [...topic.highlights, highlight].sort(compareHighlightsByPdfPosition) }
        : topic)
    })
  }

  const editPdfHighlight = (courseName: string, title: string, highlightId: string, text: string) => {
    const updatedText = text.trim()
    if (!updatedText) return
    updateStudyNotes((current) => current.map((topic) => topic.courseName === courseName && topic.title === title
      ? { ...topic, highlights: topic.highlights.map((highlight) => highlight.id === highlightId ? { ...highlight, text: updatedText } : highlight) }
      : topic))
  }

  const deletePersonalNote = (courseName: string, title: string, noteId: string) => {
    updateStudyNotes((current) => current.map((topic) => topic.courseName === courseName && topic.title === title
      ? { ...topic, notes: topic.notes.filter((note) => note.id !== noteId), highlights: topic.highlights.filter((highlight) => highlight.id !== noteId) }
      : topic))
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => setSplashVisible(false), 1200)
    return () => window.clearTimeout(timeout)
  }, [])

  const switchScreen = (nextScreen: Screen) => {
    setScreen(nextScreen)
    setNavigationOpen(false)
  }

  return (
    <>
      <div className={`app-shell${splashVisible ? ' app-shell-loading' : ''}`} aria-hidden={splashVisible} inert={splashVisible}>
        {screen !== 'virtual-library' && screen !== 'course-detail' && screen !== 'study' && <header className={`top-header${screen === 'focus' ? ' focus-top-header' : ''}`}>
          <div className="top-header-inner">
            <button
              className="header-icon"
              type="button"
              onClick={() => setNavigationOpen((open) => !open)}
              aria-label={navigationOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={navigationOpen}
              aria-controls="navigation-menu"
            >
              <Menu size={19} />
            </button>
            <label className="search-field">
              <Search size={20} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={screen === 'focus' ? 'Search libraries' : 'Search for batches'}
                aria-label={screen === 'focus' ? 'Search libraries' : 'Search for batches'}
              />
              {query && (
                <button type="button" className="clear-search" onClick={() => setQuery('')} aria-label="Clear search">
                  <X size={14} />
                </button>
              )}
            </label>
            <div className="balance-chip" aria-label="Account balance: 0">
              <span className="coin-dot" aria-hidden="true">₹</span>
              <span>0</span>
            </div>
          </div>
          {navigationOpen && (
            <nav className="navigation-menu" id="navigation-menu" aria-label="Main navigation">
              <button type="button" aria-current={screen === 'batches' ? 'page' : undefined} onClick={() => switchScreen('batches')}>Batches</button>
              <button type="button" aria-current={screen === 'focus' ? 'page' : undefined} onClick={() => switchScreen('focus')}>Focus Mode</button>
              <button
                type="button"
                onClick={() => {
                  setNavigationOpen(false)
                  document.querySelector<HTMLInputElement>('.search-field input')?.focus()
                }}
              >
                {screen === 'batches' ? 'Search batches' : 'Search libraries'}
              </button>
            </nav>
          )}
        </header>}

        <div hidden={screen !== 'batches'}>
          <Batches
            query={query}
            onQueryChange={setQuery}
            onOpenActiveCourse={(courseName) => {
              setActiveCourseName(courseName)
              setCourseReturnScreen('batches')
              switchScreen('course-detail')
            }}
          />
        </div>
        <div hidden={screen !== 'focus'}>
          <Focus query={query} onJoinLibrary={() => switchScreen('virtual-library')} />
        </div>

        <div hidden={screen !== 'study'}>
          <Study
            notes={studyNotes}
            onAddPersonalNote={savePersonalNote}
            onEditHighlight={editPdfHighlight}
            onDeleteHighlight={deletePersonalNote}
            onOpenSavedNote={(courseName, title, pageNumber, y) => {
              setActiveCourseName(courseName)
              setCourseNoteTarget({ courseName, title, pageNumber, y })
              setCourseReturnScreen('study')
              switchScreen('course-detail')
            }}
            onOpenMyBatches={() => {
              setActiveCourseName('JavaScript in One Shot')
              setCourseReturnScreen('study')
              switchScreen('course-detail')
            }}
          />
        </div>

        <div hidden={screen !== 'virtual-library'}>
          <VirtualLibrary isActive={screen === 'virtual-library'} onBack={() => switchScreen('focus')} />
        </div>

        {activeCourseName && (
          <div hidden={screen !== 'course-detail'}>
            <CourseDetail
              courseName={activeCourseName}
              savedNotes={studyNotes}
              noteTarget={courseNoteTarget?.courseName === activeCourseName ? courseNoteTarget : null}
              onSaveNote={(title, text, pages) => savePdfHighlight(activeCourseName, title, text, pages)}
              onDeleteNote={(title, noteId) => deletePersonalNote(activeCourseName, title, noteId)}
              onBack={() => {
                setCourseNoteTarget(null)
                switchScreen(courseReturnScreen)
              }}
            />
          </div>
        )}

        {screen !== 'virtual-library' && screen !== 'course-detail' && <nav className="bottom-nav" aria-label="Main navigation">
          <button className={`bottom-nav-item${screen === 'focus' ? ' bottom-nav-active' : ''}`} type="button" onClick={() => switchScreen('focus')} aria-current={screen === 'focus' ? 'page' : undefined}>
            <BookOpen size={21} strokeWidth={1.8} aria-hidden="true" />
            <span>Focus</span>
          </button>
          <button className={`bottom-nav-item${screen === 'batches' ? ' bottom-nav-active' : ''}`} type="button" onClick={() => switchScreen('batches')} aria-current={screen === 'batches' ? 'page' : undefined}>
            <Layers3 size={21} strokeWidth={1.8} aria-hidden="true" />
            <span>Batches</span>
          </button>
          <button className={`bottom-nav-item${screen === 'study' ? ' bottom-nav-active' : ''}`} type="button" onClick={() => switchScreen('study')} aria-current={screen === 'study' ? 'page' : undefined}>
            <BookOpen size={21} strokeWidth={1.8} aria-hidden="true" />
            <span>Study</span>
          </button>
          <a className="bottom-nav-item" href="#batch-heading">
            <ShoppingBag size={21} strokeWidth={1.8} aria-hidden="true" />
            <span>PW Store</span>
          </a>
        </nav>}
      </div>
      {splashVisible && (
        <div className="opening-splash" role="status" aria-label="Loading batches">
          <img src="/PW-logo.jpg" alt="PW logo" />
        </div>
      )}
    </>
  )
}

export default App

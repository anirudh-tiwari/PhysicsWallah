import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  Coins,
  FileDown,
  FileText,
  MoreVertical,
  Play,
  Sparkles,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { Document, Page } from 'react-pdf'
import type { HighlightPage, StudyNoteTopic } from '../types/StudyNotes'

type CourseDetailProps = {
  courseName: string
  onBack: () => void
  savedNotes: StudyNoteTopic[]
  noteTarget: { courseName: string; title: string; pageNumber: number; y?: number } | null
  onSaveNote: (title: string, text: string, pages: HighlightPage[]) => void
  onDeleteNote?: (title: string, noteId: string) => void
}

const courseTabs = [
  { id: 'lectures', label: 'Lectures', icon: BookOpen },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'dpp', label: 'DPP', icon: ClipboardList },
  { id: 'dpp-pdf', label: 'DPP PDF', icon: FileDown },
] as const

type CourseTab = (typeof courseTabs)[number]['id']

function compareSavedHighlightsByPdfPosition(
  a: { pages?: HighlightPage[] },
  b: { pages?: HighlightPage[] },
): number {
  const position = (item: { pages?: HighlightPage[] }) => {
    const firstPage = item.pages?.slice().sort((pageA, pageB) => pageA.pageNumber - pageB.pageNumber)[0]
    const firstRect = firstPage?.rects.slice().sort((rectA, rectB) => rectA.y - rectB.y || rectA.x - rectB.x)[0]
    return {
      pageNumber: firstPage?.pageNumber ?? Number.POSITIVE_INFINITY,
      y: firstRect?.y ?? Number.POSITIVE_INFINITY,
      x: firstRect?.x ?? Number.POSITIVE_INFINITY,
    }
  }
  const positionA = position(a)
  const positionB = position(b)
  return positionA.pageNumber - positionB.pageNumber || positionA.y - positionB.y || positionA.x - positionB.x
}

type Lesson = {
  title: string
  duration: string
  date: string
}

type CourseContent = Record<CourseTab, Lesson[]>

type LessonSummary = {
  title: string
  bullets: string[]
}

const lessonSummaries: Record<string, Record<string, string[]>> = {
  'JavaScript in One Shot': {
    'JavaScript Basics': [
      'Understand how JavaScript adds behavior and interactivity to web pages.',
      'Recognize core syntax, expressions, and the role of statements.',
      'Use the browser console to inspect and run JavaScript.',
    ],
    'Variables & Data Types': [
      'Declare values with let and const and choose the appropriate binding.',
      'Work with primitive types such as strings, numbers, booleans, null, and undefined.',
      'Convert and compare values while keeping type behavior in mind.',
    ],
    'Functions & Arrays': [
      'Create reusable functions with parameters and return values.',
      'Store and access ordered data using arrays and indexes.',
      'Use common array methods to transform and inspect collections.',
    ],
    'DOM & Events': [
      'Select and update page elements through the Document Object Model.',
      'Listen for user interactions with event handlers.',
      'Connect JavaScript behavior to changes in the rendered page.',
    ],
    Objects: [
      'Create objects with properties and methods to represent structured data.',
      'Read, update, and remove object properties using dot and bracket notation.',
      'Use object destructuring to work with selected values.',
    ],
    'Loops & Iteration': [
      'Repeat operations with for, while, and for...of loops.',
      'Choose iteration methods such as forEach, map, and filter.',
      'Control loop flow with break and continue.',
    ],
    'Promises & Async': [
      'Understand promises as a way to handle asynchronous results.',
      'Chain promise operations and handle errors with catch.',
      'Use async and await to write readable asynchronous code.',
    ],
    'ES6 Features': [
      'Use template literals and arrow functions to write concise JavaScript.',
      'Apply spread and rest syntax to work with collections and arguments.',
      'Organize reusable code with modern JavaScript syntax.',
    ],
  },
  'Full Stack Development with AI': {
    'HTML & CSS Foundations': [
      'Structure a page with semantic HTML elements and meaningful document sections.',
      'Use CSS selectors and the box model to control spacing, borders, and sizing.',
      'Build clear layouts that adapt to different screen widths.',
    ],
    'JavaScript Essentials': [
      'Use variables, values, and expressions to represent and transform data.',
      'Organize logic with functions, conditionals, and reusable array methods.',
      'Respond to user actions by updating page behavior through the DOM.',
    ],
    'React Components': [
      'Compose interfaces from reusable components written with JSX.',
      'Pass information into components with props and keep changing values in state.',
      'Split a page into focused pieces that are easier to update and maintain.',
    ],
    'Full Stack Project': [
      'Connect a user-facing interface to server-side routes and application data.',
      'Keep loading, success, and error states clear as requests move through the app.',
      'Bring the pieces together into a working project and verify the main user flow.',
    ],
  },
  'CSS in One Shot': {
    'Selectors & Cascade': [
      'Choose elements with type, class, ID, and relationship-based selectors.',
      'Resolve competing rules using cascade order, specificity, and source order.',
      'Keep styles predictable by preferring clear, reusable selector patterns.',
    ],
    'Box Model': [
      'Understand how content, padding, borders, and margins contribute to element size.',
      'Use box-sizing to make width and height calculations easier to reason about.',
      'Control spacing consistently with deliberate padding and margin choices.',
    ],
    'Flexbox & Grid': [
      'Use Flexbox to align items along a single primary axis.',
      'Use Grid to arrange content across rows and columns.',
      'Select the layout model that best matches the structure of each interface.',
    ],
    'Responsive Design': [
      'Build fluid layouts that respond to available viewport space.',
      'Use media queries when a layout needs a deliberate breakpoint adjustment.',
      'Check content readability and interaction at both narrow and wide sizes.',
    ],
  },
}

const courseContent: Record<string, CourseContent> = {
  'JavaScript in One Shot': {
    lectures: [
      { title: 'JavaScript Basics', duration: '1:39', date: '21 Sep, 2026' },
      { title: 'Variables & Data Types', duration: '1:18', date: '21 Sep, 2026' },
      { title: 'Functions & Arrays', duration: '0:42', date: '21 Sep, 2026' },
      { title: 'DOM & Events', duration: '0:53', date: '21 Sep, 2026' },
      { title: 'Objects', duration: '0:56', date: '22 Sep, 2026' },
      { title: 'Loops & Iteration', duration: '1:04', date: '22 Sep, 2026' },
      { title: 'Promises & Async', duration: '1:12', date: '23 Sep, 2026' },
      { title: 'ES6 Features', duration: '0:48', date: '23 Sep, 2026' },
    ],
    notes: [
      { title: 'JavaScript Basics Notes', duration: '8 pages', date: '21 Sep, 2026' },
      { title: 'Variables & Data Types Notes', duration: '5 pages', date: '21 Sep, 2026' },
      { title: 'Functions & Arrays Notes', duration: '12 pages', date: '21 Sep, 2026' },
      { title: 'DOM & Events Notes', duration: '3 pages', date: '21 Sep, 2026' },
      { title: 'Objects Notes', duration: '6 pages', date: '22 Sep, 2026' },
      { title: 'Loops & Iteration Notes', duration: '5 pages', date: '22 Sep, 2026' },
      { title: 'Promises & Async Notes', duration: '8 pages', date: '23 Sep, 2026' },
      { title: 'ES6 Features Notes', duration: '4 pages', date: '23 Sep, 2026' },
    ],
    dpp: [
      { title: 'JavaScript Basics Practice', duration: '15 questions', date: '21 Sep, 2026' },
      { title: 'Variables & Data Types Practice', duration: '12 questions', date: '21 Sep, 2026' },
      { title: 'Functions & Arrays Practice', duration: '10 questions', date: '21 Sep, 2026' },
      { title: 'DOM & Events Practice', duration: '20 questions', date: '21 Sep, 2026' },
      { title: 'Objects Practice', duration: '12 questions', date: '22 Sep, 2026' },
      { title: 'Loops & Iteration Practice', duration: '15 questions', date: '22 Sep, 2026' },
      { title: 'Promises & Async Practice', duration: '10 questions', date: '23 Sep, 2026' },
      { title: 'ES6 Features Practice', duration: '12 questions', date: '23 Sep, 2026' },
    ],
    'dpp-pdf': [
      { title: 'JavaScript Basics PDF', duration: '4 pages', date: '21 Sep, 2026' },
      { title: 'Variables & Data Types PDF', duration: '6 pages', date: '21 Sep, 2026' },
      { title: 'Functions & Arrays PDF', duration: '5 pages', date: '21 Sep, 2026' },
      { title: 'DOM & Events PDF', duration: '3 pages', date: '21 Sep, 2026' },
      { title: 'Objects PDF', duration: '4 pages', date: '22 Sep, 2026' },
      { title: 'Loops & Iteration PDF', duration: '5 pages', date: '22 Sep, 2026' },
      { title: 'Promises & Async PDF', duration: '6 pages', date: '23 Sep, 2026' },
      { title: 'ES6 Features PDF', duration: '4 pages', date: '23 Sep, 2026' },
    ],
  },
  'Full Stack Development with AI': {
    lectures: [
      { title: 'HTML & CSS Foundations', duration: '1:39', date: '21 Sep, 2026' },
      { title: 'JavaScript Essentials', duration: '1:18', date: '21 Sep, 2026' },
      { title: 'React Components', duration: '0:42', date: '21 Sep, 2026' },
      { title: 'Full Stack Project', duration: '0:53', date: '21 Sep, 2026' },
    ],
    notes: [
      { title: 'HTML Structure Notes', duration: '8 pages', date: '21 Sep, 2026' },
      { title: 'JavaScript Patterns', duration: '5 pages', date: '21 Sep, 2026' },
      { title: 'React Hooks Reference', duration: '12 pages', date: '21 Sep, 2026' },
      { title: 'API Integration Notes', duration: '3 pages', date: '21 Sep, 2026' },
    ],
    dpp: [
      { title: 'HTML & CSS Practice', duration: '15 questions', date: '21 Sep, 2026' },
      { title: 'JavaScript Logic Set', duration: '12 questions', date: '21 Sep, 2026' },
      { title: 'React Components Drill', duration: '10 questions', date: '21 Sep, 2026' },
      { title: 'API Integration Problems', duration: '20 questions', date: '21 Sep, 2026' },
    ],
    'dpp-pdf': [
      { title: 'HTML & CSS Practice PDF', duration: '4 pages', date: '21 Sep, 2026' },
      { title: 'JavaScript Essentials PDF', duration: '6 pages', date: '21 Sep, 2026' },
      { title: 'React Components Worksheet', duration: '5 pages', date: '21 Sep, 2026' },
      { title: 'Full Stack Project Answers', duration: '3 pages', date: '21 Sep, 2026' },
    ],
  },
  'CSS in One Shot': {
    lectures: [
      { title: 'Selectors & Cascade', duration: '1:39', date: '21 Sep, 2026' },
      { title: 'Box Model', duration: '1:18', date: '21 Sep, 2026' },
      { title: 'Flexbox & Grid', duration: '0:42', date: '21 Sep, 2026' },
      { title: 'Responsive Design', duration: '0:53', date: '21 Sep, 2026' },
    ],
    notes: [
      { title: 'Selector Specificity Notes', duration: '8 pages', date: '21 Sep, 2026' },
      { title: 'Box Model Reference', duration: '5 pages', date: '21 Sep, 2026' },
      { title: 'Flexbox Alignment', duration: '12 pages', date: '21 Sep, 2026' },
      { title: 'Responsive Units Guide', duration: '3 pages', date: '21 Sep, 2026' },
    ],
    dpp: [
      { title: 'Cascade Practice Set', duration: '15 questions', date: '21 Sep, 2026' },
      { title: 'Spacing & Sizing Drill', duration: '12 questions', date: '21 Sep, 2026' },
      { title: 'Flexbox Layout Problems', duration: '10 questions', date: '21 Sep, 2026' },
      { title: 'Responsive Breakpoints', duration: '20 questions', date: '21 Sep, 2026' },
    ],
    'dpp-pdf': [
      { title: 'Selectors Practice PDF', duration: '4 pages', date: '21 Sep, 2026' },
      { title: 'Box Model Worksheet', duration: '6 pages', date: '21 Sep, 2026' },
      { title: 'Flexbox & Grid Answers', duration: '5 pages', date: '21 Sep, 2026' },
      { title: 'Responsive Design PDF', duration: '3 pages', date: '21 Sep, 2026' },
    ],
  },
}

function getLessons(courseName: string, tab: CourseTab): Lesson[] {
  const content = courseContent[courseName]
  if (content === undefined) {
    throw new Error(`Course content for "${courseName}" must exist in the course catalog.`)
  }
  return content[tab]
}

function getLessonSummary(courseName: string, lessonTitle: string): LessonSummary | null {
  const summaryTitle = lessonTitle.replace(/\s+(Notes|Practice|PDF)$/i, '')
  const bullets = lessonSummaries[courseName]?.[summaryTitle]
  return bullets ? { title: summaryTitle, bullets } : null
}

function getThumbnailLabel(courseName: string, lessonTitle: string): string {
  if (courseName !== 'JavaScript in One Shot') return 'LESSON'
  return lessonTitle
    .replace(/^JavaScript\s+/i, '')
    .replace(/\s+(Notes|Practice|PDF)$/i, '')
    .split(/[\s&]/)[0]
    ?.toUpperCase() ?? 'LESSON'
}

function CourseDetail({ courseName, onBack, savedNotes, noteTarget, onSaveNote, onDeleteNote }: CourseDetailProps) {
  const [selectedTab, setSelectedTab] = useState<CourseTab>('lectures')
  const [activeSummary, setActiveSummary] = useState<LessonSummary | null>(null)
  const [notesOpen, setNotesOpen] = useState(false)
  const [courseContentScrolling, setCourseContentScrolling] = useState(false)
  const [notesTitle, setNotesTitle] = useState('')
  const [notesPageCount, setNotesPageCount] = useState(0)
  const [notesPageWidth, setNotesPageWidth] = useState(0)
  const [notesZoom, setNotesZoom] = useState(1)
  const [notesError, setNotesError] = useState('')
  const [notesSaveError, setNotesSaveError] = useState('')
  const [selectionAction, setSelectionAction] = useState<{ text: string; pages: HighlightPage[]; x: number; y: number } | null>(null)
  const savedSelectionActionRef = useRef<typeof selectionAction>(null)
  const summaryDialogRef = useRef<HTMLDialogElement>(null)
  const summaryTriggerRef = useRef<HTMLButtonElement>(null)
  const notesViewerRef = useRef<HTMLDivElement>(null)
  const notesPinchRef = useRef<{ distance: number; zoom: number } | null>(null)
  const notesGestureZoomRef = useRef<number | null>(null)
  const notesPendingZoomRef = useRef<number | null>(null)
  const notesZoomReadoutRef = useRef<HTMLSpanElement>(null)
  const notesZoomRef = useRef(notesZoom)
  const courseContentScrollTimerRef = useRef<number | null>(null)
  const savedNotesRef = useRef(savedNotes)
  const handledNoteTargetRef = useRef('')
  notesZoomRef.current = notesZoom
  savedNotesRef.current = savedNotes
  const tabRefs = useRef<Record<CourseTab, HTMLButtonElement | null>>({
    lectures: null,
    notes: null,
    dpp: null,
    'dpp-pdf': null,
  })
  const lessons = getLessons(courseName, selectedTab)
  const courseHighlightTopics = savedNotes.filter((topic) => topic.courseName === courseName)
  const savedHighlights = courseHighlightTopics.flatMap((topic) => [
    ...topic.highlights.map((highlight) => ({ highlight, title: topic.title })),
    // Keep highlights saved by earlier versions visible during migration.
    ...topic.notes.filter((note) => note.pages?.length).map((highlight) => ({ highlight, title: topic.title })),
  ]).sort((a, b) => compareSavedHighlightsByPdfPosition(a.highlight, b.highlight))
  const selectedTabIndex = courseTabs.findIndex((tab) => tab.id === selectedTab)

  useEffect(() => () => {
    if (courseContentScrollTimerRef.current !== null) {
      window.clearTimeout(courseContentScrollTimerRef.current)
    }
  }, [])

  const handleCourseContentScroll = () => {
    setCourseContentScrolling(true)
    if (courseContentScrollTimerRef.current !== null) {
      window.clearTimeout(courseContentScrollTimerRef.current)
    }
    courseContentScrollTimerRef.current = window.setTimeout(() => {
      setCourseContentScrolling(false)
      courseContentScrollTimerRef.current = null
    }, 650)
  }

  const previewNotesZoom = (zoom: number) => {
    const nextZoom = Math.min(2.5, Math.max(0.75, zoom))
    notesPendingZoomRef.current = nextZoom
    const documentElement = notesViewerRef.current?.querySelector<HTMLElement>('.course-notes-document')
    if (documentElement) documentElement.style.zoom = String(nextZoom)
    if (notesZoomReadoutRef.current) notesZoomReadoutRef.current.textContent = `${Math.round(nextZoom * 100)}%`
  }

  const commitNotesZoomPreview = () => {
    const pendingZoom = notesPendingZoomRef.current
    if (pendingZoom === null) return
    notesPendingZoomRef.current = null
    setNotesZoom(pendingZoom)
  }

  useEffect(() => {
    if (activeSummary && !summaryDialogRef.current?.open) {
      summaryDialogRef.current?.showModal()
    }
  }, [activeSummary])

  useEffect(() => {
    const viewer = notesViewerRef.current
    if (!notesOpen || !viewer) return

    const observer = new ResizeObserver(([entry]) => {
      setNotesPageWidth(Math.max(0, entry.contentRect.width))
    })
    observer.observe(viewer)
    return () => observer.disconnect()
  }, [notesOpen])

  useEffect(() => {
    const viewer = notesViewerRef.current
    if (!notesOpen || !viewer) return

    const updateSelectionAction = () => {
      const selection = window.getSelection()
      const text = selection?.toString().trim()
      if (!selection || !text || !selection.rangeCount) {
        return
      }

      const range = selection.getRangeAt(0)
      if (!viewer.contains(range.commonAncestorContainer)) {
        return
      }

      const pages = new Map<number, HighlightPage['rects']>()
      const pageElements = Array.from(viewer.querySelectorAll<HTMLElement>('.react-pdf__Page'))
      for (const selectionRect of Array.from(range.getClientRects())) {
        const pageIndex = pageElements.findIndex((page) => {
          const bounds = page.getBoundingClientRect()
          return selectionRect.left < bounds.right && selectionRect.right > bounds.left
            && selectionRect.top < bounds.bottom && selectionRect.bottom > bounds.top
        })
        const page = pageElements[pageIndex]
        if (!page) continue
        const bounds = page.getBoundingClientRect()
        const left = Math.max(selectionRect.left, bounds.left)
        const top = Math.max(selectionRect.top, bounds.top)
        const right = Math.min(selectionRect.right, bounds.right)
        const bottom = Math.min(selectionRect.bottom, bounds.bottom)
        if (right <= left || bottom <= top || !bounds.width || !bounds.height) continue
        const pageNumber = Number(page.dataset.pageNumber) || pageIndex + 1
        const rects = pages.get(pageNumber) ?? []
        rects.push({
          x: ((left - bounds.left) / bounds.width) * 100,
          y: ((top - bounds.top) / bounds.height) * 100,
          width: ((right - left) / bounds.width) * 100,
          height: ((bottom - top) / bounds.height) * 100,
        })
        pages.set(pageNumber, rects)
      }
      const pageGroups = Array.from(pages, ([pageNumber, rects]) => ({ pageNumber, rects }))
      const bounds = range.getBoundingClientRect()
      if (!pageGroups.length || !bounds.width || !bounds.height) {
        return
      }
      setSelectionAction({
        text,
        pages: pageGroups,
        x: Math.max(12, Math.min(window.innerWidth - 170, bounds.left + bounds.width / 2 - 72)),
        y: Math.max(12, Math.min(window.innerHeight - 54, bounds.bottom + 8)),
      })
    }

    const clearActionOutsideToolbar = (event: PointerEvent) => {
      if ((event.target as HTMLElement).closest('.course-notes-selection-actions, .course-notes-mobile-save')) return
      setSelectionAction(null)
    }
    const clearActionOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectionAction(null)
    }
    const suppressNativeSelectionMenu = (event: Event) => {
      event.preventDefault()
    }

    document.addEventListener('selectionchange', updateSelectionAction)
    document.addEventListener('pointerdown', clearActionOutsideToolbar, true)
    document.addEventListener('keydown', clearActionOnEscape)
    viewer.addEventListener('contextmenu', suppressNativeSelectionMenu)
    return () => {
      document.removeEventListener('selectionchange', updateSelectionAction)
      document.removeEventListener('pointerdown', clearActionOutsideToolbar, true)
      document.removeEventListener('keydown', clearActionOnEscape)
      viewer.removeEventListener('contextmenu', suppressNativeSelectionMenu)
    }
  }, [notesOpen])

  useEffect(() => {
    if (!noteTarget) {
      handledNoteTargetRef.current = ''
      return
    }
    if (noteTarget.courseName !== courseName) return
    const targetKey = `${noteTarget.courseName}:${noteTarget.title}:${noteTarget.pageNumber}`
    if (handledNoteTargetRef.current === targetKey) return
    handledNoteTargetRef.current = targetKey
    setSelectedTab('notes')
    setNotesTitle(noteTarget.title)
    setNotesOpen(true)
  }, [courseName, noteTarget])

  useEffect(() => {
    if (!notesOpen || !notesPageCount || !noteTarget || noteTarget.title !== notesTitle) return
    const viewer = notesViewerRef.current
    const targetPage = viewer?.querySelector<HTMLElement>(`.react-pdf__Page[data-page-number="${noteTarget.pageNumber}"]`)
    if (!viewer || !targetPage) return
    const pageBounds = targetPage.getBoundingClientRect()
    const viewerBounds = viewer.getBoundingClientRect()
    const targetY = pageBounds.top - viewerBounds.top + viewer.scrollTop + pageBounds.height * ((noteTarget.y ?? 50) / 100)
    viewer.scrollTo({ top: Math.max(0, targetY - viewer.clientHeight / 2), behavior: 'smooth' })
  }, [noteTarget, notesOpen, notesPageCount, notesTitle])

  useEffect(() => {
    if (!notesOpen) return

    const handleZoomShortcut = (event: KeyboardEvent) => {
      if (!event.ctrlKey && !event.metaKey) return

      if (event.key === '+' || event.key === '=' || event.key === 'Add') {
        event.preventDefault()
        event.stopPropagation()
        setNotesZoom((zoom) => Math.min(2.5, zoom + 0.25))
      } else if (event.key === '-' || event.key === 'Subtract') {
        event.preventDefault()
        event.stopPropagation()
        setNotesZoom((zoom) => Math.max(0.75, zoom - 0.25))
      } else if (event.key === '0') {
        event.preventDefault()
        event.stopPropagation()
        setNotesZoom(1)
      }
    }

    const zoomNotesWithWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      setNotesZoom((zoom) => Math.min(2.5, Math.max(0.75, zoom + (event.deltaY < 0 ? 0.1 : -0.1))))
    }

    window.addEventListener('keydown', handleZoomShortcut, true)
    window.addEventListener('wheel', zoomNotesWithWheel, { capture: true, passive: false })
    return () => {
      window.removeEventListener('keydown', handleZoomShortcut, true)
      window.removeEventListener('wheel', zoomNotesWithWheel, true)
    }
  }, [notesOpen])

  const saveCurrentSelection = () => {
    if (!selectionAction) {
      setNotesSaveError('No selected text is ready to save. Select text in the PDF and try again.')
      return
    }
    if (savedSelectionActionRef.current === selectionAction) return
    savedSelectionActionRef.current = selectionAction
    try {
      if (!selectionAction.text.trim() || !selectionAction.pages.length
        || selectionAction.pages.some((page) => !page.rects.length)) {
        throw new Error('This selection could not be saved. Select text within one or more PDF pages and try again.')
      }
      setNotesSaveError('')
      const countMatchingHighlights = () => savedNotesRef.current
        .filter((topic) => topic.courseName === courseName && topic.title === notesTitle)
        .reduce((count, topic) => count
          + topic.highlights.filter((highlight) => highlight.text === selectionAction.text).length
          + topic.notes.filter((note) => note.text === selectionAction.text && !!note.pages?.length).length, 0)
      const previousCount = countMatchingHighlights()
      onSaveNote(notesTitle, selectionAction.text, selectionAction.pages)
      setNotesSaveError('')
      setSelectionAction(null)
      window.setTimeout(() => {
        if (countMatchingHighlights() <= previousCount) {
          setNotesSaveError('Save was tapped, but the highlight was not added to saved app state. Check the connection and try again.')
        }
      }, 900)
    } catch (error) {
      savedSelectionActionRef.current = null
      setNotesSaveError(error instanceof Error ? error.message : 'Unable to save this highlight. Please try again.')
    }
  }

  useEffect(() => {
    const viewer = notesViewerRef.current
    if (!notesOpen || !viewer) return

    const touchDistance = (touches: TouchList) => {
      const first = touches.item(0)
      const second = touches.item(1)
      if (!first || !second) return 0
      return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY)
    }
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        notesPinchRef.current = { distance: touchDistance(event.touches), zoom: notesZoomRef.current }
      }
    }
    const handleTouchMove = (event: TouchEvent) => {
      if (notesGestureZoomRef.current !== null) return
      const pinch = notesPinchRef.current
      if (event.touches.length !== 2 || !pinch) return
      if (event.cancelable) event.preventDefault()
      const distance = touchDistance(event.touches)
      if (distance && pinch.distance) {
        previewNotesZoom(pinch.zoom * distance / pinch.distance)
      }
    }
    const resetPinch = () => {
      notesPinchRef.current = null
      commitNotesZoomPreview()
    }

    const handleGestureStart = (event: Event) => {
      event.preventDefault()
      notesPinchRef.current = null
      notesGestureZoomRef.current = notesZoomRef.current
      notesPendingZoomRef.current = notesZoomRef.current
    }
    const handleGestureChange = (event: Event) => {
      const gesture = event as Event & { scale?: number }
      if (gesture.scale === undefined || notesGestureZoomRef.current === null) return
      event.preventDefault()
      previewNotesZoom(notesGestureZoomRef.current * gesture.scale)
    }
    const resetGesture = () => {
      notesGestureZoomRef.current = null
      commitNotesZoomPreview()
    }

    // Capture on the viewer so PDF canvas/text layers cannot swallow the gesture.
    viewer.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true })
    viewer.addEventListener('touchmove', handleTouchMove, { capture: true, passive: false })
    viewer.addEventListener('touchend', resetPinch, { capture: true, passive: true })
    viewer.addEventListener('touchcancel', resetPinch, { capture: true, passive: true })
    viewer.addEventListener('gesturestart', handleGestureStart, { capture: true, passive: false })
    viewer.addEventListener('gesturechange', handleGestureChange, { capture: true, passive: false })
    viewer.addEventListener('gestureend', resetGesture, { capture: true, passive: true })
    return () => {
      viewer.removeEventListener('touchstart', handleTouchStart, true)
      viewer.removeEventListener('touchmove', handleTouchMove, true)
      viewer.removeEventListener('touchend', resetPinch, true)
      viewer.removeEventListener('touchcancel', resetPinch, true)
      viewer.removeEventListener('gesturestart', handleGestureStart, true)
      viewer.removeEventListener('gesturechange', handleGestureChange, true)
      viewer.removeEventListener('gestureend', resetGesture, true)
    }
  }, [notesOpen])

  const handleTabKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    let nextIndex: number | undefined
    if (event.key === 'ArrowRight') nextIndex = (selectedTabIndex + 1) % courseTabs.length
    if (event.key === 'ArrowLeft') nextIndex = (selectedTabIndex - 1 + courseTabs.length) % courseTabs.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = courseTabs.length - 1

    if (nextIndex !== undefined) {
      event.preventDefault()
      const nextTab = courseTabs[nextIndex]
      if (nextTab) {
        setSelectedTab(nextTab.id)
        tabRefs.current[nextTab.id]?.focus()
      }
    }
  }

  return (
    <div className="course-detail">
      <header className="course-detail-header">
        <div className="course-detail-header-inner">
          <button className="course-detail-back" type="button" onClick={onBack} aria-label="Back to Batches">
            <ArrowLeft size={25} strokeWidth={2.2} aria-hidden="true" />
          </button>
          <div className="course-detail-heading">
            <h1>Course Content</h1>
            <p title={courseName}>{courseName}</p>
          </div>
          <div className="course-detail-balance" aria-label="Account balance: 0 coins">
            <span className="course-detail-coin" aria-hidden="true"><Coins size={27} strokeWidth={1.7} /></span>
            <span>0</span>
          </div>
        </div>
      </header>

      <div className="course-detail-tabbar">
        <div className="course-detail-tabs" role="tablist" aria-label="Course resources">
          {courseTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              ref={(element) => { tabRefs.current[id] = element }}
              id={`course-tab-${id}`}
              className="course-detail-tab"
              type="button"
              role="tab"
              aria-selected={selectedTab === id}
              aria-controls="course-resource-panel"
              tabIndex={selectedTab === id ? 0 : -1}
              onClick={() => setSelectedTab(id)}
              onKeyDown={handleTabKeyDown}
            >
              <Icon size={17} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className={`course-detail-content${courseContentScrolling ? ' is-scrolling' : ''}`} onScroll={handleCourseContentScroll}>
        <section
          className="course-resource-panel"
          id="course-resource-panel"
          role="tabpanel"
          aria-labelledby={`course-tab-${selectedTab}`}
          tabIndex={0}
        >
          <div className="course-lesson-list">
            {lessons.map((lesson, index) => {
              const summary = getLessonSummary(courseName, lesson.title)
              const lessonTitle = lesson.title.replace(/\s+(Notes|Practice|PDF)$/i, '')
              const thumbnail = (
                <>
                  <span className="lesson-thumb-topline" aria-hidden="true">
                    <span className="lesson-thumb-brand">PW SKILLS</span>
                    <span>COURSE GUIDE</span>
                  </span>
                  <span className="lesson-thumb-window" aria-hidden="true">
                    <span className="lesson-thumb-window-top"><i /><i /><i /></span>
                    <span className="lesson-thumb-sidebar" />
                    <span className="lesson-thumb-content">
                      <i />
                      <i />
                      <i />
                      <b>{getThumbnailLabel(courseName, lesson.title)}</b>
                    </span>
                  </span>
                  <span className="lesson-play" aria-hidden="true">
                    {selectedTab === 'notes'
                      ? <FileText size={15} strokeWidth={1.5} />
                      : <Play size={15} fill="currentColor" strokeWidth={1.5} />}
                  </span>
                </>
              )

              return (
              <article
                className={`course-lesson${selectedTab === 'notes' ? ' course-lesson-clickable' : ''}`}
                key={`${selectedTab}-${lesson.title}`}
                onClick={selectedTab === 'notes' ? () => {
                  setNotesTitle(lessonTitle)
                  setNotesOpen(true)
                } : undefined}
              >
                {selectedTab === 'notes' ? (
                  <button
                    className={`lesson-thumbnail lesson-thumbnail-button lesson-thumbnail-${index + 1}${courseName === 'JavaScript in One Shot' ? ' lesson-thumbnail-javascript' : ''}`}
                    type="button"
                    aria-label={`Open notes for ${lessonTitle} in the app`}
                    onClick={() => {
                      setNotesTitle(lessonTitle)
                      setNotesOpen(true)
                    }}
                  >
                    {thumbnail}
                  </button>
                ) : (
                  <div className={`lesson-thumbnail lesson-thumbnail-${index + 1}${courseName === 'JavaScript in One Shot' ? ' lesson-thumbnail-javascript' : ''}`} aria-hidden="true">
                    {thumbnail}
                  </div>
                )}
                <div className="course-lesson-copy">
                  <h2>{lessonTitle}</h2>
                  <div className="course-lesson-meta">
                    <span className="course-lesson-meta-details">
                      <span>{lesson.duration}</span>
                      <span className="course-lesson-dot" aria-hidden="true" />
                      <span>{lesson.date}</span>
                    </span>
                    {summary && (
                      <button
                        className="lesson-summary-trigger"
                        type="button"
                        aria-haspopup="dialog"
                        aria-label={`AI Summary for ${lessonTitle}`}
                        onClick={(event) => {
                          event.stopPropagation()
                          summaryTriggerRef.current = event.currentTarget
                          setActiveSummary(summary)
                        }}
                      >
                        <Sparkles size={14} aria-hidden="true" />
                        <span>AI Summary</span>
                      </button>
                    )}
                  </div>
                </div>
                <span className="course-lesson-more" aria-hidden="true"><MoreVertical size={22} strokeWidth={2.8} /></span>
              </article>
              )
            })}
          </div>
        </section>
      </main>

      <dialog
        ref={summaryDialogRef}
        className="lesson-summary-dialog"
        aria-labelledby="lesson-summary-title"
        aria-describedby="lesson-summary-note"
        onClose={() => {
          setActiveSummary(null)
          summaryTriggerRef.current?.focus()
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            summaryDialogRef.current?.close()
          }
        }}
      >
        {activeSummary && (
          <div className="lesson-summary-content">
            <header className="lesson-summary-header">
              <div>
                <p className="lesson-summary-eyebrow">
                  <Sparkles size={14} aria-hidden="true" />
                  Lesson recap
                </p>
                <h2 id="lesson-summary-title">{activeSummary.title}</h2>
              </div>
              <button
                className="lesson-summary-close"
                type="button"
                aria-label="Close AI Summary"
                onClick={() => summaryDialogRef.current?.close()}
              >
                <X size={19} aria-hidden="true" />
              </button>
            </header>
            <ul className="lesson-summary-list">
              {activeSummary.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
            </ul>
            <p className="lesson-summary-note" id="lesson-summary-note">
              Sample recap for this lesson. It isn’t generated from a video or transcript.
            </p>
          </div>
        )}
      </dialog>
      {notesOpen && (
        <section className="course-notes-viewer" aria-label="Notes PDF viewer">
          <header className="course-notes-header">
            <button type="button" onClick={() => setNotesOpen(false)} aria-label="Back to course content">
              <ArrowLeft size={22} aria-hidden="true" />
            </button>
            <h2>{notesTitle || 'Notes'}</h2>
            <div className="course-notes-zoom" aria-label="PDF zoom controls">
              <button
                type="button"
                onClick={() => setNotesZoom((zoom) => Math.max(0.75, zoom - 0.25))}
                disabled={notesZoom <= 0.75}
                aria-label="Zoom out notes"
              >
                <ZoomOut size={18} aria-hidden="true" />
              </button>
              <span ref={notesZoomReadoutRef}>{Math.round(notesZoom * 100)}%</span>
              <button
                type="button"
                onClick={() => setNotesZoom((zoom) => Math.min(2.5, zoom + 0.25))}
                disabled={notesZoom >= 2.5}
                aria-label="Zoom in notes"
              >
                <ZoomIn size={18} aria-hidden="true" />
              </button>
            </div>
          </header>
          <aside className="course-saved-highlights" aria-label="Saved notes and highlights">
            <h3>Saved Notes / Highlights</h3>
            {notesSaveError ? (
              <p role="alert">{notesSaveError}</p>
            ) : savedHighlights.length ? savedHighlights.map(({ highlight, title }) => (
              <article className="course-saved-highlight" key={highlight.id}>
                <button type="button" className="course-saved-highlight-link" onClick={() => {
                  const firstPage = highlight.pages?.[0]
                  const page = firstPage && notesViewerRef.current?.querySelector<HTMLElement>(`.react-pdf__Page[data-page-number="${firstPage.pageNumber}"]`)
                  const viewer = notesViewerRef.current
                  if (!page || !viewer || !firstPage) return
                  const pageRect = page.getBoundingClientRect()
                  const y = pageRect.top - viewer.getBoundingClientRect().top + viewer.scrollTop + pageRect.height * ((firstPage.rects[0]?.y ?? 50) / 100)
                  viewer.scrollTo({ top: Math.max(0, y - 100), behavior: 'smooth' })
                  page.classList.add('course-notes-page-emphasized')
                  window.setTimeout(() => page.classList.remove('course-notes-page-emphasized'), 1400)
                }}>
                  <span>{highlight.text}</span>
                  <small>{title} · Page {highlight.pages?.map((page) => page.pageNumber).join(', ')}</small>
                </button>
                {onDeleteNote && (
                  <button
                    type="button"
                    className="course-saved-highlight-delete"
                    aria-label="Delete saved highlight"
                    onClick={() => onDeleteNote(title, highlight.id)}
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                )}
              </article>
            )) : (
              <p>No saved highlights yet. Select text in the PDF to save it here.</p>
            )}
          </aside>
          <div className="course-notes-pages" ref={notesViewerRef}>
            {selectionAction && (
              <div
                className="course-notes-selection-actions"
                style={{ left: selectionAction.x, top: selectionAction.y }}
                role="toolbar"
                aria-label="Actions for selected PDF text"
              >
                <button
                  type="button"
                  onPointerUp={saveCurrentSelection}
                  onTouchEnd={(event) => {
                    event.preventDefault()
                    saveCurrentSelection()
                  }}
                  onClick={saveCurrentSelection}
                >
                  Save Note
                </button>
              </div>
            )}
            <Document
              file="/Notes2.pdf"
              onLoadSuccess={({ numPages }) => {
                setNotesPageCount(numPages)
                setNotesError('')
              }}
              onLoadError={(error) => setNotesError(`Unable to load notes: ${error.message}`)}
              loading={<p role="status">Loading notes…</p>}
              error={<p role="alert">{notesError || 'Unable to load notes.'}</p>}
            >
              <div
                className="course-notes-document"
                style={{ width: notesPageWidth || '100%', zoom: notesZoom }}
              >
                {Array.from({ length: notesPageCount }, (_, index) => (
                  <div className="course-notes-page-wrap" key={index + 1}>
                    <Page
                      className="course-notes-page"
                      pageNumber={index + 1}
                      width={notesPageWidth || undefined}
                      onRenderSuccess={() => {
                        if (!noteTarget || noteTarget.title !== notesTitle || noteTarget.pageNumber !== index + 1) return
                        const viewer = notesViewerRef.current
                        const page = viewer?.querySelector<HTMLElement>(`.react-pdf__Page[data-page-number="${index + 1}"]`)
                        if (!viewer || !page) return
                        const pageBounds = page.getBoundingClientRect()
                        const viewerBounds = viewer.getBoundingClientRect()
                        const targetY = pageBounds.top - viewerBounds.top + viewer.scrollTop + pageBounds.height * ((noteTarget.y ?? 50) / 100)
                        viewer.scrollTo({ top: Math.max(0, targetY - viewer.clientHeight / 2), behavior: 'smooth' })
                      }}
                    />
                      <div className="course-notes-note-layer" aria-hidden="true">
                      {courseHighlightTopics.flatMap((topic) => [...topic.highlights, ...topic.notes].flatMap((note) => note.pages?.filter((page) => page.pageNumber === index + 1)
                        .flatMap((page) => page.rects.map((rect, rectIndex) => (
                          <span
                            className="course-notes-note-mark"
                            key={`${topic.title}-${note.id}-${rectIndex}`}
                            style={{ left: `${rect.x}%`, top: `${rect.y}%`, width: `${rect.width}%`, height: `${rect.height}%` }}
                          />
                        ))) ?? []))}
                    </div>
                  </div>
                ))}
              </div>
            </Document>
          </div>
          {selectionAction && (
            <button
              className="course-notes-mobile-save"
              type="button"
              onTouchStart={(event) => {
                event.preventDefault()
                saveCurrentSelection()
              }}
              onPointerUp={saveCurrentSelection}
              onTouchEnd={(event) => {
                event.preventDefault()
                saveCurrentSelection()
              }}
              onClick={saveCurrentSelection}
            >
              Save Note
            </button>
          )}
        </section>
      )}
    </div>
  )
}

export default CourseDetail

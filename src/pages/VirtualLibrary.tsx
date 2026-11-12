import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckSquare,
  FileText,
  MoreVertical,
  Play,
  Plus,
  Timer,
  Users,
  Video,
  VideoOff,
  X,
} from 'lucide-react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { publicAssetUrl } from '../utils/publicAssetUrl'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

type VirtualLibraryProps = {
  isActive: boolean
  onBack: () => void
}

type LibraryTab = 'todo' | 'materials'

const studentPhotos = [
  publicAssetUrl('students/student-1.webp'),
  publicAssetUrl('students/student-2.webp'),
  null,
  publicAssetUrl('students/student-4.webp'),
  publicAssetUrl('students/student-5.webp'),
  null,
  publicAssetUrl('students/student-3.webp'),
  publicAssetUrl('students/student-6.webp'),
]
const galleryPhotoPool = studentPhotos.filter((image): image is string => image !== null)
const rotatingGalleryFrames = Array.from({ length: 8 }, (_, frameIndex) =>
  Array.from({ length: 4 }, (_, studentIndex) => {
    const showPlaceholder = frameIndex % 2 === 1 && studentIndex === Math.floor(frameIndex / 2)
    const photoIndex = (Math.floor(frameIndex / 2) + studentIndex) % galleryPhotoPool.length

    return {
      name: `Student ${String(studentIndex + 1).padStart(2, '0')}`,
      image: showPlaceholder ? null : galleryPhotoPool[photoIndex],
    }
  }),
)
const galleryStudents = [
  { name: 'Student 01', image: studentPhotos[0] ?? null },
  { name: 'Student 02', image: studentPhotos[1] ?? null },
  { name: 'Student 03', image: studentPhotos[2] ?? null },
  { name: 'Student 04', image: studentPhotos[3] ?? null },
]
const studyStudents = [
  ...galleryStudents,
  ...Array.from({ length: 28 }, (_, index) => ({
    name: `Student ${String(index + 5).padStart(2, '0')}`,
    image: studentPhotos[index + 4] ?? null,
  })),
]

const initialTasks = [
  'Revise electrostatics notes',
  'Complete DPP — Lecture 08',
  'Review today’s class questions',
]

const materials = [
  { title: 'Lecture Notes – Electrostatics', meta: 'PDF  ·  8.4 MB', type: 'pdf' },
  { title: 'DPP – Lecture 08', meta: 'PDF  ·  2.1 MB', type: 'notes' },
  { title: 'Related Practice Video', meta: 'Video  ·  15 min', type: 'video' },
]

function LectureNotesPdf() {
  const viewerRef = useRef<HTMLDivElement>(null)
  const [pageCount, setPageCount] = useState(0)
  const [pageWidth, setPageWidth] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return

    const observer = new ResizeObserver(([entry]) => {
      setPageWidth(Math.max(0, entry.contentRect.width - 36))
    })
    observer.observe(viewer)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="vl-pdf-viewer" ref={viewerRef}>
      <Document
        file={publicAssetUrl('Notes.pdf')}
        onLoadSuccess={({ numPages }) => {
          setPageCount(numPages)
          setError('')
        }}
        onLoadError={(loadError) => setError(`Unable to load lecture notes: ${loadError.message}`)}
        loading={<p role="status">Loading lecture notes…</p>}
        error={<p role="alert">{error || 'Unable to load lecture notes.'}</p>}
      >
        {Array.from({ length: pageCount }, (_, index) => (
          <Page
            className="vl-pdf-page"
            key={index + 1}
            pageNumber={index + 1}
            width={pageWidth || undefined}
          />
        ))}
      </Document>
    </div>
  )
}

function VirtualLibrary({ isActive, onBack }: VirtualLibraryProps) {
  const [activeTab, setActiveTab] = useState<LibraryTab>('materials')
  const [cameraOn, setCameraOn] = useState(true)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(50 * 60)
  const [tasks, setTasks] = useState(() => initialTasks.map((text, id) => ({ id, text })))
  const [checkedTasks, setCheckedTasks] = useState<number[]>([0])
  const [newTask, setNewTask] = useState('')
  const [taskError, setTaskError] = useState('')
  const [participantsOpen, setParticipantsOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [studentPhotoOffset, setStudentPhotoOffset] = useState(0)

  useEffect(() => {
    if (!isActive || !timerRunning) return
    const interval = window.setInterval(() => {
      setTimerSeconds((seconds) => Math.max(0, seconds - 1))
    }, 1000)
    return () => window.clearInterval(interval)
  }, [isActive, timerRunning])

  useEffect(() => {
    setTimerRunning(isActive)
  }, [isActive])

  useEffect(() => {
    if (!isActive) {
      setStudentPhotoOffset(0)
      return
    }

    const interval = window.setInterval(() => {
      setStudentPhotoOffset((offset) => (offset + 1) % rotatingGalleryFrames.length)
    }, 3000)
    return () => window.clearInterval(interval)
  }, [isActive])

  useEffect(() => {
    if (timerRunning && timerSeconds === 0) setTimerRunning(false)
  }, [timerRunning, timerSeconds])

  const formattedTime = `${String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:${String(timerSeconds % 60).padStart(2, '0')}`

  const addTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = newTask.trim()
    if (!text) {
      setTaskError('Enter a task before adding it.')
      return
    }

    setTasks((current) => [...current, { id: current.length, text }])
    setNewTask('')
    setTaskError('')
  }

  const leaveRoom = () => {
    setMenuOpen(false)
    setParticipantsOpen(false)
    setTimerRunning(false)
    setVideoOpen(false)
    setNotesOpen(false)
    onBack()
  }

  const mediaOpen = videoOpen || notesOpen

  return (
    <main className="virtual-library" aria-label="JEE 2027 Library">
      <header className="vl-header">
        <div className="vl-header-inner">
          <button className="vl-back-button" type="button" onClick={leaveRoom} aria-label="Back to Focus">
            <ArrowLeft size={24} aria-hidden="true" />
          </button>
          <div className="vl-room-title">
            <h1>JEE 2027 Library</h1>
            <p><span className="vl-online-dot" />324 students online <span aria-hidden="true">·</span> Room 1 of 4</p>
          </div>
          <div className="vl-menu-wrap">
            <button
              className="vl-more-button"
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Room options"
              aria-expanded={menuOpen}
            >
              <MoreVertical size={22} />
            </button>
            {menuOpen && (
              <div className="vl-room-menu">
                <span>Quiet room · microphones muted</span>
                <button type="button" onClick={leaveRoom}>Leave this room</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className={`vl-content${mediaOpen ? ' is-media-open' : ''}`}>
        <section className="vl-students-panel" aria-label={mediaOpen ? `${notesOpen ? 'Lecture notes' : 'Practice video'} and live students` : 'Live room video and students'}>
          {mediaOpen && (
            // Video Notes Section 
            <div className={`vl-media-stage${notesOpen ? ' is-notes' : ''}`}>
              {notesOpen ? (
                <LectureNotesPdf />
              ) : (
                <iframe
                  src="https://www.youtube-nocookie.com/embed/F-Irp-VX608"
                  title="Related Practice Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              )}
              <button
                className="vl-media-close"
                type="button"
                onClick={() => {
                  setVideoOpen(false)
                  setNotesOpen(false)
                }}
                aria-label={`Close ${notesOpen ? 'lecture notes' : 'practice video'} and return to the live room`}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          )}
          <div className={`vl-student-grid${mediaOpen ? ' is-media-compact' : ''}`}>
            {rotatingGalleryFrames[studentPhotoOffset].map((student) => (
              <article className="vl-student-tile" key={student.name}>
                {student.image ? (
                  <img src={student.image} alt={`${student.name} studying with their camera off`} loading="lazy" decoding="async" />
                ) : (
                  <div className="vl-student-placeholder" aria-label={`${student.name} camera off`}>
                    <span><Users size={42} aria-hidden="true" /></span>
                  </div>
                )}
                <span className="vl-student-name"><i aria-hidden="true" />{student.name}</span>
                <span className="vl-camera-off" aria-label="Camera off"><VideoOff size={17} aria-hidden="true" /></span>
              </article>
            ))}
          </div>
        </section>

        <section className="vl-study-panel" aria-label="Study resources">
          <div className="vl-tabs" role="tablist" aria-label="Library tools">
            <button
              className={activeTab === 'todo' ? 'is-active' : ''}
              type="button"
              role="tab"
              aria-selected={activeTab === 'todo'}
              onClick={() => setActiveTab('todo')}
            >
              <CheckSquare size={22} aria-hidden="true" /><span>To Do List</span><b>{tasks.length}</b>
            </button>
            <button
              className={activeTab === 'materials' ? 'is-active' : ''}
              type="button"
              role="tab"
              aria-selected={activeTab === 'materials'}
              onClick={() => setActiveTab('materials')}
            >
              <FileText size={22} aria-hidden="true" /><span>Lecture Material</span>
            </button>
          </div>

          <div className="vl-panel-content" role="tabpanel">
            {activeTab === 'materials' && (
              <div className="vl-material-list">
                {materials.map((material) => (
                  material.type === 'video' ? (
                    <button
                      className="vl-material-row vl-material-video-trigger"
                      key={material.title}
                      type="button"
                      onClick={() => {
                        setVideoOpen(true)
                        setNotesOpen(false)
                      }}
                      aria-label={`Play ${material.title}`}
                    >
                      <span className="vl-material-icon vl-material-video"><Play size={24} aria-hidden="true" /></span>
                      <span className="vl-material-copy">
                        <strong>{material.title}</strong>
                        <small>{material.meta}</small>
                      </span>
                    </button>
                  ) : (
                    <button
                      className="vl-material-row vl-material-view-trigger"
                      key={material.title}
                      type="button"
                      onClick={() => {
                        setVideoOpen(false)
                        setNotesOpen(true)
                      }}
                      aria-label={`Open ${material.title}`}
                    >
                      <span className={`vl-material-icon vl-material-${material.type}`}>
                        <FileText size={24} />
                      </span>
                      <span className="vl-material-copy">
                        <strong>{material.title}</strong>
                        <small>{material.meta}</small>
                      </span>
                    </button>
                  )
                ))}
              </div>
            )}

            {activeTab === 'todo' && (
              <div className="vl-todo-list">
                <form className="vl-todo-entry" onSubmit={addTask}>
                  <input
                    type="text"
                    value={newTask}
                    onChange={(event) => {
                      setNewTask(event.target.value)
                      if (taskError) setTaskError('')
                    }}
                    placeholder="Add a task"
                    aria-label="New task"
                    aria-invalid={Boolean(taskError)}
                    aria-describedby={taskError ? 'vl-task-error' : undefined}
                    required
                  />
                  <button type="submit" aria-label="Add task">
                    <Plus size={18} aria-hidden="true" />
                    <span>Add</span>
                  </button>
                </form>
                {taskError && <p className="vl-todo-error" id="vl-task-error" role="status">{taskError}</p>}
                {tasks.map(({ id, text }) => {
                  const checked = checkedTasks.includes(id)
                  return (
                    <button
                      className={`vl-todo-item${checked ? ' is-checked' : ''}`}
                      key={id}
                      type="button"
                      aria-pressed={checked}
                      onClick={() => setCheckedTasks((current) => checked ? current.filter((item) => item !== id) : [...current, id])}
                    >
                      <span className="vl-todo-check">{checked && <Check size={16} />}</span>
                      <span>{text}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </section>

      </div>

      <nav className="vl-action-bar" aria-label="Room actions">
        <button className="vl-action vl-action-notes" type="button" onClick={() => setActiveTab('materials')}>
          <BookOpen size={27} aria-hidden="true" /><strong>PW Notes</strong>
        </button>
        <button className={`vl-action vl-action-timer${timerRunning ? ' is-on' : ''}`} type="button" onClick={() => setTimerRunning((running) => !running)} aria-pressed={timerRunning}>
          <Timer size={27} aria-hidden="true" /><strong>Timer</strong><small>{formattedTime}</small>
        </button>
        <button className={`vl-action vl-action-camera${cameraOn ? ' is-on' : ''}`} type="button" onClick={() => setCameraOn((isOn) => !isOn)} aria-pressed={cameraOn}>
          {cameraOn ? <Video size={27} aria-hidden="true" /> : <VideoOff size={27} aria-hidden="true" />}
          <strong>Camera</strong><small>{cameraOn ? 'On' : 'Off'}</small>
        </button>
        <button className="vl-action vl-action-leave" type="button" onClick={leaveRoom}>
          <ArrowLeft size={27} aria-hidden="true" /><strong>Leave</strong>
        </button>
      </nav>

      {participantsOpen && (
        <div className="vl-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setParticipantsOpen(false) }}>
          <section className="vl-participants-dialog" role="dialog" aria-modal="true" aria-labelledby="vl-participants-title">
            <div className="vl-dialog-heading">
              <div><p>STUDYING TOGETHER</p><h2 id="vl-participants-title">Room participants</h2></div>
              <button type="button" onClick={() => setParticipantsOpen(false)} aria-label="Close participants"><X size={20} /></button>
            </div>
            <p className="vl-participant-count"><span className="vl-online-dot" />324 students online in JEE 2027 Library</p>
            <div className="vl-participant-list">
              {studyStudents.map((student) => (
                <div key={student.name}>
                  {student.image ? <img src={student.image} alt="" loading="lazy" decoding="async" /> : <span className="vl-participant-initial">S</span>}
                  <span>{student.name}</span><small>Studying</small>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export default VirtualLibrary

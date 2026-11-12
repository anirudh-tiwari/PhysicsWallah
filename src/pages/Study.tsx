import { useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  Bell,
  Book,
  BookOpen,
  CalendarX2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  EllipsisVertical,
  Flame,
  Gift,
  Menu,
  MonitorPlay,
  Pencil,
  Pi,
  Send,
  Check,
  Trash2,
  X,
} from 'lucide-react'
import type { StudyNoteTopic } from '../types/StudyNotes'

const quickActions = [
  { label: 'All Classes', icon: MonitorPlay },
  { label: 'Secondary Teacher', icon: Book },
  { label: 'My Doubts', icon: BookOpen },
  { label: 'Pi', icon: Pi },
]

const studyItems = ['My Batches', 'My Notes', 'Dashboard', 'My History', 'Bookmarks', 'PDF Bank']

type StudyProps = {
  onOpenMyBatches: () => void
  notes: StudyNoteTopic[]
  onAddPersonalNote: (courseName: string, title: string, text: string, pages?: StudyNoteTopic['highlights'][number]['pages']) => void
  onOpenSavedNote: (courseName: string, title: string, pageNumber: number, y?: number) => void
  onEditHighlight: (courseName: string, title: string, highlightId: string, text: string) => void
  onDeleteHighlight: (courseName: string, title: string, highlightId: string) => void
}

function Study({ onOpenMyBatches, notes, onAddPersonalNote, onOpenSavedNote, onEditHighlight, onDeleteHighlight }: StudyProps) {
  const [notesView, setNotesView] = useState<'dashboard' | 'courses' | 'course'>('dashboard')
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [selectedTopicTitle, setSelectedTopicTitle] = useState<string | null>(null)
  const [personalNotes, setPersonalNotes] = useState<Record<string, string>>({})
  const [editingHighlight, setEditingHighlight] = useState<{ id: string; text: string } | null>(null)
  const courseTopics = notes.filter((topic) => topic.courseName === selectedCourse && topic.title === selectedTopicTitle)

  const addPersonalNote = (event: FormEvent<HTMLFormElement>, title: string) => {
    event.preventDefault()
    const text = personalNotes[title]?.trim()
    if (!selectedCourse || !text) return
    onAddPersonalNote(selectedCourse, title, text)
    setPersonalNotes((current) => ({ ...current, [title]: '' }))
  }

  return (
    <main className="study-screen" aria-label="Study">
      <header className="study-banner">
        <div className="study-topline" aria-hidden="true">
          <Menu className="study-menu-icon" size={22} strokeWidth={2.5} />
          <div className="study-rewards">
            {/* <Gift className="study-gift-icon" size={22} strokeWidth={2.3} /> */}
            <span className="study-reward"><Flame size={20} fill="currentColor" /><b>0</b></span>
            <span className="study-reward study-xp"><span className="study-xp-mark">XP</span><b style={{marginLeft: '8px'}}>0</b></span>
            <span className="study-reward study-coins"><CircleDollarSign size={20} /><b>0</b></span>
          </div>
          <Bell className="study-bell-icon" size={23} strokeWidth={2} />
        </div>
        <div className="study-batch-copy">
          <p>YOUR BATCH</p>
          <div className="study-batch-name">
            <h1>JavaScript in One Shot</h1>
            <ChevronDown size={19} fill="currentColor" aria-hidden="true" />
            <EllipsisVertical className="study-batch-more" size={22} aria-hidden="true" />
          </div>
        </div>
      </header>

      <div className="study-content">
        {notesView !== 'dashboard' ? (
          <section className="study-notes-view" aria-labelledby="study-notes-heading">
            <button
              type="button"
              className="study-notes-back"
              onClick={() => {
                if (notesView === 'course') {
                  setNotesView('courses')
                  setSelectedCourse(null)
                  setSelectedTopicTitle(null)
                } else {
                  setNotesView('dashboard')
                }
              }}
            >
              <ArrowLeft size={18} aria-hidden="true" />
              <span>{notesView === 'course' ? 'My Notes' : 'Study'}</span>
            </button>
            <h2 id="study-notes-heading">{notesView === 'course' ? selectedTopicTitle : 'My Notes'}</h2>
            {notesView === 'courses' && (
              notes.length ? (
                <div className="study-notes-chapter-list">
                  {notes.map((topic) => (
                    <button
                      type="button"
                      className="study-notes-chapter-link"
                      key={`${topic.courseName}:${topic.title}`}
                      onClick={() => {
                        setSelectedCourse(topic.courseName)
                        setSelectedTopicTitle(topic.title)
                        setNotesView('course')
                      }}
                    >
                      <span>{topic.title}</span>
                      <ChevronRight size={19} aria-hidden="true" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="study-notes-empty">Your saved highlights and notes will appear here.</p>
              )
            )}
            {notesView === 'course' && (
              <>
                <div className="study-notes-topic-list">
                  {courseTopics.map((topic) => (
                    <section className="study-notes-topic" key={topic.title}>
                      {topic.highlights.map((highlight) => (
                        <article className="study-highlight-item" key={highlight.id}>
                          {editingHighlight?.id === highlight.id ? (
                            <form className="study-highlight-edit" onSubmit={(event) => {
                              event.preventDefault()
                              const text = editingHighlight.text.trim()
                              if (!text) return
                              onEditHighlight(topic.courseName, topic.title, highlight.id, text)
                              setEditingHighlight(null)
                            }}>
                              <textarea
                                value={editingHighlight.text}
                                onChange={(event) => setEditingHighlight({ id: highlight.id, text: event.target.value })}
                                aria-label="Edit saved highlight text"
                                rows={3}
                                autoFocus
                              />
                              <div className="study-highlight-edit-actions">
                                <button type="submit" aria-label="Save highlight text"><Check size={17} /></button>
                                <button type="button" aria-label="Cancel editing highlight" onClick={() => setEditingHighlight(null)}><X size={17} /></button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <button
                                className="study-saved-highlight study-saved-note-link"
                                type="button"
                                onClick={() => onOpenSavedNote(topic.courseName, topic.title, highlight.pages[0]?.pageNumber ?? 1, highlight.pages[0]?.rects[0]?.y)}
                              >
                                <p>{highlight.text}</p>
                                {!!highlight.pages.length && (
                                  <small>{topic.courseName} · Page {highlight.pages.map((page) => page.pageNumber).join(', ')}</small>
                                )}
                              </button>
                              <div className="study-highlight-actions" aria-label="Highlight actions">
                                <button type="button" aria-label="Edit highlight" onClick={() => setEditingHighlight({ id: highlight.id, text: highlight.text })}><Pencil size={16} /></button>
                                <button type="button" aria-label="Delete highlight" onClick={() => onDeleteHighlight(topic.courseName, topic.title, highlight.id)}><Trash2 size={16} /></button>
                              </div>
                            </>
                          )}
                        </article>
                      ))}
                      {topic.notes.map((item) => item.pages?.length ? (
                        <button
                          className="study-personal-note study-saved-note-link"
                          key={item.id}
                          type="button"
                          onClick={() => onOpenSavedNote(topic.courseName, topic.title, item.pages?.[0]?.pageNumber ?? 1, item.pages?.[0]?.rects[0]?.y)}
                        >
                          <span>{item.text}</span>
                          <small>{topic.courseName} · Page {item.pages.map((page) => page.pageNumber).join(', ')}</small>
                        </button>
                      ) : <p className="study-personal-note" key={item.id}>{item.text}</p>)}
                      {!topic.highlights.length && !topic.notes.length && (
                        <p className="study-notes-empty">No highlights saved for this lesson yet.</p>
                      )}
                      <form className="study-note-form" onSubmit={(event) => addPersonalNote(event, topic.title)}>
                        <label htmlFor={`study-note-${topic.title}`}>Add a note under {topic.title}</label>
                        <div>
                          <input
                            id={`study-note-${topic.title}`}
                            type="text"
                            value={personalNotes[topic.title] ?? ''}
                            onChange={(event) => setPersonalNotes((current) => ({ ...current, [topic.title]: event.target.value }))}
                            placeholder="Write your own note..."
                            aria-label={`Write a personal note under ${topic.title}`}
                          />
                          <button type="submit" disabled={!personalNotes[topic.title]?.trim()} aria-label={`Save note under ${topic.title}`}>
                            <Send size={17} aria-hidden="true" />
                          </button>
                        </div>
                      </form>
                    </section>
                  ))}
                </div>
              </>
            )}
          </section>
        ) : (
          <>
        <section className="study-quick-actions" aria-label="Quick actions">
          {quickActions.map(({ label, icon: Icon }) => (
            <div className="study-quick-action" key={label}>
              <Icon size={34} strokeWidth={2.2} aria-hidden="true" />
              <span>{label}</span>
            </div>
          ))}
        </section>

        <section className="study-events" aria-labelledby="study-events-heading">
          <h2 id="study-events-heading">Upcoming Events (0)</h2>
          <div className="study-empty-events">
            <CalendarX2 size={26} strokeWidth={1.8} aria-hidden="true" />
            <p>Today&apos;s live events have ended</p>
          </div>
          <div className="study-schedule-control">View Weekly Schedule</div>
        </section>

        <section className="study-zone" aria-labelledby="study-zone-heading">
          <h2 id="study-zone-heading">My Study Zone</h2>
          <div className="study-zone-grid">
            {studyItems.map((item) => {
              const content = (
                <>
                  <span className="study-book-glyph" aria-hidden="true">
                    <Book size={34} strokeWidth={2} />
                  </span>
                  <span>{item === 'My Downloads' ? 'My Downl...' : item}</span>
                </>
              )

              return item === 'My Batches' ? (
                <button className="study-zone-card" key={item} type="button" onClick={onOpenMyBatches}>
                  {content}
                </button>
              ) : item === 'My Notes' ? (
                <button className="study-zone-card" key={item} type="button" onClick={() => setNotesView('courses')}>
                  {content}
                </button>
              ) : (
                <div className="study-zone-card" key={item}>
                  {content}
                </div>
              )
            })}
          </div>
        </section>
          </>
        )}
      </div>
    </main>
  )
}

export default Study

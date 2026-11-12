import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react'

type Course = {
  name: string
  provider: string
  language: string
  status?: string
  startedOn: string
  price: string
  action: 'Buy Now' | 'Enroll Now'
  delivery: 'Online' | 'Offline'
  batchType: 'E-Batch' | 'Classroom'
  art: 'fullstack' | 'devops' | 'testing' | 'javascript' | 'css'
  artKicker: string
  completionPercentage?: number
}

const courses: Course[] = [
  {
    name: 'Full Stack Development with AI',
    provider: 'PW Skills',
    language: 'HINGLISH',
    status: 'Ongoing',
    completionPercentage: 35,
    startedOn: '31st Oct’26',
    price: '₹6,999',
    action: 'Buy Now',
    delivery: 'Online',
    batchType: 'E-Batch',
    art: 'fullstack',
    artKicker: 'Build beyond the basics',
  },
  {
    name: 'DevOps and Cloud Computing Course',
    provider: 'PW Skills',
    language: 'HINGLISH',
    status: 'Ongoing',
    startedOn: '28th Jun’26',
    price: '₹7,999',
    action: 'Buy Now',
    delivery: 'Online',
    batchType: 'E-Batch',
    art: 'devops',
    artKicker: 'From code to cloud',
  },
  {
    name: 'Software Testing with AI Bootcamp',
    provider: 'PW Skills',
    language: 'HINGLISH',
    status: 'Ongoing',
    startedOn: '17th Jun’26',
    price: '₹29',
    action: 'Buy Now',
    delivery: 'Online',
    batchType: 'E-Batch',
    art: 'testing',
    artKicker: 'Quality, reimagined',
  },
  {
    name: 'JavaScript in One Shot',
    provider: 'PW Skills',
    language: 'HINGLISH',
    startedOn: '18th Sep’26',
    price: 'Free',
    action: 'Enroll Now',
    delivery: 'Online',
    batchType: 'E-Batch',
    art: 'javascript',
    artKicker: 'Make the web move',
  },
  {
    name: 'CSS in One Shot',
    provider: 'PW Skills',
    language: 'HINGLISH',
    status: 'Ongoing',
    completionPercentage: 68,
    startedOn: '18th Sep’26',
    price: 'Free',
    action: 'Enroll Now',
    delivery: 'Online',
    batchType: 'E-Batch',
    art: 'css',
    artKicker: 'Shape every screen',
  },
]

function getRequiredCourse(name: string): Course {
  const course = courses.find((candidate) => candidate.name === name)
  if (course === undefined) {
    throw new Error(`The active course "${name}" must exist in the course catalog.`)
  }
  return course
}

const activeCourses = [
  getRequiredCourse('Full Stack Development with AI'),
  getRequiredCourse('CSS in One Shot'),
]

type ModalState = { course: Course; kind: 'details' | 'enroll' } | null
type DeliveryFilter = 'All' | 'Online' | 'Offline'
type BatchFilter = 'All' | 'E-Batch' | 'Classroom'

type BatchesProps = {
  query: string
  onQueryChange: (query: string) => void
  onOpenActiveCourse: (courseName: string) => void
}

type CourseBannerProps = {
  course: Course
  courseIndex: number
  onOpenDetails: () => void
  actionLabel?: string
  className?: string
}

function CourseBanner({ course, courseIndex, onOpenDetails, actionLabel, className = '' }: CourseBannerProps) {
  return (
    <button
      className={`course-banner banner-${course.art} ${className}`}
      type="button"
      onClick={onOpenDetails}
      aria-label={actionLabel ?? `View details for ${course.name}`}
    >
      <span className="banner-topline" aria-hidden="true">
        <span className="banner-kicker">{course.artKicker}</span>
        <Sparkles size={16} />
      </span>
      <span className="banner-title" aria-hidden="true">{course.name}</span>
      <span className="banner-artwork" aria-hidden="true">
        {course.art === 'fullstack' && <><span className="art-code">&lt;AI /&gt;</span><span className="art-orbit orbit-a" /><span className="art-orbit orbit-b" /><span className="art-node node-a" /><span className="art-node node-b" /></>}
        {course.art === 'devops' && <><span className="art-cloud">☁</span><span className="art-line" /><span className="art-node node-a" /><span className="art-node node-b" /><span className="art-node node-c" /></>}
        {course.art === 'testing' && <><span className="art-check"><Check size={26} /></span><span className="art-grid" /><span className="art-spark spark-a">✳</span></>}
        {course.art === 'javascript' && <><span className="art-js">JS</span><span className="art-bracket">{'{ }'}</span><span className="art-orbit orbit-a" /></>}
        {course.art === 'css' && <><span className="art-css">CSS</span><span className="art-shape shape-a" /><span className="art-shape shape-b" /><span className="art-spark spark-a">✳</span></>}
      </span>
      <span className="banner-index" aria-hidden="true">0{courseIndex + 1} <span>—</span> 05</span>
    </button>
  )
}

function Batches({ query, onQueryChange, onOpenActiveCourse }: BatchesProps) {
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryFilter>('All')
  const [batchFilter, setBatchFilter] = useState<BatchFilter>('All')
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [batchMenuOpen, setBatchMenuOpen] = useState(false)
  const [modal, setModal] = useState<ModalState>(null)
  const [enrollmentReady, setEnrollmentReady] = useState(false)
  const visibleCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return courses.filter((course) => {
      const matchesDelivery = deliveryFilter === 'All' || course.delivery === deliveryFilter
      const matchesBatch = batchFilter === 'All' || course.batchType === batchFilter
      const matchesQuery =
        !normalizedQuery ||
        `${course.name} ${course.provider} ${course.language} ${course.status ?? ''} ${course.startedOn}`
          .toLowerCase()
          .includes(normalizedQuery)
      return matchesDelivery && matchesBatch && matchesQuery
    })
  }, [batchFilter, deliveryFilter, query])

  useEffect(() => {
    if (!modal) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setModal(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [modal])

  const resetFilters = () => {
    setDeliveryFilter('All')
    setBatchFilter('All')
    onQueryChange('')
  }

  const openModal = (course: Course, kind: 'details' | 'enroll') => {
    setEnrollmentReady(false)
    setModal({ course, kind })
  }

  return (
    <>
      <main className="main-content">
        <section className="batch-section" aria-labelledby="batch-heading">
          <h1 className="visually-hidden" id="batch-heading">Batches</h1>

          <section className="catalog-section" aria-label="Courses">
          <div className="filters" aria-label="Filter courses">
            <div className="filter-controls">
              <button
                type="button"
                className={`filter-pill filter-all ${filterPanelOpen ? 'is-selected' : ''}`}
                onClick={() => {
                  setBatchMenuOpen(false)
                  setFilterPanelOpen((open) => !open)
                }}
                aria-expanded={filterPanelOpen}
                aria-controls="filter-panel"
              >
                <span>All Filters</span>
                <SlidersHorizontal size={15} aria-hidden="true" />
              </button>
              {(['Online', 'Offline'] as const).map((filter) => (
                <button
                  type="button"
                  key={filter}
                  className={`filter-pill ${deliveryFilter === filter ? 'is-selected' : ''}`}
                  onClick={() => setDeliveryFilter(deliveryFilter === filter ? 'All' : filter)}
                  aria-pressed={deliveryFilter === filter}
                >
                  {filter}
                </button>
              ))}
              <div className={`batch-filter-wrap ${batchMenuOpen ? 'batch-menu-open' : ''}`}>
                <button
                  type="button"
                  className={`filter-pill ${batchFilter !== 'All' ? 'is-selected' : ''}`}
                  onClick={() => {
                    setFilterPanelOpen(false)
                    setBatchMenuOpen((open) => !open)
                  }}
                  aria-expanded={batchMenuOpen}
                  aria-haspopup="listbox"
                  aria-controls="batch-type-menu"
                >
                  Batch Type
                  <ChevronDown size={13} aria-hidden="true" />
                </button>
                {batchMenuOpen && (
                  <div className="batch-menu" id="batch-type-menu" role="listbox" aria-label="Batch type">
                    {(['All', 'E-Batch', 'Classroom'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        role="option"
                        aria-selected={batchFilter === type}
                        onClick={() => {
                          setBatchFilter(type)
                          setBatchMenuOpen(false)
                        }}
                      >
                        {type === 'All' ? 'All batch types' : type}
                        {batchFilter === type && <Check size={14} aria-hidden="true" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {(deliveryFilter !== 'All' || batchFilter !== 'All' || query) && (
              <button className="reset-link" type="button" onClick={resetFilters}>Reset all</button>
            )}
          </div>

          {filterPanelOpen && (
            <div className="filter-panel" id="filter-panel" aria-label="Course filter options">
              <label>
                <span>Delivery</span>
                <select value={deliveryFilter} onChange={(event) => setDeliveryFilter(event.target.value as DeliveryFilter)}>
                  <option value="All">All formats</option>
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                </select>
              </label>
              <label>
                <span>Batch type</span>
                <select value={batchFilter} onChange={(event) => setBatchFilter(event.target.value as BatchFilter)}>
                  <option value="All">All batch types</option>
                  <option value="E-Batch">E-Batch</option>
                  <option value="Classroom">Classroom</option>
                </select>
              </label>
              <button type="button" className="filter-panel-clear" onClick={resetFilters}>Clear filters</button>
            </div>
          )}

          {visibleCourses.length > 0 ? (
            <div className="course-grid" id="courses">
              {visibleCourses.map((course, index) => {
                const isActive = activeCourses.includes(course)
                const openDetails = () => isActive
                  ? onOpenActiveCourse(course.name)
                  : openModal(course, 'details')

                return (
                  <article className="course-card" key={course.name} style={{ animationDelay: `${index * 45}ms` }}>
                    <CourseBanner
                      course={course}
                      courseIndex={courses.indexOf(course)}
                      actionLabel={isActive ? `Open course ${course.name}` : undefined}
                      onOpenDetails={openDetails}
                    />

                    <div className="course-content">
                      <div className="course-overline">
                        <span className="provider-name">{course.provider}</span>
                        <span className="language-badge">{course.language}</span>
                      </div>
                      <h3>{course.name}</h3>
                      <div className="course-meta">
                        {course.status && (
                          <span className="status-text"><Circle size={11} fill="currentColor" aria-hidden="true" />{course.status}</span>
                        )}
                        {course.status && <span className="meta-divider" aria-hidden="true" />}
                        <span className="start-date"><CalendarDays size={13} aria-hidden="true" />Started on {course.startedOn}</span>
                      </div>
                      <div className="course-footer">
                        <div className="price">{course.price}</div>
                        <div className="course-actions">
                          <button
                            className="enroll-button"
                            type="button"
                            onClick={() => isActive ? onOpenActiveCourse(course.name) : openModal(course, 'enroll')}
                          >
                            {isActive ? 'Continue' : course.action}
                          </button>
                          <button
                            className="details-button"
                            type="button"
                            onClick={openDetails}
                            aria-label={`${isActive ? 'Open' : 'More details about'} ${course.name}`}
                          >
                            <ChevronRight size={20} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="empty-state" role="status">
              <span className="empty-icon"><Search size={21} /></span>
              <h3>No courses found</h3>
              <p>Try a different search or reset your filters to see all available courses.</p>
              <button className="reset-button" type="button" onClick={resetFilters}>Show all courses</button>
            </div>
          )}
          </section>
        </section>
      </main>

      {modal && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null) }}>
          <section className="course-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-top">
              <span className={`modal-accent modal-${modal.course.art}`} aria-hidden="true"><BookOpen size={20} /></span>
              <button className="modal-close" type="button" onClick={() => setModal(null)} aria-label="Close dialog"><X size={19} /></button>
            </div>
            <p className="modal-eyebrow">{modal.kind === 'details' ? 'BATCH DETAILS' : 'YOUR NEXT STEP'}</p>
            <h2 id="modal-title">{modal.course.name}</h2>
            <div className="modal-facts">
              <div><span>Provider</span><strong>{modal.course.provider}</strong></div>
              <div><span>Language</span><strong>{modal.course.language}</strong></div>
              <div><span>Batch status</span><strong>{modal.course.status ?? 'Enrollment open'}</strong></div>
              <div><span>Started on</span><strong>{modal.course.startedOn}</strong></div>
              <div><span>Batch format</span><strong>{modal.course.batchType}</strong></div>
              {!activeCourses.includes(modal.course) && <div><span>Price</span><strong>{modal.course.price}</strong></div>}
            </div>
            {modal.kind === 'enroll' ? (
              <div className={`enrollment-message ${enrollmentReady ? 'enrollment-confirmed' : ''}`} role="status">
                {enrollmentReady ? (
                  <><Check size={17} /><span>Your next step for this batch is ready. You can continue from your batches list.</span></>
                ) : (
                  <><span>Review this batch and continue when you’re ready.</span></>
                )}
              </div>
            ) : (
              <p className="modal-note">Explore the batch at your own pace. The course information shown here matches the current listing.</p>
            )}
            <div className="modal-actions">
              <button type="button" className="modal-secondary" onClick={() => setModal(null)}>Close</button>
              {modal.kind === 'enroll' && (
                <button type="button" className="modal-primary" onClick={() => setEnrollmentReady(true)} disabled={enrollmentReady}>
                  {enrollmentReady ? 'Ready' : modal.course.action}
                  {!enrollmentReady && <ArrowRight size={16} />}
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  )
}

export default Batches

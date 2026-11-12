import { useEffect, useState } from 'react'
import {
  Check,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Headphones,
  Landmark,
  Layers3,
  Search,
  SlidersHorizontal,
  Stethoscope,
  Users,
  X,
} from 'lucide-react'
import { publicAssetUrl } from '../utils/publicAssetUrl'

type RoomCategory = 'JEE' | 'NEET' | 'UPSC' | 'Foundation'
type LibraryCategory = 'All' | RoomCategory
type LibraryAvailability = 'All' | 'Online' | 'Offline'

type StudyRoom = {
  id: string
  number: string
  category: RoomCategory
  name: string
  subtitle: string
  students: number
  capacity: number
  state: 'Live' | 'Filling fast' | 'Full'
  ambience: string
}

const studyRooms: StudyRoom[] = [
  {
    id: 'jee-sprint',
    number: 'Room 01',
    category: 'JEE',
    name: 'JEE 2027 Focus Hall',
    subtitle: 'Deep work • Physics, Chemistry & Maths',
    students: 842,
    capacity: 1200,
    state: 'Live',
    ambience: 'Quiet room',
  },
  {
    id: 'jee-revision',
    number: 'Room 02',
    category: 'JEE',
    name: 'JEE Revision Lounge',
    subtitle: 'A steady space for your daily revision',
    students: 300,
    capacity: 300,
    state: 'Full',
    ambience: 'Quiet room',
  },
  {
    id: 'neet-library',
    number: 'Room 01',
    category: 'NEET',
    name: 'NEET Silent Library',
    subtitle: 'Biology-first study, together',
    students: 496,
    capacity: 900,
    state: 'Live',
    ambience: 'Library sounds',
  },
  {
    id: 'upsc-current',
    number: 'Room 01',
    category: 'UPSC',
    name: 'UPSC Prelims Room',
    subtitle: 'Current affairs to answer writing',
    students: 318,
    capacity: 500,
    state: 'Filling fast',
    ambience: 'Quiet room',
  },
  {
    id: 'foundation-study',
    number: 'Room 01',
    category: 'Foundation',
    name: 'Foundation Study Hall',
    subtitle: 'Classes 9–10 • Build a daily rhythm',
    students: 125,
    capacity: 300,
    state: 'Live',
    ambience: 'Library sounds',
  },
]

const otherLibraries: { category: Exclude<RoomCategory, 'JEE'>; name: string; students: string; rooms: number }[] = [
  { category: 'NEET', name: 'NEET 2027 Library', students: '1,248', rooms: 6 },
  { category: 'UPSC', name: 'UPSC Library', students: '186', rooms: 3 },
  { category: 'Foundation', name: 'Foundation Library', students: '452', rooms: 5 },
]

type FocusProps = {
  query: string
  onJoinLibrary: () => void
}

function Focus({ query, onJoinLibrary }: FocusProps) {
  const [libraryCategory, setLibraryCategory] = useState<LibraryCategory>('All')
  const [libraryAvailability, setLibraryAvailability] = useState<LibraryAvailability>('All')
  const [courseMenuOpen, setCourseMenuOpen] = useState(false)
  const [roomPickerCategory, setRoomPickerCategory] = useState<RoomCategory | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<StudyRoom | null>(null)

  const normalizedLibraryQuery = query.trim().toLowerCase()
  const showRecommendedLibrary =
    libraryAvailability !== 'Offline' &&
    (libraryCategory === 'All' || libraryCategory === 'JEE') &&
    (!normalizedLibraryQuery || 'your enrolled course jee 2027 library'.includes(normalizedLibraryQuery))
  const visibleLibraries = otherLibraries.filter((library) =>
    libraryAvailability !== 'Offline' &&
    (libraryCategory === 'All' || library.category === libraryCategory) &&
    `${library.name} ${library.category}`.toLowerCase().includes(normalizedLibraryQuery),
  )
  const pickerRooms = roomPickerCategory
    ? studyRooms.filter((room) => room.category === roomPickerCategory)
    : []
  const pickerLibraryName = roomPickerCategory === 'JEE'
    ? 'JEE 2027 Library'
    : otherLibraries.find((library) => library.category === roomPickerCategory)?.name

  useEffect(() => {
    if (!selectedRoom && !roomPickerCategory) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedRoom(null)
        setRoomPickerCategory(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [roomPickerCategory, selectedRoom])

  const clearLibraryFilters = () => {
    setLibraryCategory('All')
    setLibraryAvailability('All')
  }

  return (
    <>
      <main className="focus-content" aria-labelledby="focus-heading">
        <div className="focus-inner">
          <section className="focus-filters" aria-label="Filter libraries">
            <div className="focus-filter-controls">
              <button
                type="button"
                className={`filter-pill filter-all${libraryCategory === 'All' && libraryAvailability === 'All' ? ' is-selected' : ''}`}
                onClick={clearLibraryFilters}
                aria-pressed={libraryCategory === 'All' && libraryAvailability === 'All'}
              >
                <span>All Libraries</span><SlidersHorizontal size={17} aria-hidden="true" />
              </button>
              {(['Online', 'Offline'] as const).map((availability) => (
                <button
                  key={availability}
                  type="button"
                  className={`filter-pill${libraryAvailability === availability ? ' is-selected' : ''}`}
                  onClick={() => setLibraryAvailability(libraryAvailability === availability ? 'All' : availability)}
                  aria-pressed={libraryAvailability === availability}
                >
                  {availability}
                </button>
              ))}
              <div className="course-filter-wrap">
                <button
                  type="button"
                  className={`filter-pill${libraryCategory !== 'All' ? ' is-selected' : ''}`}
                  onClick={() => setCourseMenuOpen((open) => !open)}
                  aria-expanded={courseMenuOpen}
                  aria-haspopup="listbox"
                  aria-controls="library-course-menu"
                >
                  {libraryCategory === 'All' ? 'Course' : libraryCategory}
                  <ChevronDown size={16} aria-hidden="true" />
                </button>
                {courseMenuOpen && (
                  <div className="batch-menu library-course-menu" id="library-course-menu" role="listbox" aria-label="Filter by course">
                    {(['All', 'JEE', 'NEET', 'UPSC', 'Foundation'] as const).map((category) => (
                      <button
                        key={category}
                        type="button"
                        role="option"
                        aria-selected={libraryCategory === category}
                        onClick={() => {
                          setLibraryCategory(category)
                          setCourseMenuOpen(false)
                        }}
                      >
                        {category === 'All' ? 'All courses' : category}
                        {libraryCategory === category && <Check size={14} aria-hidden="true" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {(libraryCategory !== 'All' || libraryAvailability !== 'All') && (
              <button className="focus-reset-link" type="button" onClick={clearLibraryFilters}>Clear</button>
            )}
          </section>

          <section className="focus-welcome" aria-labelledby="focus-heading">
            <div className="welcome-heading">
              <h1 id="focus-heading">PW Virtual Library</h1>
            </div>
            <div className="welcome-copy">
              <p className="focus-eyebrow">Study Together Stay Focused</p>
              <div className="hero-study-count"><span className="live-dot" /><strong>18,420</strong><span>students studying now</span></div>
            </div>
            <div className="library-illustration-section" aria-hidden="true">
              <img src={publicAssetUrl('PW-Virtual-Library-illustration-2.webp')} alt="" decoding="async" />
            </div>
          </section>

          <div className="library-results">
            {showRecommendedLibrary && (
              <article className="recommended-room" aria-labelledby="recommended-heading">
                <div className="recommended-topline">
                  <span className="recommended-label">Your Enrolled Course</span>
                  <span className="room-status status-live"><span className="live-dot" />LIVE</span>
                </div>
                <h2 id="recommended-heading">JEE 2027 Library</h2>
                <div className="recommended-meta">
                  <span><Users size={18} aria-hidden="true" />324 students studying</span>
                  <span className="recommended-divider" aria-hidden="true" />
                  <span><Layers3 size={18} aria-hidden="true" />4 active rooms</span>
                </div>
                <button className="recommended-join" type="button" onClick={onJoinLibrary}>
                  Join Library<ChevronRight size={20} aria-hidden="true" />
                </button>
              </article>
            )}

            {visibleLibraries.length > 0 && (
              <section className="rooms-section" aria-labelledby="rooms-heading">
                <h2 id="rooms-heading">Other PW Libraries</h2>
                <div className="library-list">
                  {visibleLibraries.map((library) => (
                    <button
                      key={library.category}
                      type="button"
                      className={`library-row library-row-${library.category.toLowerCase()}`}
                      onClick={() => setRoomPickerCategory(library.category)}
                      aria-label={`Open ${library.name}: ${library.students} students, ${library.rooms} rooms`}
                    >
                      <span className="library-icon" aria-hidden="true">
                        {library.category === 'NEET' ? <Stethoscope size={25} /> : library.category === 'UPSC' ? <Landmark size={25} /> : <GraduationCap size={25} />}
                      </span>
                      <span className="library-row-copy">
                        <strong>{library.name}</strong>
                        <span>{library.students} students · {library.rooms} rooms</span>
                      </span>
                      <span className="room-status status-live"><span className="live-dot" />LIVE</span>
                      <ChevronRight className="library-chevron" size={23} aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </section>
            )}
            {!showRecommendedLibrary && visibleLibraries.length === 0 && (
              <div className="library-empty-state" role="status">
                <Search size={22} />
                <strong>No libraries found</strong>
                <span>Try another search or clear your filters.</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {roomPickerCategory && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setRoomPickerCategory(null) }}>
          <section className="library-picker-modal" role="dialog" aria-modal="true" aria-labelledby="library-picker-title">
            <div className="library-picker-heading">
              <div>
                <p>CHOOSE A ROOM</p>
                <h2 id="library-picker-title">{pickerLibraryName}</h2>
              </div>
              <button className="modal-close" type="button" onClick={() => setRoomPickerCategory(null)} aria-label="Close room picker"><X size={19} /></button>
            </div>
            <div className="library-room-list">
              {pickerRooms.map((room) => {
                const isFull = room.state === 'Full'
                return (
                  <article className="library-room-option" key={room.id}>
                    <div className="library-room-details">
                      <span className="library-room-number">{room.number} <span>·</span> {room.category} PREP</span>
                      <strong>{room.name}</strong>
                      <span className="library-room-capacity">
                        {room.students.toLocaleString('en-IN')} / {room.capacity.toLocaleString('en-IN')} studying
                      </span>
                    </div>
                    <div className="library-room-actions">
                      <span className={`room-status ${isFull ? 'status-full' : room.state === 'Filling fast' ? 'status-filling' : 'status-live'}`}>
                        {!isFull && <span className="live-dot" />}{room.state}
                      </span>
                      <button
                        type="button"
                        className="library-room-join"
                        disabled={isFull}
                        onClick={() => {
                          setRoomPickerCategory(null)
                          setSelectedRoom(room)
                        }}
                      >
                        {isFull ? 'Full' : 'Join Room'}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        </div>
      )}

      {selectedRoom && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedRoom(null) }}>
          <section className="room-modal" role="dialog" aria-modal="true" aria-labelledby="room-modal-title">
            <div className="room-modal-top">
              <span className="room-modal-icon"><Headphones size={22} /></span>
              <button className="modal-close" type="button" onClick={() => setSelectedRoom(null)} aria-label="Close dialog"><X size={19} /></button>
            </div>
            <p className="room-modal-eyebrow">ROOM PREVIEW</p>
            <h2 id="room-modal-title">Coming soon</h2>
            <p className="room-modal-description">{selectedRoom.name} is getting ready. Room joining will be available here soon.</p>
            <div className="room-modal-details">
              <span><span className="live-dot" />{selectedRoom.state}</span>
              <span><Users size={15} />{selectedRoom.students.toLocaleString('en-IN')} / {selectedRoom.capacity.toLocaleString('en-IN')}</span>
            </div>
            <div className="modal-actions"><button type="button" className="modal-secondary" onClick={() => setSelectedRoom(null)}>Got it</button></div>
          </section>
        </div>
      )}
    </>
  )
}

export default Focus

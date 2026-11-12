export type HighlightRect = {
  x: number
  y: number
  width: number
  height: number
}

export type HighlightPage = {
  pageNumber: number
  rects: HighlightRect[]
}

export type SavedHighlight = {
  id: string
  text: string
  pages: HighlightPage[]
  createdAt: string
}

export type PersonalStudyNote = {
  id: string
  text: string
  createdAt: string
  pages?: HighlightPage[]
}

export type StudyNoteTopic = {
  courseName: string
  title: string
  highlights: SavedHighlight[]
  notes: PersonalStudyNote[]
}

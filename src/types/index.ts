export type CategoryId =
  | 'games' | 'books' | 'movies' | 'shows'
  | 'anime' | 'music' | 'podcasts' | 'docs' | 'courses'

export type StatusId =
  | 'wishlist' | 'planned' | 'active' | 'paused' | 'done' | 'dropped'

export interface Item {
  id: string
  category: CategoryId
  status: StatusId
  title: string
  platform: string
  tags: string[]
  progress: number
  cover: string
  notes: string
  createdAt: number
  updatedAt: number
}

export interface Category {
  id: CategoryId
  labels: { pt: string; en: string }
}

export interface Status {
  id: StatusId
  colorVar: string
  labels: { pt: string; en: string }
}

export interface ApiResult {
  title: string
  cover: string
  meta: string
  tags: string[]
}

export type Language = 'pt' | 'en'
export type Theme = 'dark' | 'light'
export type Layout = 'quadro' | 'galeria' | 'historico'

export interface Tweaks {
  theme: Theme
  layout: Layout
  language: Language
  showCovers: boolean
}

export interface SearchPageResult {
  results: ApiResult[]
  total: number
}

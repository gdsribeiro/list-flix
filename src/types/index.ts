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
  year: string
  platform: string
  duration: string
  tags: string[]
  progress: number
  cover: string
  notes: string
  createdAt: number
  updatedAt: number
}

export interface Category {
  id: CategoryId
  icon: string
  labels: { pt: string; en: string }
}

export interface Status {
  id: StatusId
  colorVar: string
  labels: { pt: string; en: string }
}

export interface ApiResult {
  title: string
  year: string
  cover: string
  meta: string
  tags: string[]
}

export type Language = 'pt' | 'en'
export type Theme = 'dark' | 'light'
export type Density = 'compact' | 'normal' | 'spacious'
export type Layout = 'kanban' | 'grid' | 'list'

export interface Tweaks {
  theme: Theme
  density: Density
  layout: Layout
  accentHue: number
  language: Language
}

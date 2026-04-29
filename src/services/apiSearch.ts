import type { ApiResult, CategoryId, SearchPageResult } from '@/types'

export type SearchSource = 'auto' | 'openlibrary' | 'itunes' | 'jikan' | 'wikipedia'

const PAGE_SIZE = 10

export async function searchPaged(
  query: string,
  category: CategoryId,
  source: SearchSource,
  page: number,
): Promise<SearchPageResult> {
  if (!query.trim()) return { results: [], total: 0 }

  const src = source === 'auto' ? inferSource(category) : source

  try {
    if (src === 'openlibrary') return await searchOpenLibrary(query, page)
    if (src === 'itunes') return await searchItunes(query, category, page)
    if (src === 'jikan') return await searchJikan(query, page)
    return await searchWikipedia(query, category, page)
  } catch {
    return { results: [], total: 0 }
  }
}

function inferSource(category: CategoryId): Exclude<SearchSource, 'auto'> {
  if (category === 'books') return 'openlibrary'
  if (category === 'music' || category === 'podcasts') return 'itunes'
  if (category === 'anime') return 'jikan'
  return 'wikipedia'
}

async function searchOpenLibrary(query: string, page: number): Promise<SearchPageResult> {
  const offset = (page - 1) * PAGE_SIZE
  const r = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${PAGE_SIZE}&offset=${offset}&fields=title,author_name,cover_i,subject,number_of_pages_median`,
  )
  const d = await r.json()
  const results: ApiResult[] = (d.docs ?? []).map((x: any) => ({
    title: x.title,
    cover: x.cover_i ? `https://covers.openlibrary.org/b/id/${x.cover_i}-M.jpg` : '',
    meta:  (x.author_name ?? []).slice(0, 2).join(', '),
    tags:  (x.subject ?? []).slice(0, 3),
  }))
  return { results, total: d.numFound ?? results.length }
}

async function searchItunes(query: string, category: CategoryId, page: number): Promise<SearchPageResult> {
  const entity = category === 'podcasts' ? 'podcast' : 'album'
  const offset = (page - 1) * PAGE_SIZE
  const r = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=${entity}&limit=${PAGE_SIZE}&offset=${offset}`,
  )
  const d = await r.json()
  const results: ApiResult[] = (d.results ?? []).map((x: any) => ({
    title: x.collectionName ?? x.trackName,
    cover: (x.artworkUrl100 ?? '').replace('100x100', '300x300'),
    meta:  x.artistName ?? '',
    tags:  x.primaryGenreName ? [x.primaryGenreName] : [],
  }))
  return { results, total: d.resultCount ?? results.length }
}

async function searchJikan(query: string, page: number): Promise<SearchPageResult> {
  const isManga = /manga|mang[áa]/i.test(query)
  const q2 = isManga ? query.replace(/manga|mang[áa]/gi, '').trim() : query
  const type = isManga ? 'manga' : 'anime'
  const r = await fetch(
    `https://api.jikan.moe/v4/${type}?q=${encodeURIComponent(q2)}&limit=${PAGE_SIZE}&page=${page}&sfw=true`,
  )
  const d = await r.json()
  const results: ApiResult[] = (d.data ?? []).map((x: any) => ({
    title: x.title_english ?? x.title,
    cover: x.images?.jpg?.image_url ?? '',
    meta:  isManga ? `${x.chapters ?? '?'} ch` : `${x.episodes ?? '?'} ep · ${x.type ?? ''}`.trim(),
    tags:  (x.genres ?? []).slice(0, 3).map((g: any) => g.name),
  }))
  const total = d.pagination?.items?.total ?? results.length
  return { results, total }
}

async function searchWikipedia(query: string, category: CategoryId, page: number): Promise<SearchPageResult> {
  const hint = ({ movies: 'film', shows: 'TV series', games: 'video game', docs: 'documentary', courses: 'course' } as Record<string, string>)[category] ?? ''
  const offset = (page - 1) * PAGE_SIZE
  const r = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrsearch=${encodeURIComponent(query + ' ' + hint)}&gsrlimit=${PAGE_SIZE}&gsroffset=${offset}&prop=pageimages|extracts|info&piprop=thumbnail&pithumbsize=200&exintro=1&explaintext=1&exchars=120&inprop=url`,
  )
  const d = await r.json()
  const pages = Object.values((d.query?.pages ?? {}) as Record<string, any>)
  pages.sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
  const results: ApiResult[] = pages.map(p => ({
    title: p.title,
    cover: p.thumbnail?.source ?? '',
    meta:  (p.extract ?? '').slice(0, 100) + ((p.extract ?? '').length > 100 ? '…' : ''),
    tags:  [],
  }))
  const total = d.query?.searchinfo?.totalhits ?? results.length
  return { results, total }
}

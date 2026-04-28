import type { ApiResult, CategoryId } from '@/types'

export async function searchByCategory(query: string, category: CategoryId): Promise<ApiResult[]> {
  if (!query.trim()) return []

  try {
    if (category === 'books') {
      const r = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=8&fields=title,author_name,first_publish_year,cover_i,subject`)
      const d = await r.json()
      return (d.docs ?? []).map((x: any) => ({
        title: x.title,
        year:  x.first_publish_year ?? '',
        cover: x.cover_i ? `https://covers.openlibrary.org/b/id/${x.cover_i}-M.jpg` : '',
        meta:  (x.author_name ?? []).slice(0, 2).join(', '),
        tags:  (x.subject ?? []).slice(0, 3),
      }))
    }

    if (category === 'music' || category === 'podcasts') {
      const entity = category === 'podcasts' ? 'podcast' : 'album'
      const r = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=${entity}&limit=8`)
      const d = await r.json()
      return (d.results ?? []).map((x: any) => ({
        title: x.collectionName ?? x.trackName,
        year:  (x.releaseDate ?? '').slice(0, 4),
        cover: (x.artworkUrl100 ?? '').replace('100x100', '300x300'),
        meta:  x.artistName ?? '',
        tags:  x.primaryGenreName ? [x.primaryGenreName] : [],
      }))
    }

    if (category === 'anime') {
      const isManga = /manga|mang[áa]/i.test(query)
      const q2 = isManga ? query.replace(/manga|mang[áa]/gi, '').trim() : query
      const url = `https://api.jikan.moe/v4/${isManga ? 'manga' : 'anime'}?q=${encodeURIComponent(q2)}&limit=8&sfw=true`
      const r = await fetch(url)
      const d = await r.json()
      return (d.data ?? []).map((x: any) => ({
        title: x.title_english ?? x.title,
        year:  x.year ?? ((x.aired?.from ?? x.published?.from ?? '')).slice(0, 4),
        cover: x.images?.jpg?.image_url ?? '',
        meta:  isManga ? `${x.chapters ?? '?'} ch` : `${x.episodes ?? '?'} ep · ${x.type ?? ''}`.trim(),
        tags:  (x.genres ?? []).slice(0, 3).map((g: any) => g.name),
      }))
    }

    const hint = ({ movies: 'film', shows: 'TV series', games: 'video game', docs: 'documentary', courses: 'course' } as Record<string, string>)[category] ?? ''
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrsearch=${encodeURIComponent(query + ' ' + hint)}&gsrlimit=8&prop=pageimages|extracts|info&piprop=thumbnail&pithumbsize=200&exintro=1&explaintext=1&exchars=160&inprop=url`
    const r = await fetch(url)
    const d = await r.json()
    const pages = Object.values((d.query?.pages ?? {}) as Record<string, any>)
    pages.sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    return pages.map(p => {
      const ym = (p.extract ?? '').match(/\b(19|20)\d{2}\b/)
      return {
        title: p.title,
        year:  ym ? ym[0] : '',
        cover: p.thumbnail?.source ?? '',
        meta:  (p.extract ?? '').slice(0, 80) + ((p.extract ?? '').length > 80 ? '…' : ''),
        tags:  [],
      }
    })
  } catch {
    return []
  }
}

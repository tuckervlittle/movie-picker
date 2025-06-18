const TMDB_KEY = '8c6da4e10faa95766887ff74b877c0f9'
const BASE_URL = 'https://api.themoviedb.org/3'

const STREAMING_API_KEY = '2e567efb8dmsh1e364ab52267a78p18579bjsne28f0bbd14a8'
// const STREAMING_API_URL = 'https://streaming-availability.p.rapidapi.com/search/title'

const MPAA_ORDER = {
  G: 0,
  PG: 1,
  'PG-13': 2,
  R: 3,
  'NC-17': 4,
  NR: 5
}

export async function getPopularMoviesByYearRange(startYear, endYear) {
  const endpoint = '/discover/movie?'
  const baseParams = new URLSearchParams({
    api_key: TMDB_KEY,
    include_adult: 'false',
    include_video: 'false',
    language: 'en-US',
    page: '1',
    'primary_release_date.gte': `${startYear}-01-01`,
    'primary_release_date.lte': `${endYear}-12-31`,
    sort_by: 'popularity.desc',
    with_origin_country: 'US'
  })

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4YzZkYTRlMTBmYWE5NTc2Njg4N2ZmNzRiODc3YzBmOSIsIm5iZiI6MTc0OTc3MDQxMC4yMDYsInN1YiI6IjY4NGI2MGFhZjdkNzY3NjUwODVjNzE4NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.3_g_lJbMcssal81EapYNQibfbiLE9G_bRHgwpQ3vKB0'
    }
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}${baseParams.toString()}`, options)
    const data = await res.json()

    const maxRatingKey = localStorage.getItem('moviePickerMaxRating') || 'PG-13'
    const maxAllowed = MPAA_ORDER[maxRatingKey]
    const movies = []
    for (const movie of data.results || []) {
      const rating = await getMovieRating(movie.id)
      const ratingValue = MPAA_ORDER[rating]
      movie.MPAA_rating = rating

      if (ratingValue <= maxAllowed) {
        movies.push(movie)
      }

      if (movies.length === 4) break
    }
    
    console.log(movies)
    return movies
  } catch (err) {
    console.error('Error fetching popular movies by range:', err)
    return []
  }
}


export async function searchMovies({ type = 'movie', genre, rating, year, country }) {
  const endpoint = type === 'tv' ? '/discover/tv' : '/discover/movie'

  const baseParams = new URLSearchParams({
    api_key: TMDB_KEY,
    language: 'en-US',
    sort_by: 'popularity.desc',
    include_adult: 'false',
    with_genres: genre,
    'vote_average.gte': rating,
  })

  if (year) {
    const dateKey = type === 'movie' ? 'primary_release_date.gte' : 'first_air_date.gte'
    baseParams.append(dateKey, `${year}-01-01`)
  }

  if (country) {
    baseParams.append('with_origin_country', country)
  }

  try {
    const res1 = await fetch(`${BASE_URL}${endpoint}?${baseParams.toString()}&page=1`)
    const data1 = await res1.json()

    const res2 = await fetch(`${BASE_URL}${endpoint}?${baseParams.toString()}&page=2`)
    const data2 = await res2.json()

    const res3 = await fetch(`${BASE_URL}${endpoint}?${baseParams.toString()}&page=3`)
    const data3 = await res3.json()

    return [
      ...(data1.results || []),
      ...(data2.results || []),
      ...(data3.results || []),
    ]
  } catch (err) {
    console.error('TMDB search error:', err)
    return []
  }
}


export async function getRandomPopularMovie() {
  try {
    const res = await fetch(`${BASE_URL}/movie/popular?api_key=${TMDB_KEY}&language=en-US&page=3`)
    const data = await res.json()

    if (!data.results || data.results.length === 0) return null
    const randomIndex = Math.floor(Math.random() * data.results.length)
    return data.results[randomIndex]
  } catch (err) {
    console.error('Random movie error:', err)
    return null
  }
}


export async function getStreamingPlatforms(id, country = 'us') {
  const newId = parseInt(id)
  const lowerCountry = country.toLowerCase()
  const url = `https://streaming-availability.p.rapidapi.com/shows/movie/${newId}?output_language=en&country=${lowerCountry}`

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': STREAMING_API_KEY,
        'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
      }
    })

    const data = await res.json()
    
    const options = data.streamingOptions?.[country.toLowerCase()]
    if (!Array.isArray(options)) return []

    const uniquePlatforms = new Map()

    for (const service of options) {
      if (service.type !== 'subscription') continue
      const id = service.service?.id

      if (!id || uniquePlatforms.has(id)) continue

      uniquePlatforms.set(id, {
        platform: id,
        name: service.service.name,
        link: service.videoLink || service.link
      }
      )
    }

    return Array.from(uniquePlatforms.values())
  } catch (err) {
    console.error('Streaming API error:', err)
    return []
  }
}

export async function getMovieRating(tmdbId) {
  const url = `${BASE_URL}/movie/${tmdbId}/release_dates?api_key=${TMDB_KEY}`
  
  try {
    const res = await fetch(url)
    const data = await res.json()

    const usRelease = data.results.find(r => r.iso_3166_1 === 'US')
    if (!usRelease || !usRelease.release_dates.length) return null

    const rating = usRelease.release_dates.find(r => r.certification)?.certification
    return rating || null
  } catch (err) {
    console.error('Error fetching rating:', err)
    return null
  }
}

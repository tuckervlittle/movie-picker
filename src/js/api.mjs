/* ******************************
 * API keys and URL's
 * **************************** */
const TMDB_KEY = '8c6da4e10faa95766887ff74b877c0f9'
const BASE_URL = 'https://api.themoviedb.org/3'

const STREAMING_API_KEY = '2e567efb8dmsh1e364ab52267a78p18579bjsne28f0bbd14a8'
// const STREAMING_API_URL = 'https://streaming-availability.p.rapidapi.com/search/title'

/* ******************************
 * Global Variables
 * **************************** */
const MPAA_ORDER = {
  G: 0,
  PG: 1,
  'PG-13': 2,
  R: 3,
  'NC-17': 4,
  NR: 5
}

/* ******************************
 * Gets popular movies within
 * a start and end year 
 * - Returns 4 movies within users
 *   rating preferences
 * **************************** */
export async function getPopularMoviesByYearRange(startYear, endYear) {
  // Building URL and params for call
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

  // Makes call
  try {
    const res = await fetch(`${BASE_URL}${endpoint}${baseParams.toString()}`, options)
    const data = await res.json()

    const maxRatingKey = localStorage.getItem('moviePickerMaxRating') || 'PG-13'
    const maxAllowed = MPAA_ORDER[maxRatingKey]
    const movies = []

    // Makes call for rating on each movie (up to 4)
    for (const movie of data.results || []) {
      const rating = await getMovieRating(movie.id)
      const ratingValue = MPAA_ORDER[rating]
      movie.MPAA_rating = rating

      // Only allows movies with rating less than or
      // equal to users set preferences
      if (ratingValue <= maxAllowed) {
        movies.push(movie)
      }

      // Up to 4 movies
      if (movies.length === 4) break
    }
    
    return movies
  } catch (err) {
    console.error('Error fetching popular movies by range:', err)
    return []
  }
}

/* ******************************
 * Gets 60 movies based on users
 * inputs 
 * - Returns 60 movies
 * **************************** */
export async function searchMovies({ type = 'movie', genre, rating, year, country }) {
  // Building URL and params for call
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

  // Makes call 3 times for 3 total pages
  try {
    const res1 = await fetch(`${BASE_URL}${endpoint}?${baseParams.toString()}&page=1`)
    const data1 = await res1.json()

    const res2 = await fetch(`${BASE_URL}${endpoint}?${baseParams.toString()}&page=2`)
    const data2 = await res2.json()

    const res3 = await fetch(`${BASE_URL}${endpoint}?${baseParams.toString()}&page=3`)
    const data3 = await res3.json()

    // Returns 3 pages (60 movies)
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

/* ******************************
 * Gets one random popular movie
 * **************************** */
export async function getRandomPopularMovie() {
  // Gets random page to allow for more options
  const pagesToSample = 20;
  const randomPage = Math.floor(Math.random() * pagesToSample) + 1;

  // Makes call
  try {
    const res = await fetch(`${BASE_URL}/movie/popular?api_key=${TMDB_KEY}&language=en-US&page=${randomPage}`);
    const data = await res.json();

    if (!data.results || data.results.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * data.results.length);

    // Returns a random movie
    return data.results[randomIndex];
  } catch (err) {
    console.error('Random movie error:', err);
    return null;
  }
}

/* ******************************
 * Gets streaming platforms for one movie
 * that are subscription only, not rent or buy
 * - Returns streaming platforms within users
 *   subscription preferences 
 * - including platform id, name, and link to movie
 * **************************** */
export async function getStreamingPlatforms(id, country = 'us') {
  // Building URL and params for call
  const newId = parseInt(id)
  const lowerCountry = country.toLowerCase()
  const url = `https://streaming-availability.p.rapidapi.com/shows/movie/${newId}?output_language=en&country=${lowerCountry}`

  // Makes the call
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': STREAMING_API_KEY,
        'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
      }
    })

    const data = await res.json()
    // Gets the streaming options by country
    const options = data.streamingOptions?.[country.toLowerCase()]

    if (!Array.isArray(options)) return []

    const uniquePlatforms = new Map()

    // Checking for subscription not rent or buy
    for (const service of options) {
      if (service.type !== 'subscription') continue
      const id = service.service?.id

      if (!id || uniquePlatforms.has(id)) continue

      // Sets id(name lowercase), name, and link to movie 
      // (Data I want to use)
      uniquePlatforms.set(id, {
        platform: id,
        name: service.service.name,
        link: service.videoLink || service.link
      }
      )
    }

    // Returns my data
    return Array.from(uniquePlatforms.values())
  } catch (err) {
    console.error('Streaming API error:', err)
    return []
  }
}

/* ******************************
 * Gets movie rating one movie at a time
 * - Returns MPAA rating
 * **************************** */
export async function getMovieRating(tmdbId) {
  // Building URL and params for call
  const url = `${BASE_URL}/movie/${tmdbId}/release_dates?api_key=${TMDB_KEY}`
  
  // Makes the call
  try {
    const res = await fetch(url)
    const data = await res.json()

    // Finding the rating
    const usRelease = data.results.find(r => r.iso_3166_1 === 'US')
    if (!usRelease || !usRelease.release_dates.length) return null

    const rating = usRelease.release_dates.find(r => r.certification)?.certification

    // Returns the rating
    console.log(rating)
    return rating || null
  } catch (err) {
    console.error('Error fetching rating:', err)
    return null
  }
}

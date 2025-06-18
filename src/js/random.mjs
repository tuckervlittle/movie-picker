import { getMovieRating, getRandomPopularMovie, getStreamingPlatforms } from './api.mjs'
import { getMaxRating, getSubscriptions } from './subs.mjs'

const MPAA_ORDER = {
  G: 0,
  PG: 1,
  'PG-13': 2,
  R: 3,
  'NC-17': 4,
  NR: 5
}

export async function renderRandomMovie() {
  const content = document.getElementById('random')
  content.innerHTML = '<p>Loading random movie...</p>'

  const today = new Date()
  const recentThreshold = new Date()
  recentThreshold.setDate(today.getDate() - 60)

  const maxRating = getMaxRating() || 'PG-13'

  let movie = null
  let rating = null
  let attempts = 0

  while (attempts < 50) {
    movie = await getRandomPopularMovie()

    if (!movie) break

    const releaseDate = new Date(movie.release_date)
    if (releaseDate > recentThreshold) {
      attempts++
      continue
    }

    rating = await getMovieRating(movie.id)
    if (!rating) continue
    const ratingValue = MPAA_ORDER[rating]
    const maxAllowed = MPAA_ORDER[maxRating]

    if (ratingValue <= maxAllowed) break
    attempts++
  }

  if (!movie || (rating && MPAA_ORDER[rating] > MPAA_ORDER[maxRating])) {
    content.innerHTML = '<p>No suitable movie found within the rating limit. Try again.</p>'
    return
  }

  const releaseYear = movie.release_date?.split('-')[0] || 'N/A'

  content.innerHTML = `
    <div id="random-movie" data-tmdbid="${movie.id}" data-country="US">
      <h2>${movie.title} (${releaseYear})</h2>
      <p class="rating">${rating || 'Not Rated'}</p>
      <p>⭐ ${movie.vote_average}</p>
      ${movie.poster_path
        ? `<img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title} poster">`
        : ''
      }
      <button class="checkAvailabilityBtn">Check Availability</button>
      <p class="platforms" id="platforms"></p>
      <p>${movie.overview}</p>
    </div>
  `

  const userSubscriptions = getSubscriptions()

  document.querySelectorAll('.checkAvailabilityBtn').forEach(button => {
    button.addEventListener('click', async (e) => {
      const parent = document.getElementById('random-movie')
      const id = parent.dataset.tmdbid
      const country = parent.dataset.country || 'us'

      const platformsEl = document.getElementById(`platforms`)

      platformsEl.textContent = 'Checking...'

      const platforms = await getStreamingPlatforms(id, country)

      if (!platforms.length) {
        platformsEl.textContent = 'Not available on subscription services. (May be available to rent or buy)'
        return
      }

      const matched = platforms.filter(p =>
        userSubscriptions.includes(p.platform.toLowerCase())
      )
  
      if (!matched.length) {
        platformsEl.textContent = 'Not available on your selected subscriptions.'
        return
      }


      platformsEl.innerHTML = `Available on: ${matched.map(p =>
        `<a href="${p.link}" target="_blank" rel="noopener noreferrer">${p.name}</a>`
      ).join(', ')}`
    })
  })
}
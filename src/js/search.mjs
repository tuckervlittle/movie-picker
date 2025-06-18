import { searchMovies, getStreamingPlatforms } from './api.mjs'
import { getSubscriptions } from "./subs.mjs"
import { renderMovieCards } from './utils.mjs'

export function renderSearch() {
  const content = document.getElementById('search')
  content.innerHTML = `
    <section class="search">
      <h2>Search</h2>
      <form id="searchForm">
        <label>Genre:
          <select name="genre" id="genreSelect">
            <option value="">Any</option>
            <option value="28">Action</option>
            <option value="35">Comedy</option>
            <option value="18">Drama</option>
            <option value="27">Horror</option>
            <option value="10749">Romance</option>
            <option value="878">Sci-Fi</option>
          </select>
        </label>
        <label>Minimum Rating (0–10):
          <input type="number" name="rating" min="0" max="10" step="0.1" />
        </label>
        <label>Released After (Year):
          <input type="number" name="year" min="1900" max="2025" />
        </label>
        <label>Country:
          <select name="country">
            <option value="">Any</option>
            <option value="US">United States</option>
            <option value="GB">United Kingdom</option>
            <option value="JP">Japan</option>
            <option value="KR">South Korea</option>
            <option value="IN">India</option>
            <option value="FR">France</option>
            <option value="DE">Germany</option>
            <option value="BR">Brazil</option>
          </select>
        </label>
        <button type="submit">Search</button>
      </form>
      <hr>
      <div id="searchLoader" class="loader hidden"></div>
      <div id="searchResults" class="movie-grid"></div>
    </section>
  `

  document.getElementById('searchForm').onsubmit = async (e) => {
    e.preventDefault()
    
    const loader = document.getElementById('searchLoader')
    const resultsContainer = document.getElementById('searchResults')
    resultsContainer.innerHTML = ''
    loader.classList.remove('hidden')

    const form = e.target
    const type = 'movie'
    const genre = form.genre.value
    const rating = parseFloat(form.rating.value) || 0
    const year = form.year.value
    const country = form.country.value
  
    const results = await searchMovies({ type, genre, rating, year, country })
    loader.classList.add('hidden')
  
    if (!results.length) {
      resultsContainer.innerHTML = '<p>No titles found.</p>'
      return
    }
  
    const output = renderMovieCards(results)
  
    resultsContainer.innerHTML = output
    
    const userSubscriptions = getSubscriptions()
  
    document.querySelectorAll('.checkAvailabilityBtn').forEach(button => {
      button.addEventListener('click', async (e) => {
        const parent = e.target.closest('.movie')
        const index = e.target.dataset.index
        const id = parent.dataset.tmdbid
        const country = parent.dataset.country || 'us'

        const platformsEl = document.getElementById(`platforms-${index}`)
  
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
}
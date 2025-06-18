import { getPopularMoviesByYearRange, getStreamingPlatforms } from "./api.mjs"
import { getSubscriptions } from "./subs.mjs"
import { renderMovieCards } from "./utils.mjs"

export async function renderHome() {
  const content = document.getElementById('homePage')
  const currentYear = new Date().getFullYear()
  const defaultDecade = 1990

  const recentMovies = await getPopularMoviesByYearRange(currentYear - 2, currentYear)
  const decadeMovies = await getPopularMoviesByYearRange(defaultDecade, (defaultDecade + 9))
  
  content.innerHTML = `
    <section>
    <div class="homeHeading">
      <h2>Most Popular (Last 2 Years)</h2>
      </div>
      <div class="movie-grid" id="recentMovies">
        ${renderMovieCards(recentMovies)}
      </div>
    </section>

    <section>
      <div class="homeHeading">
      <h2>Popular by Decade</h2>
      <label for="decadeSelect">Choose a Decade:</label>
      <select id="decadeSelect">
        ${[1960, 1970, 1980, 1990, 2000, 2010, 2020].map(decade =>
          `<option value="${decade}" ${decade === defaultDecade ? 'selected' : ''}>${decade}s</option>`
        ).join('')}
      </select>
      </div>
      <div class="movie-grid" id="decadeMovies">
        ${renderMovieCards(decadeMovies, '1')}
      </div>
    </section>
  `

  document.getElementById('decadeSelect').addEventListener('change', async (e) => {
    const selected = parseInt(e.target.value)
    const movies = await getPopularMoviesByYearRange(selected, selected + 9)
    document.getElementById('decadeMovies').innerHTML = renderMovieCards(movies, '1')
  })

  const userSubscriptions = getSubscriptions()
  console.log(userSubscriptions)

  document.querySelectorAll('.checkAvailabilityBtn').forEach(button => {
  button.addEventListener('click', async (e) => {
    const parent = e.target.closest('.movie')
    const index = e.target.dataset.index
    const id = parent.dataset.tmdbid
    const country = parent.dataset.country || 'us'
    console.log(id)
    const platformsEl = document.getElementById(`platforms-${index}`)

    platformsEl.textContent = 'Checking...'

    const platforms = await getStreamingPlatforms(id, country)
    console.log(platforms)
    console.log("roll")
    if (!platforms.length) {
      platformsEl.textContent = 'Not available on subscription services.'
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
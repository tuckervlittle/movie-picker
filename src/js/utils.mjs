import { getSubscriptions } from "./subs.mjs"

export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template
  if (callback) {
    callback(data)
  }
}

export async function loadTemplate(path) {
  const response = await fetch(path)
  const template = await response.text()
  return template
}

export async function loadHeaderFooter() {
  const headerTemplate = await loadTemplate('../partials/header.html')
  const footerTemplate = await loadTemplate('../partials/footer.html')

  const headerElement = document.getElementById('header')
  const footerElement = document.getElementById('footer')

  renderWithTemplate(headerTemplate, headerElement)
  renderWithTemplate(footerTemplate, footerElement)
}

export async function loadHeaderFooterWithHam() {
  await loadHeaderFooter()
  const hamButton = document.getElementById('hamButton')
  const navMenu = document.getElementById('navigation')
  checkSubs()
  
  hamButton.addEventListener('click', () => {
    navMenu.classList.toggle('open')
    hamButton.classList.toggle('open')
  })
}


export function renderMovieCards(movies, section = '') {
  return movies.map((movie, index) => `
    <div class="movie" data-title="${movie.title || movie.name}" data-country="${movie.country || 'US'}" data-tmdbid="${movie.tmdb_id || movie.id}">
      <h3>${movie.title} </h3>
      <p class="year">( ${(movie.release_date || '').split('-')[0] || 'N/A'} )</p>
      <p>⭐ ${movie.vote_average}</p>
      ${movie.poster_path
        ? `<img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title} poster">`
        : '<p>No image</p>'
      }
      <button class="checkAvailabilityBtn" data-index="${section}${index}">Check Availability</button>
        <p class="platforms" id="platforms-${section}${index}"></p>
    </div>
  `).join('')
}

export function checkSubs() {
  const subs = getSubscriptions() || []
  const div = document.getElementById('no-subs')
  const gear = document.getElementById('nav-img')
  const hamButton = document.getElementById('hamButton')

  if (subs.length == 0) {
    div.classList.remove('hidden')
    gear.classList.add('top')
    hamButton.classList.add('top')
  } else {
    div.classList.add('hidden')
    gear.classList.remove('top')
    hamButton.classList.remove('top')
  }
}
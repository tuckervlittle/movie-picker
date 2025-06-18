const SUBSCRIPTIONS_KEY = 'moviePickerSubscriptions'
const RATINGS_KEY = 'moviePickerMaxRating'

export function saveSubscriptions(services) {
  localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(services))
}

export function getSubscriptions() {
  return JSON.parse(localStorage.getItem(SUBSCRIPTIONS_KEY)) || []
}

export function saveMaxRating(rating) {
  localStorage.setItem(RATINGS_KEY, rating)
}

export function getMaxRating() {
  return localStorage.getItem(RATINGS_KEY) || ''
}

export function renderSubscriptions() {

  const MPAA_RATINGS = [
    'G',
    'PG',
    'PG-13',
    'R',
    'NC-17',
    'NR'
  ]

  const content = document.getElementById('subscriptions')
  const services = [
    { key: 'prime', label: 'Amazon Prime Video' },
    { key: 'apple', label: 'Apple TV+' },
    { key: 'disney', label: 'Disney+' },
    { key: 'google', label: 'Google Play' },
    { key: 'netflix', label: 'Netflix' },
    { key: 'youtube', label: 'YouTube Premium' },
    { key: 'hulu', label: 'Hulu' },
    { key: 'hbo', label: 'HBO Max' },
    { key: 'paramount', label: 'Paramount+' },
    { key: 'peacock', label: 'Peacock' },
    { key: 'showtime', label: 'Showtime' },
    { key: 'starz', label: 'Starz' }
  ]
  
  const saved = getSubscriptions()
  const savedRating = getMaxRating()

  content.innerHTML = `
  <section class="subscriptions">
    <h2>My Streaming Services</h2>
    <form id="subscriptionForm">
      ${services.map(service => `
        <label>
          <input type="checkbox" name="service" value="${service.key}" ${saved.includes(service.key) ? 'checked' : ''}>
          ${service.label}
        </label>
      `).join('')}
        
      <label for="maxRating">Maximum MPAA Rating:</label>
      <select name="maxRating" id="maxRating">
        <option value="">Any</option>
        ${MPAA_RATINGS.map(rating => `
          <option value="${rating}" ${savedRating === rating ? 'selected' : ''}>${rating}</option>
        `).join('')}
      </select><br><br>

      <button type="submit">Save</button>
    </form>
    <p id="saveNotice"></p>
  </section>
`


  document.getElementById('subscriptionForm').addEventListener('submit', (e) => {
    e.preventDefault()
    const selected = Array.from(document.querySelectorAll('input[name="service"]:checked'))
      .map(input => input.value)
    const maxRating = document.getElementById('maxRating').value

    saveSubscriptions(selected)
    saveMaxRating(maxRating)

    document.getElementById('saveNotice').textContent = 'Subscriptions and preferences saved!'
  })
}
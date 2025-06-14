const SUBSCRIPTIONS_KEY = 'moviePickerSubscriptions'

export function saveSubscriptions(services) {
  localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(services))
}

export function getSubscriptions() {
  return JSON.parse(localStorage.getItem(SUBSCRIPTIONS_KEY)) || []
}

export function renderSubscriptions() {
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

  content.innerHTML = `
  <section class="subscriptions">
    <h2>My Streaming Services</h2>
    <form id="subscriptionForm">
      ${services.map(service => `
        <label>
          <input type="checkbox" name="service" value="${service.key}" ${saved.includes(service.key) ? 'checked' : ''}>
          ${service.label}
        </label><br>
        `).join('')}
        <button type="submit">Save</button>
      </form>
      <p id="saveNotice"></p>
    </section>
  `


  document.getElementById('subscriptionForm').addEventListener('submit', (e) => {
    e.preventDefault()
    const selected = Array.from(document.querySelectorAll('input[name="service"]:checked'))
      .map(input => input.value)
    saveSubscriptions(selected)
    document.getElementById('saveNotice').textContent = 'Subscriptions saved!'
  })
}
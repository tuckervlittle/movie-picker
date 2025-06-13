import { searchMovies } from './api.mjs';

export function renderSearch() {
  const content = document.getElementById('search');
  content.innerHTML = `
    <section class="search">
      <h2>Search for a Movie</h2>
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
        <label>Release Year:
          <input type="number" name="year" min="1900" max="2025" />
        </label>
        <button type="submit">Search</button>
      </form>
      <div id="searchResults"></div>
    </section>
  `;

  document.getElementById('searchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const genre = form.genre.value;
    const rating = parseFloat(form.rating.value) || 0;
    const year = form.year.value;

    const results = await searchMovies({ genre, rating, year });

    const resultsContainer = document.getElementById('searchResults');
    if (!results || results.length === 0) {
      resultsContainer.innerHTML = '<p>No movies found.</p>';
      return;
    }

    resultsContainer.innerHTML = results.map(movie => `
      <div class="movie">
        <h3>${movie.title} (${movie.release_date?.split('-')[0] || 'N/A'})</h3>
        <p>Rating: ${movie.vote_average}</p>
        <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title} poster">
      </div>
    `).join('');
  });
}
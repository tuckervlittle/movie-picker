import { getSubscriptions } from "./subs.mjs";

export function renderSearch() {
  const content = document.getElementById('search');
  content.innerHTML = `
    <section class="search">
      <h2>Search for a Title</h2>
      <form id="searchForm">
        <label>Type:
          <select name="type">
            <option value="movie">Movie</option>
            <option value="tv">TV Show</option>
          </select>
        </label>
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
      <div id="searchLoader" class="loader hidden"></div>
      <div id="searchResults"></div>
    </section>
  `;
}
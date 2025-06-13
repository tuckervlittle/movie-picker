const TMDB_KEY = '';
const BASE_URL = 'https://api.themoviedb.org/3';

export async function getRandomPopularMovie() {
  try {
    const res = await fetch(`${BASE_URL}/movie/popular?api_key=${TMDB_KEY}&language=en-US&page=1`);
    const data = await res.json();
    const randomIndex = Math.floor(Math.random() * data.results.length);
    return data.results[randomIndex];
  } catch (err) {
    console.error('Error fetching movie:', err);
    return null;
  }
}

export async function searchMovies({ genre, rating, year }) {
  const params = new URLSearchParams({
    api_key: TMDB_KEY,
    language: 'en-US',
    sort_by: 'popularity.desc',
    include_adult: 'false',
    with_genres: genre,
    'vote_average.gte': rating,
    primary_release_year: year
  });

  try {
    const res = await fetch(`${BASE_URL}/discover/movie?${params}`);
    const data = await res.json();
    return data.results;
  } catch (err) {
    console.error('Search error:', err);
    return [];
  }
}
"use strict";
const API_KEY = "608a54af";
const main = document.querySelector("main");
const darkModeBtn = document.querySelector("#dark-mode-btn");
const searchInput = document.querySelector("#movieInput");
const explore = document.querySelector(".explore");
const moviesContainer = document.querySelector(".movies-container");

const searchMovies = async (query) => {
  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(
        query
      )}`
    );
    if (!response.ok) throw new Error(data.Error);
    const data = await response.json();
    const movies = data.Search;
    const fullDetailsPrimises = movies.map((movie) =>
      fetch(
        `https://www.omdbapi.com/?apikey=${API_KEY}&i=${movie.imdbID}`
      ).then((res) => res.json())
    );
    const fullDetailesMovies = await Promise.all(fullDetailsPrimises);
    renderMoviesCards(fullDetailesMovies);
  } catch (e) {
    explore.classList.add("hidden");
    moviesContainer.innerHTML =
      '<p id="message">Unable to find what you’re looking for. Please try another search.</p>';
  }
};

const renderMoviesCards = (moviesArray) => {
  explore.classList.add("hidden");
  moviesContainer.innerHTML = "";
  moviesArray.forEach((movie) => {
    const markup = `
          <div class="movie-card">
              <img
                class="movie-poster"
                src="${movie.Poster}"
                alt="${movie.Title}"
              />
              <div class="movie-info">
                <div
                  style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                  "
                >
                  <h2 class="movie-title">
                    ${movie.Title}
                    <span class="rating"
                      ><span class="star"
                        ><img src="./src/imgs/star.png" alt="star" /></span
                      >${movie.imdbRating}</span
                    >
                  </h2>
                  </div>
                  <div class="movie-details">
                    <div class="meta">
                        <span>${movie.Runtime}</span>
                        <span>${movie.Genre}</span>
                    </div>
                    <div class="watchlist">
                        <img src="./src/imgs/add.png" alt="add" />
                        <button class="watchlistBtn">Watchlist</button>
                    </div>
                  </div>
                <p class="description">
                 ${movie.Plot}
                </p>
              </div>
            </div>
      `;
    moviesContainer.innerHTML += markup;
  });
};

searchInput.addEventListener("input", (e) => {
  const query = e.target.value;
  if (query === "") {
    explore.classList.remove("hidden");
    moviesContainer.innerHTML = "";
    return;
  }
  searchMovies(query);
});

darkModeBtn.addEventListener("click", (e) => {
  e.preventDefault();
  document.body.classList.toggle("dark");
});

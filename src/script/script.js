"use strict";
const API_KEY = "bdf15a71";

const darkModeBtn = document.querySelector("#dark-mode-btn");
const togglePageBtn = document.querySelector("#toggle-page-btn");
const searchInput = document.querySelector("#movieInput");

const main = document.querySelector("main");
const explore = document.querySelector(".explore");
const searchMoviesContainer = document.querySelector(
  "#search-movies-container"
);
const watchlistMoviesContainer = document.querySelector(
  "#watchlist-movies-container"
);
const searchPage = document.querySelector(".searchPage");
const watchlistPage = document.querySelector(".watchlistPage");

const headerTitle = document.querySelector(".title");
const watchlistMessage = document.querySelector(".watchlist-msg");

let watchlistedArray = [];
let moviesData = [];

const searchMovies = async (query) => {
  try {
    const response = await fetch(
      `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(
        query
      )}`
    );
    const data = await response.json();
    if (data.Response === "False") throw new Error(data.Error);
    const movies = data.Search;
    const fullDetailsPrimises = movies.map((movie) =>
      fetch(
        `https://www.omdbapi.com/?apikey=${API_KEY}&i=${movie.imdbID}`
      ).then((res) => res.json())
    );
    const fullDetailesMovies = await Promise.all(fullDetailsPrimises);
    moviesData = [...fullDetailesMovies];
    renderMoviesCards(fullDetailesMovies, searchMoviesContainer, "search");
  } catch (e) {
    explore.classList.add("hidden");
    searchMoviesContainer.innerHTML =
      '<p id="message">Unable to find what you’re looking for. Please try another search.</p>';
  }
};

const renderMoviesCards = (moviesArray, container, mode = "search") => {
  explore.classList.add("hidden");
  container.innerHTML = "";
  moviesArray.forEach((movie) => {
    let watchlistMarkup;
    if (mode === "watchlist") {
      watchlistMarkup = `<img src="./src/imgs/remove.png" alt="remove" />
        <button class="remove-watchlist-btn" data-imdbid="${movie.imdbID}">Remove</button>`;
    } else {
      const isWatchlisted = watchlistedArray.some(
        (m) => m.imdbID === movie.imdbID
      );
      watchlistMarkup = isWatchlisted
        ? `<p>Watchlisted</p>`
        : `<img src="./src/imgs/add.png" alt="add" />
           <button class="add-watchlist-btn" data-imdbid="${movie.imdbID}">Watchlist</button>`;
    }

    const markup = `
          <div class="movie-card" data-imdbid="${movie.imdbID}">
              <img
                class="movie-poster"
                src="${movie.Poster}"
                alt="${movie.Title}"
              />
              <div class="movie-info">
                <div class="info">
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
                        ${watchlistMarkup}
                    </div>
                  </div>
                <p class="description">
                 ${movie.Plot}
                </p>
              </div>
            </div>
      `;
    container.innerHTML += markup;
  });
  const watchlistBtn = document.querySelectorAll(".watchlist");
  if (mode === "search") {
    watchlistBtn.forEach((btn, index) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        btn.innerHTML = `<p>Watchlisted</p>`;
        addWatchlist(moviesArray[index]);
      });
    });
  } else if (mode === "watchlist") {
    watchlistBtn.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const imdbID = e.target.closest(".movie-card");
        if (!imdbID) return;
        removeFromWatchlist(imdbID.dataset.imdbid);
        if (watchlistedArray.length === 0) {
          watchlistMessage.classList.remove("hidden");
          watchlistMoviesContainer.classList.add("hidden");
          renderMoviesCards(moviesData, searchMoviesContainer, "search");
        }
      });
    });
  }
};

const goToSearchPage = () => {
  watchlistPage.classList.add("hidden");
  searchPage.classList.remove("hidden");
  headerTitle.textContent = "Find your film";
  togglePageBtn.textContent = "My Watchlist";
  togglePageBtn.dataset.page = "watchlist";
  renderMoviesCards(moviesData, searchMoviesContainer, "search");
};

const goToWatchlistPage = () => {
  watchlistPage.classList.remove("hidden");
  searchPage.classList.add("hidden");
  headerTitle.textContent = "My Watchlist";
  togglePageBtn.textContent = "Search for movies";
  togglePageBtn.dataset.page = "search";
  if (watchlistedArray.length === 0) {
    watchlistMessage.classList.remove("hidden");
    watchlistMoviesContainer.classList.add("hidden");
  } else {
    watchlistMoviesContainer.classList.remove("hidden");
    watchlistMessage.classList.add("hidden");
    renderMoviesCards(watchlistedArray, watchlistMoviesContainer, "watchlist");
  }
};

const addWatchlist = (movie) => {
  if (!watchlistedArray.some((m) => m.imdbID === movie.imdbID))
    watchlistedArray.push(movie);
};

const removeFromWatchlist = (imdbID) => {
  watchlistedArray = watchlistedArray.filter(
    (movie) => movie.imdbID !== imdbID
  );
  renderMoviesCards(watchlistedArray, watchlistMoviesContainer, "watchlist");
};

searchInput.addEventListener("input", (e) => {
  const query = e.target.value;
  if (query === "") {
    explore.classList.remove("hidden");
    searchMoviesContainer.innerHTML = "";
    return;
  }
  searchMovies(query);
});

darkModeBtn.addEventListener("click", (e) => {
  e.preventDefault();
  document.body.classList.toggle("dark");
});

togglePageBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const currentPage = e.target.dataset.page;
  currentPage === "watchlist" ? goToWatchlistPage() : goToSearchPage();
});

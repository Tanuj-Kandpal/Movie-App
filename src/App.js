import { useEffect, useState } from "react";
import StarRating from "./StarRating";
import { useRef } from "react";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const key = "7c9c3801";
// const query = "SpiderMan";
export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isOpen1, setIsOpen1] = useState(true);
  const [isOpen2, setIsOpen2] = useState(true);
  const [IsLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [movieSelected, SetMovieSelected] = useState(null);
  const [WatchedStarRating, setWatchedStarRating] = useState("");

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setIsLoading(true);
          setErrorMsg("");

          const res = await fetch(
            `https://www.omdbapi.com/?apikey=${key}&s=${query}`,
            { signal: controller.signal }
          );
          if (!res.ok) {
            throw new Error("Something went wonrg");
          }
          const data = await res.json();
          if (data.Response === "False") {
            throw new Error("Movie Not found");
          }
          setMovies(data.Search);
        } catch (err) {
          setErrorMsg(err.message);
          setMovies([]);
        } finally {
          //it will execute everytime make it more dynamic
          setIsLoading(false);
        }
      }
      if (query.length < 3) {
        setMovies([]);
        setErrorMsg("");
        return;
      }
      fetchMovies();
      return function () {
        controller.abort();
      };
    },
    [query]
  );

  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  function Loader() {
    return <span className="loader">Loading...</span>;
  }

  function DisplayError({ err }) {
    return (
      <p className="error">
        <span>⛔</span>
        {err}
      </p>
    );
  }

  function handleDeleteMovie(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  function handleCloseMovie() {
    SetMovieSelected(null);
  }

  function MovieSelectDetails({ moiveId, onAddWatched }) {
    const [movieDetails, setMovieDetails] = useState([]);
    const [movieDetailsLoading, setMovieDetailsLoading] = useState(false);
    const [movieTitle, setMovieTitle] = useState("");

    function handleWatchedList() {
      onAddWatched(movieDetails);
    }

    useEffect(() => {
      async function fetchMovieDetails() {
        setMovieDetailsLoading(true);
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${key}&i=${moiveId}`
        );
        const data = await res.json();
        setMovieDetails(data);
        setMovieDetailsLoading(false);
        setMovieTitle(data.Title);
      }
      fetchMovieDetails();
    }, [moiveId]);

    //Following Hook helping in setting up the title for the tab as per the movie selected
    useEffect(
      function () {
        if (!movieTitle) {
          return;
        }
        document.title = `Moive: ${movieTitle}`;
        return function () {
          document.title = "Use Popcorn";
        };
      },
      [movieTitle]
    );

    return movieDetailsLoading ? (
      <Loader />
    ) : (
      <p className="details">
        <div className="movie-poster">
          <img
            src={`${movieDetails.Poster}`}
            alt={`Poster of ${movieDetails.Title} Movie`}
          />
        </div>
        <div className="details-overview">
          <h2>{movieDetails.Title}</h2>
          <p>
            {movieDetails.Released} &bull; {movieDetails.Runtime}
          </p>
          <p>{movieDetails.Language}</p>
          <p>
            <span>⭐</span>
            {movieDetails.imdbRating}
          </p>
        </div>
        <section>
          <StarRating
            maxRating={10}
            size={24}
            onSetRating={setWatchedStarRating}
          />
          {WatchedStarRating > 0 && (
            <button onClick={handleWatchedList} className="btn-add">
              Add to List
            </button>
          )}

          <p>
            <em>{movieDetails.Plot}</em>
          </p>
          <p>Starring {movieDetails.Actors}</p>
          <p>Directed by {movieDetails.Director}</p>
        </section>
      </p>
    );
  }

  function getMovieId(movieimdbId) {
    return SetMovieSelected((id) => (movieimdbId === id ? null : movieimdbId));
  }
  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
    handleCloseMovie();
  }

  const inpuEl = useRef(null);

  useEffect(function () {
    inpuEl.current.focus();
  }, []);

  return (
    <>
      <nav className="nav-bar">
        <div className="logo">
          <span role="img">🍿</span>
          <h1>MovieMate</h1>
        </div>
        <input
          className="search"
          type="text"
          placeholder="Search movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          ref={inpuEl}
        />
        <p className="num-results">
          Found <strong>{movies.length}</strong> results{" "}
          {/* Update this line */}
        </p>
      </nav>

      <main className="main">
        <div className="box">
          <button
            className="btn-toggle"
            onClick={() => setIsOpen1((open) => !open)}
          >
            {isOpen1 ? "–" : "+"}
          </button>
          {isOpen1 && (
            <ul className="list list-movies">
              {errorMsg && <DisplayError err={errorMsg} />}
              {IsLoading ? (
                <Loader />
              ) : (
                movies?.map((movie) => (
                  <li
                    onClick={() => getMovieId(movie.imdbID)}
                    key={movie.imdbID}
                  >
                    <img src={movie.Poster} alt={`${movie.Title} poster`} />
                    <h3>{movie.Title}</h3>
                    <div>
                      <p>
                        <span>🗓</span>
                        <span>{movie.Year}</span>
                      </p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        <div className="box">
          <button
            className="btn-toggle"
            onClick={() => setIsOpen2((open) => !open)}
          >
            {isOpen2 ? "–" : "+"}
          </button>
          <button className="btn-back" onClick={handleCloseMovie}>
            &larr;
          </button>
          {isOpen2 && (
            <>
              {movieSelected ? (
                <MovieSelectDetails
                  moiveId={movieSelected}
                  onAddWatched={handleAddWatched}
                  onCloseMovie={handleCloseMovie}
                />
              ) : (
                <>
                  <div className="summary">
                    <h2>Movies you watched</h2>
                    <div>
                      <p>
                        <span>#️⃣</span>
                        <span>{watched.length} movies</span>
                      </p>
                      <p>
                        <span>⭐️</span>
                        <span>{avgImdbRating}</span>
                      </p>
                      <p>
                        <span>🌟</span>
                        <span>{avgUserRating}</span>
                      </p>
                      <p>
                        <span>⏳</span>
                        <span>{avgRuntime} min</span>
                      </p>
                    </div>
                  </div>

                  <ul className="list">
                    {watched.map((movie) => (
                      <li key={movie.imdbID}>
                        <img src={movie.Poster} alt={`${movie.Title} poster`} />
                        <h3>{movie.Title}</h3>
                        <div>
                          <p>
                            <span>⭐️</span>
                            <span>{movie.imdbRating}</span>
                          </p>
                          <p>
                            <span>🌟</span>
                            <span>{WatchedStarRating}</span>
                          </p>
                          <p>
                            <span>⏳</span>
                            <span>{movie.runtime} min</span>
                          </p>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteMovie(movie.imdbID)}
                          >
                            ⚔️
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}

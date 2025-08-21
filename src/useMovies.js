import { useState, useEffect } from "react";

const KEY = "fce837d8";

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      const controller = new AbortController(); // for fetch cancellation
      const timeoutId = setTimeout(() => {
        async function fetchMovies() {
          try {
            setIsLoading(true);
            setError("");
            const res = await fetch(
              `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
              { signal: controller.signal } // ✅ this connects fetch to the controller
            );

            if (!res.ok) throw new Error("Something went wrong");

            const data = await res.json();
            if (data.Response === "False") throw new Error("No movie found !");
            setMovies(Array.isArray(data.Search) ? data.Search : []);
            setError("");
          } catch (err) {
            console.log(err.message);
            if (err.name !== "AbortError") {
              setError(err.message);
            }
          } finally {
            setIsLoading(false);
          }
        }

        if (!query.length) {
          setMovies([]);
          setError("");
          return;
        }

        // handleCloseMovie();
        fetchMovies();
      }, 500); // wait 500ms after user stops typing

      return () => {
        clearTimeout(timeoutId);
        controller.abort(); // cancel the previous fetch if still pending
      };
    },
    [query]
  );

  return { movies, isLoading, error };
}

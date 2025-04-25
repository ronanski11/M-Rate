"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, CircleX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SearchBar({
  onResultSelect,
  showFullButton = false,
  onSearchSubmit,
  classes,
  height = "py-6",
  width = "w-full",
  flex = "flex-1",
  small = false,
  autoFocus = false, // Add autoFocus prop with default value of false
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  // Apply autoFocus if enabled
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Function to fetch movies from OMDB API
  const fetchMovies = async (query) => {
    if (!query || query.trim() === "") {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?s=${encodeURIComponent(
          query
        )}&type=movie&apikey=${process.env.NEXT_PUBLIC_OMDB}`
      );
      const data = await response.json();

      if (data.Response === "True" && data.Search) {
        setSearchResults(data.Search);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearchInput = () => {
    setSearchQuery("");
    setSearchResults([]);
    // Don't hide results to maintain the same UI state
    // Instead, just show empty results

    // Focus back on the input field after clearing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle input change with debounce
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowResults(query.trim() !== "");

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      fetchMovies(query);
    }, 500);
  };

  // Handle form submission to navigate to search results page
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      if (onSearchSubmit) {
        onSearchSubmit(searchQuery);
      } else {
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
      setShowResults(false);
    }
  };

  // Handle movie selection
  const handleMovieSelect = (movie) => {
    if (onResultSelect) {
      onResultSelect(movie);
    }
    setShowResults(false);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative w-full ${classes}`} ref={searchContainerRef}>
      <form
        onSubmit={handleSearchSubmit}
        className={`${showFullButton ? "flex gap-2" : ""}`}
      >
        <div
          className={`relative items-center justify-center ${
            showFullButton ? flex : "w-full"
          }`}
        >
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground ${
              small ? "h-4 w-4" : ""
            }`}
          />
          <Input
            value={searchQuery}
            onChange={handleSearchChange}
            className={`px-11 text-lg rounded-lg ${height} ${width}`}
            placeholder="Search for a movie..."
            onFocus={() => setShowResults(searchQuery.trim() !== "")}
            ref={inputRef}
          />
          {searchQuery && (
            <CircleX
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground cursor-pointer ${
                small ? "h-4 w-4" : ""
              }`}
              onClick={(e) => {
                e.preventDefault(); // Prevent any form submission
                clearSearchInput();
              }}
            />
          )}
        </div>

        {showFullButton && (
          <Button type="submit" size="lg" className={`px-6 h-12`}>
            Search
          </Button>
        )}
      </form>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-lg shadow-lg bg-white dark:bg-zinc-800 z-20">
          {isLoading ? (
            <div className="p-4 text-center">Loading...</div>
          ) : searchResults.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {searchResults.map((movie) => (
                <Link
                  key={movie.imdbID}
                  href={`/movie/${movie.imdbID}`}
                  onClick={() => handleMovieSelect(movie)}
                >
                  <div className="p-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer border-b border-gray-100 dark:border-zinc-700 last:border-0">
                    {movie.Poster && movie.Poster !== "N/A" ? (
                      <img
                        src={movie.Poster}
                        alt={""}
                        className="object-cover w-10 h-14"
                      />
                    ) : (
                      <div className="w-10 h-14 flex items-center justify-center bg-gray-100 dark:bg-gray-700"></div>
                    )}
                    <div className="flex-1 text-left">
                      <h3 className="font-medium">{movie.Title}</h3>
                      <p className="text-sm">{movie.Year}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="p-4 text-center">No results found</div>
          ) : null}
        </div>
      )}
    </div>
  );
}

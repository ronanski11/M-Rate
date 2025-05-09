"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Film, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/searchbar";
import MovieCard from "@/components/movie-card";
import { motion } from "framer-motion";

// Create a client component that uses search params
function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Fetch movie results when query changes
  useEffect(() => {
    const fetchMovies = async () => {
      if (!query || query.trim() === "") {
        setMovies([]);
        setError("Please enter a search term");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://www.omdbapi.com/?s=${encodeURIComponent(
            query
          )}&type=movie&apikey=${process.env.NEXT_PUBLIC_OMDB}`
        );

        if (!response.ok) {
          throw new Error(`Network response was not OK: ${response.status}`);
        }

        const data = await response.json();

        if (data.Response === "True" && data.Search) {
          setMovies(data.Search);
        } else {
          setError(data.Error || "No results found");
          setMovies([]);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
        setError("Failed to fetch results. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [query]);

  // Handle scroll for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      // Show button when page is scrolled down 300px
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Function to scroll back to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Handle search submission
  const handleSearchSubmit = (queryText) => {
    router.push(`/search?q=${encodeURIComponent(queryText)}`);
  };

  return (
    <>
      {/* Search Header */}
      <div className="mb-8">
        <SearchBar
          showFullButton
          onSearchSubmit={handleSearchSubmit}
          autoFocus
        />
      </div>

      {/* Search Results */}
      <div>
        <h1 className="text-2xl font-bold mb-6">
          {query ? `Search results for "${query}"` : "Search Results"}
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <Film className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-medium mb-2">
              {error === "Movie not found!" ? "No movies found" : error}
            </h3>
            <p className="text-muted-foreground mb-8">
              Try searching with different keywords
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {movies.map((movie, index) => (
              <motion.div
                key={movie.imdbID}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <MovieCard
                  key={movie.imdbID}
                  movie={movie}
                  fetchWatchlistStatus
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          variant="secondary"
          className="fixed bottom-6 right-6 shadow-lg rounded-full h-12 w-12 z-50"
          aria-label="Back to top"
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
      )}
    </>
  );
}

// Loading fallback for the Suspense boundary
function SearchPageLoading() {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

// Main SearchPage component
export default function SearchPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <Suspense fallback={<SearchPageLoading />}>
        <SearchResults />
      </Suspense>
    </div>
  );
}

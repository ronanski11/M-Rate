"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Star, BookmarkIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef(null);
  const timeoutRef = useRef(null);

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
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container px-4 py-8 flex flex-col items-center">
        <section className="w-full max-w-3xl mx-auto text-center mb-12 mt-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Rate Movies with Friends
          </h1>
          <p className="text-lg mb-8">
            Search, rate, and keep track of movies you've watched
          </p>

          {/* Search container with proper z-index and positioning */}
          <div className="relative w-full z-10" ref={searchContainerRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 py-6 text-lg rounded-lg"
                placeholder="Search for a movie..."
                onFocus={() => setShowResults(searchQuery.trim() !== "")}
              />
            </div>

            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-lg shadow-lg bg-white dark:bg-zinc-800 z-20">
                {isLoading ? (
                  <div className="p-4 text-center">Loading...</div>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {searchResults.map((movie) => (
                      <Link key={movie.imdbID} href={`/movie/${movie.imdbID}`}>
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
                          <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4" />
                          </Button>
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
        </section>

        {/* Tabs Section */}
        <section className="w-full max-w-6xl mx-auto">
          <Tabs defaultValue="watchlist" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-lg p-1">
              <TabsTrigger
                value="watchlist"
                className="data-[state=active]:bg-transparent"
              >
                Watchlist
              </TabsTrigger>
              <TabsTrigger
                value="rated"
                className="data-[state=active]:bg-transparent"
              >
                Rated
              </TabsTrigger>
            </TabsList>

            <TabsContent value="watchlist" className="mt-6">
              <div className="text-center py-12">
                <BookmarkIcon className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  Your watchlist is empty
                </h3>
                <p className="mb-6">
                  Search for movies and add them to your watchlist
                </p>
                <Button>Discover Movies</Button>
              </div>
            </TabsContent>

            <TabsContent value="rated" className="mt-6">
              <div className="text-center py-12">
                <Star className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  You haven't rated any movies yet
                </h3>
                <p className="mb-6">
                  Rate movies to keep track of what you've watched
                </p>
                <Button>Discover Movies</Button>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Star, BookmarkIcon, ArrowRight, Loader2 } from "lucide-react";
import SearchBar from "@/components/searchbar";
import MovieCard from "@/components/movie-card";
import axios from "@/app/axiosInstance";
import Link from "next/link";
import Loading from "@/components/loading";
import { motion } from "framer-motion";

export default function Home() {
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's watchlist when component mounts
  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/watchlist");

        if (response.data) {
          // Convert watchlist HashMap to array of objects with movie ID and entry data
          const watchlistArray = Object.entries(response.data).map(
            ([imdbId, entry]) => ({
              imdbId,
              ...entry,
            })
          );

          // Sort by date added (newest first)
          watchlistArray.sort(
            (a, b) => new Date(b.addedDate) - new Date(a.addedDate)
          );

          // Limit to 6 entries
          const limitedWatchlist = watchlistArray.slice(0, 12);

          // Fetch movie details for each watchlist item
          const movieDetailsPromises = limitedWatchlist.map(async (item) => {
            try {
              const movieResponse = await fetch(
                `https://www.omdbapi.com/?i=${item.imdbId}&apikey=${process.env.NEXT_PUBLIC_OMDB}`
              );
              const movieData = await movieResponse.json();

              if (movieData.Response === "True") {
                return {
                  ...movieData,
                  watchlistData: item,
                };
              }
              return null;
            } catch (err) {
              console.error(`Error fetching movie ${item.imdbId}:`, err);
              return null;
            }
          });

          const movieDetails = await Promise.all(movieDetailsPromises);
          setWatchlistMovies(movieDetails.filter((movie) => movie !== null));
        }
      } catch (err) {
        console.error("Error fetching watchlist:", err);
        setError("Failed to load your watchlist");
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, []);

  // Render watchlist content based on loading/error/data state
  const renderWatchlistContent = () => {
    if (loading) {
      return <Loading message={"watchlist"} />;
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      );
    }

    if (watchlistMovies.length === 0) {
      return (
        <div className="text-center py-12">
          <BookmarkIcon className="h-16 w-16 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Your watchlist is empty</h3>
          <p className="mb-6">
            Search for movies and add them to your watchlist
          </p>
          <Link href="/search">
            <Button>Discover Movies</Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {watchlistMovies.map((movie, index) => (
            <motion.div
              key={movie.imdbID}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <MovieCard key={movie.imdbID} movie={movie} />
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-6 w-full">
          <Link href="/watchlist" className="w-full">
            <Button variant="" className="flex items-center w-full">
              View Full Watchlist
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  };

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

          {/* Search Bar Component */}
          <SearchBar />
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
              {renderWatchlistContent()}
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
                <Link href="/search">
                  <Button>Discover Movies</Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
}

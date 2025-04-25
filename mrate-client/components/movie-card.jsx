"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Film, Bookmark, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "@/app/axiosInstance";
import { Badge } from "./ui/badge";

export default function MovieCard({
  movie,
  onWatchlist: initialWatchlistStatus = false,
  fetchWatchlistStatus = false,
}) {
  const [onWatchlist, setOnWatchlist] = useState(initialWatchlistStatus);
  const [error, setError] = useState(null);

  // Fetch watchlist status if fetchWatchlistStatus is true
  useEffect(() => {
    if (!fetchWatchlistStatus || !movie.imdbID) return;

    const fetchIsOnWatchlist = async () => {
      try {
        const response = await axios.get(
          `/watchlist/isPresent?imdbId=${movie.imdbID}`
        );
        setOnWatchlist(response.data);
      } catch (err) {
        console.error("Could not check watchlist status:", err);
        setError("Could not determine if movie is on watchlist.");
      }
    };

    fetchIsOnWatchlist();
  }, [movie.imdbID, fetchWatchlistStatus]);

  // Toggle watchlist status
  const changeWatchlistStatus = async (e) => {
    e.preventDefault(); // Prevent navigation when clicking the bookmark button

    if (!movie.imdbID) return;

    try {
      await axios.post(`/watchlist/${movie.imdbID}`);
      setOnWatchlist(!onWatchlist);
    } catch (err) {
      console.error("Could not update watchlist:", err);
      setError("Could not update watchlist status.");
    }
  };

  // Function to determine color class based on rating
  function getRatingColorClass(rating) {
    // Convert rating to number if it's a string
    const numRating = typeof rating === "string" ? parseFloat(rating) : rating;

    // Handle invalid ratings
    if (isNaN(numRating) || numRating < 1 || numRating > 10) {
      return "bg-gray-500"; // Default color for invalid ratings
    }

    // Create a specific color for each rating number (1-7)
    // After 7, create more granular colors for every 0.5 increment

    if (numRating < 6) {
      return "bg-red-500 text-white"; // All ratings below 6 are red
    } else if (numRating < 7.5) {
      return "bg-yellow-400 text-black"; // Ratings 6 to 7.4 are yellow
    } else if (numRating < 8) {
      return "bg-green-300 text-black"; // Ratings 7.5 to 7.9
    } else if (numRating < 8.5) {
      return "bg-green-400 text-black"; // Ratings 8.0 to 8.4
    } else if (numRating < 9) {
      return "bg-green-500 text-white"; // Ratings 8.5 to 8.9
    } else if (numRating < 9.5) {
      return "bg-green-600 text-white"; // Ratings 9.0 to 9.4
    } else {
      return "bg-green-700 text-white"; // Ratings 9.5 and above
    }
  }

  return (
    <Link href={`/movie/${movie.imdbID}`} className="group">
      <Card className="overflow-hidden h-full transition-all hover:shadow-md p-0 gap-0">
        <div className="aspect-[2/3] relative bg-muted">
          {movie.Poster && movie.Poster !== "N/A" ? (
            <Image
              src={movie.Poster}
              alt={movie.Title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Film className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          {/* Bookmark/Watchlist Button */}
          <Button
            size="icon"
            variant={onWatchlist ? "default" : "secondary"}
            className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-90 shadow-md"
            onClick={changeWatchlistStatus}
            aria-label={
              onWatchlist ? "Remove from watchlist" : "Add to watchlist"
            }
          >
            {onWatchlist ? (
              <Check className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
          {movie.imdbRating && (
            <Badge
              className={`absolute top-2 left-2 ${getRatingColorClass(
                movie.imdbRating
              )}`}
            >
              {movie.imdbRating}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
            {movie.Title}
          </h3>
          <div className="flex items-center flex-wrap gap-1 mt-1">
            <p className="text-sm text-muted-foreground">{movie.Year}</p>
            {movie.Runtime && movie.Runtime !== "N/A" && (
              <span className="text-sm text-muted-foreground">
                • {movie.Runtime}
              </span>
            )}
          </div>
          {movie.Director && movie.Director !== "N/A" && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {movie.Director}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

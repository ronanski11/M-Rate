"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  Star,
  Clock,
  Calendar,
  Film,
  Award,
  Users,
  Bookmark,
  Check,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axios from "@/app/axiosInstance";
import Loading from "@/components/loading";

// Main component
export default function MoviePage() {
  const params = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [onWatchlist, setOnWatchlist] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      if (!params.id) {
        setError("No movie ID provided");
        setLoading(false);
        return;
      }

      try {
        // Direct API call from client component
        const apiKey = process.env.NEXT_PUBLIC_OMDB;

        if (!apiKey) {
          setError("API key is not configured");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `https://www.omdbapi.com/?i=${params.id}&apikey=${apiKey}&plot=full`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch movie: ${response.status}`);
        }

        const data = await response.json();

        if (data.Response === "False") {
          setError(data.Error || "Movie not found");
          setLoading(false);
          return;
        }

        setMovie(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching movie:", err);
        setError(err.message || "Failed to fetch movie data");
        setLoading(false);
      }
    };

    const fetchIsOnWatchlist = async () => {
      if (!params.id) {
        setError("No movie ID provided");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          `/watchlist/isPresent?imdbId=${params.id}`
        );
        setOnWatchlist(response.data);
      } catch (err) {
        setError("Could not determine if movie is on watchlist.");
      }
    };

    fetchMovie();
    fetchIsOnWatchlist();
  }, [params.id]);

  const changeWatchlistStatus = async () => {
    if (!params.id) {
      setError("No movie ID provided");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post(`/watchlist/${params.id}`);
      setOnWatchlist(!onWatchlist);
    } catch (err) {
      setError("Could not determine if movie is on watchlist.");
    }
  };

  // Handle UI loading state
  if (loading) {
    return <Loading message={"movie details"} />;
  }

  // Handle error state
  if (error) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="bg-destructive/10 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Handle movie not found
  if (!movie) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="bg-muted rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Movie Not Found</h2>
          <p className="text-muted-foreground">
            The requested movie could not be found
          </p>
        </div>
      </div>
    );
  }

  // Format ratings for display
  const ratings = movie.Ratings || [];

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Movie Poster (Always visible) */}
        <div className="md:col-span-1">
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg shadow-lg">
            {movie.Poster && movie.Poster !== "N/A" ? (
              <Image
                src={movie.Poster || "/placeholder.svg"}
                alt={`${movie.Title} poster`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Film className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Right Side Content - Either Movie Details or Rating UI */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{movie.Title}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {movie.Year && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-1 h-4 w-4" />
                  {movie.Year}
                </div>
              )}
              {movie.Runtime && movie.Runtime !== "N/A" && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  {movie.Runtime}
                </div>
              )}
              {movie.Rated && movie.Rated !== "N/A" && (
                <Badge variant="secondary">{movie.Rated}</Badge>
              )}
            </div>
          </div>
          {/* Genres */}
          {movie.Genre && movie.Genre !== "N/A" && (
            <div className="flex flex-wrap gap-2">
              {movie.Genre.split(", ").map((genre) => (
                <Badge key={genre} variant="outline">
                  {genre}
                </Badge>
              ))}
            </div>
          )}

          <Button
            className="w-full"
            onClick={() => changeWatchlistStatus()}
            variant={onWatchlist ? "outline" : "default"}
          >
            {onWatchlist ? (
              <>
                <Check /> On watchlist{" "}
              </>
            ) : (
              <>
                <Bookmark /> Add to watchlist
              </>
            )}
          </Button>

          {/* Plot */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Plot</h2>
            <p className="text-muted-foreground">{movie.Plot}</p>
          </div>
          {/* Cast & Crew */}
          <div className="space-y-4">
            {movie.Director && movie.Director !== "N/A" && (
              <div>
                <h3 className="text-lg font-semibold">Director</h3>
                <p className="text-muted-foreground">{movie.Director}</p>
              </div>
            )}

            {movie.Writer && movie.Writer !== "N/A" && (
              <div>
                <h3 className="text-lg font-semibold">Writer</h3>
                <p className="text-muted-foreground">{movie.Writer}</p>
              </div>
            )}

            {movie.Actors && movie.Actors !== "N/A" && (
              <div>
                <h3 className="text-lg font-semibold flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Cast
                </h3>
                <p className="text-muted-foreground">{movie.Actors}</p>
              </div>
            )}
          </div>
          {/* Additional Info */}
          {movie.Awards && movie.Awards !== "N/A" && (
            <div>
              <h3 className="text-lg font-semibold flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Awards
              </h3>
              <p className="text-muted-foreground">{movie.Awards}</p>
            </div>
          )}
          {/* Movie Ratings Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Star className="mr-2 h-5 w-5" style={{ color: "#f5c518" }} />
              Ratings
            </h3>
            <Card>
              <CardContent>
                <div className="space-y-2">
                  {movie.imdbRating && movie.imdbRating !== "N/A" && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">IMDb Rating</span>
                      <Badge variant="outline">{movie.imdbRating}/10</Badge>
                    </div>
                  )}
                  {ratings.length > 0 ? (
                    ratings
                      .filter(
                        (rating) => rating.Source !== "Internet Movie Database"
                      )
                      .map((rating, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <span className="text-sm">{rating.Source}</span>
                          <Badge variant="outline">{rating.Value}</Badge>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No ratings available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

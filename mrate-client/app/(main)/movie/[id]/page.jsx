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
import { motion } from "framer-motion";
import RatingDialog from "@/components/rating-dialog";
import { fetchMovieById } from "@/lib/omdb-service"; // Import our new service

// Main component
export default function MoviePage() {
  const params = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [onWatchlist, setOnWatchlist] = useState(false);
  const [rating, setRating] = useState();
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      if (!params.id) {
        setError("No movie ID provided");
        setLoading(false);
        return;
      }

      try {
        // Use our caching service instead of direct API call
        const data = await fetchMovieById(params.id);
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

    const fetchRating = async () => {
      if (!params.id) {
        setError("No movie ID provided");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`/rating?imdbId=${params.id}`);
        if (response.data !== "") setRating(response.data);
      } catch (err) {
        setError("Could not determine if movie is rated.");
      }
    };

    fetchMovie();
    fetchRating();
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
      setError("Could not update watchlist status.");
    }
  };

  // Rating submission handler
  const handleRatingSubmit = (newRating) => {
    setRating(newRating);
    setRatingDialogOpen(false);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
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

  // Function to render stars based on rating
  const renderRatingStars = (rating) => {
    const starCount = 5;
    const filledStars = Math.round(rating / 2); // Convert to 5-star scale

    return (
      <div className="flex items-center">
        {[...Array(starCount)].map((_, index) => (
          <Star
            key={index}
            className={`h-5 w-5 ${
              index < filledStars
                ? "text-yellow-500 fill-yellow-500"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating}/10</span>
      </div>
    );
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container max-w-4xl mx-auto px-4 py-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Movie Poster with animation */}
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg shadow-lg">
          {movie.Poster && movie.Poster !== "N/A" ? (
            <Image
              src={movie.Poster || "/placeholder.svg"}
              alt={`${movie.Title} poster`}
              fill
              className="object-cover transition-opacity opacity-0 duration-[1s]"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority
              onLoadingComplete={(image) => image.classList.remove("opacity-0")}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Film className="h-24 w-24 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Right Side Content with staggered animations */}
        <div className="md:col-span-2 space-y-6">
          <motion.div variants={itemVariants}>
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
          </motion.div>

          {/* Genres */}
          {movie.Genre && movie.Genre !== "N/A" && (
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-2"
            >
              {movie.Genre.split(", ").map((genre) => (
                <Badge key={genre} variant="outline">
                  {genre}
                </Badge>
              ))}
            </motion.div>
          )}

          {/* User Rating Display & Actions */}
          <motion.div variants={itemVariants}>
            <div className="flex gap-3 flex-col">
              {rating ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-black/5 dark:bg-white/5 p-4 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Your Rating
                    </h3>
                    {renderRatingStars(rating.rating)}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setRatingDialogOpen(true)}
                  >
                    Edit
                  </Button>
                </motion.div>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => setRatingDialogOpen(true)}
                >
                  <Star className="mr-2 h-4 w-4" />
                  Rate this movie
                </Button>
              )}
              <Button
                className="w-full"
                onClick={() => changeWatchlistStatus()}
                variant={onWatchlist ? "outline" : "secondary"}
              >
                {onWatchlist ? (
                  <>
                    <Check className="mr-2 h-4 w-4" /> On watchlist
                  </>
                ) : (
                  <>
                    <Bookmark className="mr-2 h-4 w-4" /> Add to watchlist
                  </>
                )}
              </Button>
            </div>
          </motion.div>

          {/* Plot */}
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-semibold mb-2">Plot</h2>
            <p className="text-muted-foreground">{movie.Plot}</p>
          </motion.div>

          {/* Cast & Crew */}
          <motion.div variants={itemVariants} className="space-y-4">
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
          </motion.div>

          {/* Additional Info */}
          {movie.Awards && movie.Awards !== "N/A" && (
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Awards
              </h3>
              <p className="text-muted-foreground">{movie.Awards}</p>
            </motion.div>
          )}

          {/* Movie Ratings Section */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Star className="mr-2 h-5 w-5" style={{ color: "#f5c518" }} />
              Ratings
            </h3>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <Card>
                <CardContent className="pt-6">
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
                          (rating) =>
                            rating.Source !== "Internet Movie Database"
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
            </motion.div>
          </motion.div>
        </div>
      </div>
      <RatingDialog
        isOpen={ratingDialogOpen}
        onClose={() => setRatingDialogOpen(false)}
        movie={movie}
        onRatingSubmit={handleRatingSubmit}
      />
    </motion.div>
  );
}

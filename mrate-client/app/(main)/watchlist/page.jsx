"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Filter,
  Search,
  Clock,
  Check,
  Film,
  ArrowUp,
  SlidersHorizontal,
  X,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Star,
  Trash,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import axios from "@/app/axiosInstance";
import Image from "next/image";
import Link from "next/link";
import RatingDialog from "@/components/rating-dialog";
import { motion } from "framer-motion";

export default function WatchlistPage() {
  // State for watchlist data and UI control
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // State for filtering and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("dateAdded");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterWatched, setFilterWatched] = useState("all"); // all, watched, unwatched
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  // Fetch user's watchlist when component mounts
  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/watchlist/full");

        if (response.data && response.data.movies) {
          // Convert watchlist HashMap to array of objects with movie ID and entry data
          const watchlistArray = Object.entries(response.data.movies).map(
            ([imdbId, entry]) => ({
              imdbId,
              ...entry,
            })
          );

          // Fetch movie details for each watchlist item
          const movieDetailsPromises = watchlistArray.map(async (item) => {
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
          setWatchlist(movieDetails.filter((movie) => movie !== null));
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

  // Handle scroll for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
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

  // Apply filters and sorting to the watchlist
  const filteredAndSortedWatchlist = useMemo(() => {
    // First, filter the watchlist
    let result = [...watchlist];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (movie) =>
          movie.Title.toLowerCase().includes(query) ||
          (movie.Director && movie.Director.toLowerCase().includes(query)) ||
          (movie.Actors && movie.Actors.toLowerCase().includes(query))
      );
    }

    // Filter by watched status
    if (filterWatched === "watched") {
      result = result.filter((movie) => movie.watchlistData.watched);
    } else if (filterWatched === "unwatched") {
      result = result.filter((movie) => !movie.watchlistData.watched);
    }

    // Then, sort the filtered watchlist
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "dateAdded":
          comparison =
            new Date(a.watchlistData.addedDate) -
            new Date(b.watchlistData.addedDate);
          break;
        case "title":
          comparison = a.Title.localeCompare(b.Title);
          break;
        case "year":
          comparison = a.Year - b.Year;
          break;
        default:
          comparison = 0;
      }

      // Apply sort order
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [watchlist, searchQuery, sortBy, sortOrder, filterWatched]);

  const toggleWatched = async (movie) => {
    try {
      // If marking as watched, open the rating dialog
      if (!movie.watchlistData.watched) {
        setSelectedMovie(movie);
        setRatingDialogOpen(true);
        return; // Return early, the actual watched status update will happen after rating
      }

      // If marking as unwatched, proceed as before
      // Optimistic update
      setWatchlist((prev) =>
        prev.map((m) => {
          if (m.imdbID === movie.imdbID) {
            return {
              ...m,
              watchlistData: {
                ...m.watchlistData,
                watched: !m.watchlistData.watched,
              },
            };
          }
          return m;
        })
      );
    } catch (err) {
      console.error("Error updating watched status:", err);
      // Revert on error
      setWatchlist((prev) =>
        prev.map((m) => {
          if (m.imdbID === movie.imdbID) {
            return {
              ...m,
              watchlistData: {
                ...m.watchlistData,
                watched: movie.watchlistData.watched,
              },
            };
          }
          return m;
        })
      );
    }
  };

  // 4. Add this new function to handle rating submission
  const handleRatingSubmit = async (rating) => {
    if (!selectedMovie) return;

    try {
      // Optimistic update
      setWatchlist((prev) =>
        prev.map((m) => {
          if (m.imdbID === selectedMovie.imdbID) {
            return {
              ...m,
              watchlistData: {
                ...m.watchlistData,
                watched: true, // Mark as watched
              },
            };
          }
          return m;
        })
      );
    } catch (err) {
      console.error("Error updating watched status after rating:", err);
      // Error handling as needed
    }
  };

  // Function to remove from watchlist
  const removeFromWatchlist = async (movie) => {
    try {
      // Optimistic update
      setWatchlist((prev) => prev.filter((m) => m.imdbID !== movie.imdbID));

      // Call API to update
      await axios.post(`/watchlist/${movie.imdbID}`);
    } catch (err) {
      console.error("Error removing from watchlist:", err);
      window.location.reload();
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Render list view item
  const WatchlistListItem = ({ movie }) => (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border-b last:border-b-0">
      <Link
        href={`/movie/${movie.imdbID}`}
        className="sm:flex-shrink-0 w-24 h-36 sm:w-20 sm:h-28 mx-auto sm:mx-0"
      >
        <div className="w-full h-full relative rounded-md overflow-hidden">
          {movie.Poster && movie.Poster !== "N/A" ? (
            <Image
              src={movie.Poster}
              alt={movie.Title}
              fill
              sizes="(max-width: 640px) 96px, 80px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Film className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>
      </Link>

      <div className="flex-grow">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div>
            <Link
              href={`/movie/${movie.imdbID}`}
              className="hover:text-primary"
            >
              <h3 className="font-medium text-lg">{movie.Title}</h3>
            </Link>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>{movie.Year}</span>
              {movie.Runtime && movie.Runtime !== "N/A" && (
                <>
                  <span className="mx-1">•</span>
                  <span>{movie.Runtime}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-1 sm:mt-0">
            {movie.watchlistData.watched ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Check className="h-3 w-3" /> Watched
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> Unwatched
              </Badge>
            )}
            <Badge variant="outline" className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {formatDate(movie.watchlistData.addedDate)}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-3">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2 text-destructive hover:bg-destructive/10"
              onClick={() => removeFromWatchlist(movie)}
            >
              {movie.watchlistData.watched ? (
                <>
                  <Trash className="h-4 w-4 mr-1" /> Remove
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-1" /> Remove
                </>
              )}
            </Button>
            {!movie.watchlistData.watched && (
              <Button
                size="sm"
                variant={movie.watchlistData.watched ? "default" : "outline"}
                className="h-8 px-2"
                onClick={() => toggleWatched(movie)}
              >
                <Star className="h-4 w-4 mr-1" /> Rate
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render watchlist content based on loading/error/data state
  const renderWatchlistContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-3">Loading your watchlist...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-16">
          <Film className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-medium mb-2">Failed to load watchlist</h3>
          <p className="text-muted-foreground mb-8">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      );
    }

    if (watchlist.length === 0) {
      return (
        <div className="text-center py-16">
          <Film className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-medium mb-2">Your watchlist is empty</h3>
          <p className="text-muted-foreground mb-8">
            Add movies to your watchlist to keep track of what you want to watch
          </p>
          <Link href="/search">
            <Button>Discover Movies</Button>
          </Link>
        </div>
      );
    }

    if (filteredAndSortedWatchlist.length === 0) {
      return (
        <div className="text-center py-16">
          <Filter className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-medium mb-2">
            No movies match your filters
          </h3>
          <p className="text-muted-foreground mb-8">
            Try adjusting your filters or search query
          </p>
          <Button
            onClick={() => {
              setSearchQuery("");
              setFilterWatched("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      );
    }

    return (
      <>
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredAndSortedWatchlist.length} of {watchlist.length}{" "}
          movies
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredAndSortedWatchlist.map((movie, index) => (
                <motion.div
                  key={movie.imdbID}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <WatchlistListItem movie={movie} />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </>
    );
  };

  // Stats about the watchlist
  const watchlistStats = useMemo(() => {
    if (!watchlist.length) return null;

    const watchedCount = watchlist.filter(
      (m) => m.watchlistData.watched
    ).length;

    return {
      total: watchlist.length,
      watched: watchedCount,
      unwatched: watchlist.length - watchedCount,
      watchedPercentage: Math.round((watchedCount / watchlist.length) * 100),
    };
  }, [watchlist]);

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your Watchlist</h1>
          {watchlistStats && (
            <p className="text-muted-foreground mt-1">
              {watchlistStats.total} movies • {watchlistStats.watchedPercentage}
              % watched
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your watchlist"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="flex gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="default" className="flex gap-2 w-full">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="">Filters & Sort</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[300px] sm:w-[400px] gap-0 md:mt-0 mt-14">
                <SheetHeader>
                  <SheetTitle>Filters & Sorting</SheetTitle>
                </SheetHeader>

                <div className="py-2 px-4 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Filters</h3>

                    <div className="space-y-2">
                      <Label>Watch Status</Label>
                      <Select
                        value={filterWatched}
                        onValueChange={setFilterWatched}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All movies" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All movies</SelectItem>
                          <SelectItem value="watched">Watched</SelectItem>
                          <SelectItem value="unwatched">Unwatched</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Sorting</h3>

                    <div className="space-y-2">
                      <Label>Sort By</Label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue placeholder="Date Added" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dateAdded">Date Added</SelectItem>
                          <SelectItem value="title">Title</SelectItem>
                          <SelectItem value="year">Release Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Order</Label>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant={sortOrder === "asc" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSortOrder("asc")}
                          className="flex gap-1"
                        >
                          <ChevronUp className="h-4 w-4" />
                          Ascending
                        </Button>
                        <Button
                          variant={sortOrder === "desc" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSortOrder("desc")}
                          className="flex gap-1"
                        >
                          <ChevronDown className="h-4 w-4" />
                          Descending
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <SheetFooter className="mb-14">
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setFilterWatched("all");
                      setSortBy("dateAdded");
                      setSortOrder("desc");
                    }}
                    variant="outline"
                  >
                    Reset All
                  </Button>
                  <SheetClose asChild>
                    <Button>Close</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {watchlistStats && (
        <div className="mb-6">
          <Tabs
            defaultValue="unwatched"
            className="w-full"
            onValueChange={(value) => {
              // Handle tab change by updating the filter state
              if (value === "all") setFilterWatched("all");
              else if (value === "unwatched") setFilterWatched("unwatched");
              else if (value === "watched") setFilterWatched("watched");
            }}
          >
            <TabsList className="mx-auto max-w-md grid w-full grid-cols-3">
              <TabsTrigger value="all">
                All ({watchlistStats.total})
              </TabsTrigger>
              <TabsTrigger value="unwatched">
                To Watch ({watchlistStats.unwatched})
              </TabsTrigger>
              <TabsTrigger value="watched">
                Watched ({watchlistStats.watched})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              {renderWatchlistContent()}
            </TabsContent>
            <TabsContent value="unwatched" className="mt-6">
              {/* We'll filter the content within the rendering function instead */}
              {(() => {
                const originalFilter = filterWatched;
                // Temporarily show only unwatched content
                const filteredContent = filteredAndSortedWatchlist.filter(
                  (movie) => !movie.watchlistData.watched
                );

                if (filteredContent.length === 0) {
                  return (
                    <div className="text-center py-16">
                      <Filter className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-medium mb-2">
                        No unwatched movies found
                      </h3>
                      <p className="text-muted-foreground mb-8">
                        All movies in your filtered list have been watched
                      </p>
                    </div>
                  );
                }

                return (
                  <>
                    <div className="mb-4 text-sm text-muted-foreground">
                      Showing {filteredContent.length} unwatched movies
                    </div>

                    <Card>
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {filteredContent.map((movie, index) => (
                            <motion.div
                              key={movie.imdbID}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                              <WatchlistListItem movie={movie} />
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                );
              })()}
            </TabsContent>
            <TabsContent value="watched" className="mt-6">
              {/* We'll filter the content within the rendering function instead */}
              {(() => {
                // Temporarily show only watched content
                const filteredContent = filteredAndSortedWatchlist.filter(
                  (movie) => movie.watchlistData.watched
                );

                if (filteredContent.length === 0) {
                  return (
                    <div className="text-center py-16">
                      <Filter className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-medium mb-2">
                        No watched movies found
                      </h3>
                      <p className="text-muted-foreground mb-8">
                        You haven't marked any movies as watched yet
                      </p>
                    </div>
                  );
                }

                return (
                  <>
                    <div className="mb-4 text-sm text-muted-foreground">
                      Showing {filteredContent.length} watched movies
                    </div>

                    <Card>
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {filteredContent.map((movie, index) => (
                            <motion.div
                              key={movie.imdbID}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                              <WatchlistListItem movie={movie} />
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                );
              })()}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {!watchlistStats && renderWatchlistContent()}

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
      <RatingDialog
        isOpen={ratingDialogOpen}
        onClose={() => setRatingDialogOpen(false)}
        movie={selectedMovie}
        onRatingSubmit={handleRatingSubmit}
      />
    </div>
  );
}

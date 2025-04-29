"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Plus,
  ArrowLeft,
  UserPlus,
  Settings,
  Search,
  Film,
  Loader2,
  SlidersHorizontal,
  ListFilter,
  CheckCheck,
  AlertCircle,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
import { toast } from "sonner";
import Loading from "@/components/loading";
import RatingDialog from "@/components/rating-dialog";
import SharedWatchlistMovieCard from "@/components/shared-watchlist-movie-card";
import { motion } from "framer-motion";
import { fetchMovieById } from "@/lib/omdb-service";

export default function SharedWatchlistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const watchlistId = params.id;

  const [watchlist, setWatchlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [members, setMembers] = useState([]);
  const [movies, setMovies] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  // UI State
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("dateAdded");
  const [sortOrder, setSortOrder] = useState("desc");

  // Dialog States
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [newMemberUsername, setNewMemberUsername] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [movieSearchDialogOpen, setMovieSearchDialogOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    fetchWatchlistDetails();
    fetchCurrentUser();
  }, [watchlistId]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get("/users/me");
      setCurrentUserId(response.data.id);
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  };

  const fetchWatchlistDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/shared-watchlist/${watchlistId}`);
      setWatchlist(response.data);

      // Fetch member details
      if (response.data.userIds && response.data.userIds.length > 0) {
        const memberPromises = response.data.userIds.map((userId) =>
          axios
            .get(`/users/${userId}`)
            .then((res) => res.data)
            .catch(() => ({ id: userId, username: "Unknown User" }))
        );

        const memberData = await Promise.all(memberPromises);
        setMembers(memberData);
      }

      // Process movies
      if (response.data.movies) {
        const movieEntries = Object.entries(response.data.movies);
        if (movieEntries.length > 0) {
          const movieDetailsPromises = movieEntries.map(
            async ([imdbId, movieData]) => {
              try {
                const movieDetails = await fetchMovieById(imdbId);
                if (movieDetails.Response === "True") {
                  return {
                    ...movieDetails,
                    imdbID: imdbId,
                    watchlistData: movieData,
                  };
                }
                return null;
              } catch (err) {
                console.error(`Error fetching movie ${imdbId}:`, err);
                return null;
              }
            }
          );

          const fetchedMovies = await Promise.all(movieDetailsPromises);
          setMovies(fetchedMovies.filter((movie) => movie !== null));
        }
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching watchlist details:", err);
      setError("Failed to load watchlist details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberUsername.trim()) {
      toast.error("Username is required");
      return;
    }

    try {
      setAddingMember(true);
      await axios.post(
        `/shared-watchlist/${watchlistId}/user/${newMemberUsername}`
      );

      // Fetch updated member list
      const userResponse = await axios.get(
        `/users/username/${newMemberUsername}`
      );
      setMembers([...members, userResponse.data]);

      setNewMemberUsername("");
      setAddMemberDialogOpen(false);
      toast.success(`${newMemberUsername} added to watchlist`);
    } catch (err) {
      console.error("Error adding member:", err);
      toast.error(err.response?.data || "Failed to add member");
    } finally {
      setAddingMember(false);
    }
  };

  const handleSearchMovies = async (query) => {
    if (!query.trim()) return;

    try {
      setIsSearching(true);
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
        toast.error(data.Error || "No movies found");
      }
    } catch (err) {
      console.error("Error searching movies:", err);
      toast.error("Failed to search movies");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMovie = async (movie) => {
    try {
      await axios.post(
        `/shared-watchlist/${watchlistId}/movie/${movie.imdbID}`
      );

      // Add the movie to the local state
      const movieWithWatchlistData = {
        ...movie,
        watchlistData: {
          addedDate: new Date().toISOString(),
          addedByUsername: "You", // This would ideally be the current user's username
          watched: false,
          ratings: {},
        },
      };

      setMovies([...movies, movieWithWatchlistData]);
      toast.success(`${movie.Title} added to watchlist`);
      setMovieSearchDialogOpen(false);
    } catch (err) {
      console.error("Error adding movie:", err);
      toast.error("Failed to add movie");
    }
  };

  const handleRateMovie = (movie) => {
    setSelectedMovie(movie);
    setRatingDialogOpen(true);
  };

  const handleRatingSubmit = async (rating) => {
    try {
      await axios.post(
        `/shared-watchlist/${watchlistId}/movie/${selectedMovie.imdbID}/rating`,
        {
          rating: rating.rating,
        }
      );

      // Update the local state
      setMovies(
        movies.map((movie) => {
          if (movie.imdbID === selectedMovie.imdbID) {
            const updatedRatings = {
              ...(movie.watchlistData.ratings || {}),
            };
            updatedRatings[currentUserId] = rating.rating;

            // Check if watched status should change (all members rated)
            const allMembersRated = members.every(
              (member) =>
                member.id === currentUserId || updatedRatings[member.id]
            );

            return {
              ...movie,
              watchlistData: {
                ...movie.watchlistData,
                ratings: updatedRatings,
                watched: allMembersRated,
              },
            };
          }
          return movie;
        })
      );

      toast.success("Rating submitted");
      setRatingDialogOpen(false);
    } catch (err) {
      console.error("Error submitting rating:", err);
      toast.error("Failed to submit rating");
    }
  };

  // Calculate progress
  const calculateProgress = () => {
    if (!movies.length) return 0;

    const watchedMovies = movies.filter((movie) => {
      // A movie is considered watched when all members have rated it
      if (!movie.watchlistData || !movie.watchlistData.ratings) return false;

      return members.every((member) =>
        Object.keys(movie.watchlistData.ratings).includes(member.id)
      );
    }).length;

    return Math.round((watchedMovies / movies.length) * 100);
  };

  // Filter and sort movies
  const getFilteredAndSortedMovies = () => {
    let filteredMovies = [...movies];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredMovies = filteredMovies.filter((movie) =>
        movie.Title.toLowerCase().includes(query)
      );
    }

    // Apply tab filter
    if (selectedTab === "watched") {
      filteredMovies = filteredMovies.filter((movie) => {
        if (!movie.watchlistData || !movie.watchlistData.ratings) return false;
        return members.every((member) =>
          Object.keys(movie.watchlistData.ratings).includes(member.id)
        );
      });
    } else if (selectedTab === "unwatched") {
      filteredMovies = filteredMovies.filter((movie) => {
        if (!movie.watchlistData || !movie.watchlistData.ratings) return true;
        return !members.every((member) =>
          Object.keys(movie.watchlistData.ratings).includes(member.id)
        );
      });
    }

    // Apply sorting
    filteredMovies.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "dateAdded":
          comparison =
            new Date(a.watchlistData?.addedDate || 0) -
            new Date(b.watchlistData?.addedDate || 0);
          break;
        case "title":
          comparison = a.Title.localeCompare(b.Title);
          break;
        case "year":
          comparison = parseInt(a.Year) - parseInt(b.Year);
          break;
        case "rating":
          const aRatings = a.watchlistData?.ratings
            ? Object.values(a.watchlistData.ratings)
            : [];
          const bRatings = b.watchlistData?.ratings
            ? Object.values(b.watchlistData.ratings)
            : [];
          const aAvg = aRatings.length
            ? aRatings.reduce((sum, r) => sum + r, 0) / aRatings.length
            : 0;
          const bAvg = bRatings.length
            ? bRatings.reduce((sum, r) => sum + r, 0) / bRatings.length
            : 0;
          comparison = aAvg - bAvg;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filteredMovies;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  if (loading && !watchlist) {
    return <Loading message="watchlist details" />;
  }

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="bg-destructive/10 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchWatchlistDetails} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!watchlist) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="bg-muted rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Watchlist Not Found</h2>
          <p className="text-muted-foreground">
            The requested watchlist could not be found
          </p>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();
  const filteredAndSortedMovies = getFilteredAndSortedMovies();

  console.log(watchlist, movies);

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Back button and header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link href="/shared-watchlist">
              <ArrowLeft className="h-4 w-4" />
              Back to Groups
            </Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">{watchlist.name}</h1>
            {watchlist.description && (
              <p className="text-muted-foreground mt-1">
                {watchlist.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-9">
                  <Users className="h-4 w-4" />
                  Members ({members.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {members.map((member) => (
                  <DropdownMenuItem key={member.id}>
                    <span>{member.username}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setAddMemberDialogOpen(true)}
                  className="cursor-pointer"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={() => setMovieSearchDialogOpen(true)}
              size="sm"
              className="gap-2 h-9"
            >
              <Plus className="h-4 w-4" />
              Add Movie
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-card border rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div>
              <h2 className="text-lg font-medium">Group Progress</h2>
              <p className="text-sm text-muted-foreground">
                {progress === 100
                  ? "All movies have been watched!"
                  : `${
                      movies.length -
                      filteredAndSortedMovies.filter(
                        (m) => m.watchlistData?.watched
                      ).length
                    } movies left to watch`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="text-2xl font-bold">{progress}%</span>
                <p className="text-xs text-muted-foreground">completed</p>
              </div>

              {movies.length > 0 && progress < 100 && (
                <Badge variant="outline" className="ml-2">
                  {movies.length - Math.round((progress / 100) * movies.length)}{" "}
                  left
                </Badge>
              )}
            </div>
          </div>

          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Movie list controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All ({movies.length})</TabsTrigger>
              <TabsTrigger value="unwatched">To Watch</TabsTrigger>
              <TabsTrigger value="watched">Watched</TabsTrigger>
            </TabsList>
          </Tabs>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="ml-2">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[300px] sm:w-[400px] gap-0 md:mt-0 mt-14">
              <SheetHeader>
                <SheetTitle>Sorting</SheetTitle>
              </SheetHeader>

              <div className="py-4 space-y-6 px-4">
                <div className="space-y-2">
                  <Label>Sort by</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Date Added" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dateAdded">Date Added</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="year">Release Year</SelectItem>
                      <SelectItem value="rating">Avg. Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={sortOrder === "asc" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setSortOrder("asc")}
                    >
                      Ascending
                    </Button>
                    <Button
                      variant={sortOrder === "desc" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setSortOrder("desc")}
                    >
                      Descending
                    </Button>
                  </div>
                </div>
              </div>
              <SheetFooter className="mb-14">
                <SheetClose asChild>
                  <Button variant="secondary">Close</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Movie grid */}
      {movies.length === 0 ? (
        <div className="text-center py-16">
          <Film className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-medium mb-2">
            No movies in this watchlist yet
          </h3>
          <p className="text-muted-foreground mb-6">
            Add some movies to start tracking what your group wants to watch
          </p>
          <Button onClick={() => setMovieSearchDialogOpen(true)}>
            Add Your First Movie
          </Button>
        </div>
      ) : filteredAndSortedMovies.length === 0 ? (
        <div className="text-center py-16">
          <ListFilter className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-medium mb-2">
            No movies match your search
          </h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search or filters
          </p>
          <Button
            onClick={() => {
              setSearchQuery("");
              setSelectedTab("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {filteredAndSortedMovies.map((movie) => (
            <motion.div key={movie.imdbID} variants={itemVariants}>
              <SharedWatchlistMovieCard
                movie={movie}
                members={members}
                currentUserId={currentUserId}
                onRate={handleRateMovie}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
            <DialogDescription>
              Enter the username of the person you want to add to this group.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Username"
              value={newMemberUsername}
              onChange={(e) => setNewMemberUsername(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddMemberDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={addingMember}>
              {addingMember ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Member"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Movie Search Dialog */}
      <Dialog
        open={movieSearchDialogOpen}
        onOpenChange={setMovieSearchDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Movie to Group Watchlist</DialogTitle>
            <DialogDescription>
              Search for a movie you want to watch with your group
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Search for a movie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchMovies(searchQuery);
                  }
                }}
              />
              <Button
                onClick={() => handleSearchMovies(searchQuery)}
                disabled={isSearching}
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Search"
                )}
              </Button>
            </div>

            {isSearching ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 mx-auto animate-spin" />
                <p className="mt-2 text-muted-foreground">
                  Searching movies...
                </p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-1">
                {searchResults.map((movie) => (
                  <div
                    key={movie.imdbID}
                    className="border rounded-md p-3 flex gap-3"
                  >
                    <div className="w-16 h-24 bg-muted relative flex-shrink-0">
                      {movie.Poster && movie.Poster !== "N/A" ? (
                        <img
                          src={movie.Poster}
                          alt={movie.Title}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Film className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2">
                        {movie.Title}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-auto">
                        {movie.Year}
                      </p>
                      {watchlist.movies[movie.imdbID] === undefined && (
                        <Button size="sm" onClick={() => handleAddMovie(movie)}>
                          <Plus />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No movies found. Try another search term."
                    : "Search for movies to add to your group watchlist."}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      {selectedMovie && (
        <RatingDialog
          isOpen={ratingDialogOpen}
          onClose={() => setRatingDialogOpen(false)}
          movie={selectedMovie}
          onRatingSubmit={handleRatingSubmit}
        />
      )}
    </div>
  );
}

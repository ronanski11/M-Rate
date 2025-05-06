import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Film, Info, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function RandomizeDialog({
  isOpen,
  onClose,
  movies,
  currentUserId,
}) {
  const router = useRouter();
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset selections when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMovies([]);
      setSearchQuery("");
    }
  }, [isOpen]);

  // Toggle movie selection
  const toggleMovieSelection = (movie) => {
    setSelectedMovies((prev) => {
      if (prev.find((m) => m.imdbID === movie.imdbID)) {
        return prev.filter((m) => m.imdbID !== movie.imdbID);
      } else {
        return [...prev, movie];
      }
    });
  };

  // Select all visible movies
  const selectAllVisible = () => {
    const filteredMovies = movies.filter((movie) =>
      movie.Title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // If all filtered movies are already selected, deselect all
    const allSelected = filteredMovies.every((movie) =>
      selectedMovies.find((m) => m.imdbID === movie.imdbID)
    );

    if (allSelected) {
      setSelectedMovies((prevSelected) =>
        prevSelected.filter(
          (movie) => !filteredMovies.find((m) => m.imdbID === movie.imdbID)
        )
      );
    } else {
      // Add any movies not already selected
      const newSelected = [...selectedMovies];
      filteredMovies.forEach((movie) => {
        if (!newSelected.find((m) => m.imdbID === movie.imdbID)) {
          newSelected.push(movie);
        }
      });
      setSelectedMovies(newSelected);
    }
  };

  // Handle redirect to spin the wheel
  const handleSubmit = () => {
    if (selectedMovies.length < 2) {
      // Need at least 2 options for spinning
      return;
    }

    setIsSubmitting(true);

    // Construct URL query parameter
    const options = selectedMovies
      .map((movie) => `${encodeURIComponent(movie.Title)}=${movie.imdbID}`)
      .join(",");

    // Navigate to spin-the-wheel page
    router.push(`/spin-the-wheel?options=${options}`);
  };

  // Get user rating for a movie
  const getUserRating = (movie) => {
    if (!movie.watchlistData || !movie.watchlistData.ratings) return null;
    return movie.watchlistData.ratings[currentUserId];
  };

  // Calculate average rating
  const getAverageRating = (movie) => {
    if (!movie.watchlistData || !movie.watchlistData.ratings) return null;

    const ratings = Object.values(movie.watchlistData.ratings);
    if (ratings.length === 0) return null;

    const sum = ratings.reduce((total, rating) => total + rating, 0);
    return (sum / ratings.length).toFixed(1);
  };

  // Filter movies based on search
  const filteredMovies = movies.filter((movie) =>
    movie.Title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if all visible movies are selected
  const allVisibleSelected =
    filteredMovies.length > 0 &&
    filteredMovies.every((movie) =>
      selectedMovies.find((m) => m.imdbID === movie.imdbID)
    );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Movie Randomizer</DialogTitle>
          <DialogDescription>
            Select movies you want to include in the randomizer
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-4">
          {/* Search and selection count */}
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex">
                Selected: {selectedMovies.length}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllVisible}
                disabled={filteredMovies.length === 0}
              >
                {allVisibleSelected ? "Deselect All" : "Select All"}
              </Button>
            </div>
          </div>

          {/* Movie table with scrolling */}
          <ScrollArea className="h-[300px] rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[50px] text-center">Select</TableHead>
                  <TableHead>Movie</TableHead>
                  <TableHead className="hidden md:table-cell">Year</TableHead>
                  <TableHead className="w-[100px] text-right">
                    Ratings
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovies.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No movies found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMovies.map((movie) => (
                    <TableRow
                      key={movie.imdbID}
                      className="cursor-pointer hover:bg-accent/20"
                      onClick={() => toggleMovieSelection(movie)}
                    >
                      <TableCell className="text-center">
                        <Checkbox
                          checked={selectedMovies.some(
                            (m) => m.imdbID === movie.imdbID
                          )}
                          onCheckedChange={() => toggleMovieSelection(movie)}
                          className="cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 items-center">
                          <div className="w-8 h-12 bg-muted relative flex-shrink-0 rounded-sm overflow-hidden">
                            {movie.Poster && movie.Poster !== "N/A" ? (
                              <img
                                src={movie.Poster}
                                alt={movie.Title}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Film className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium line-clamp-1">
                            {movie.Title}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {movie.Year}
                      </TableCell>
                      <TableCell className="text-right">
                        {movie.imdbRating}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 items-center">
          <div className="text-sm text-muted-foreground mr-auto mb-2 sm:mb-0">
            {selectedMovies.length < 2
              ? "Select at least 2 movies to continue"
              : `${selectedMovies.length} movies selected`}
          </div>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedMovies.length < 2 || isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting...
              </>
            ) : (
              "Spin the Wheel"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

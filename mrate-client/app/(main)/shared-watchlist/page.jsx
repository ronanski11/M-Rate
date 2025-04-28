"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Plus,
  Film,
  Calendar,
  Loader2,
  Clock,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import axios from "@/app/axiosInstance";
import { motion } from "framer-motion";
import moment from "moment";

export default function SharedWatchlistsPage() {
  const router = useRouter();
  const [watchlists, setWatchlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newWatchlist, setNewWatchlist] = useState({
    name: "",
    description: "",
  });

  // Fetch shared watchlists when component mounts
  useEffect(() => {
    fetchWatchlists();
  }, []);

  const fetchWatchlists = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/shared-watchlist");
      setWatchlists(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching shared watchlists:", err);
      setError("Failed to load shared watchlists");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWatchlist = async () => {
    try {
      if (!newWatchlist.name.trim()) {
        toast.error("Watchlist name is required");
        return;
      }

      setLoading(true);
      const response = await axios.post("/shared-watchlist", newWatchlist);

      setWatchlists([...watchlists, response.data]);
      setNewWatchlist({ name: "", description: "" });
      setCreateDialogOpen(false);
      toast.success("Watchlist created successfully");

      // Optionally navigate directly to the new watchlist
      router.push(`/shared-watchlist/${response.data.id}`);
    } catch (err) {
      console.error("Error creating watchlist:", err);
      toast.error("Failed to create watchlist");
    } finally {
      setLoading(false);
    }
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

  // Calculate progress for a watchlist
  const calculateWatchlistProgress = (watchlist) => {
    if (!watchlist.movies || Object.keys(watchlist.movies).length === 0) {
      return 0;
    }

    const totalMovies = Object.keys(watchlist.movies).length;
    const watchedMovies = Object.values(watchlist.movies).filter(
      (movie) => movie.watched
    ).length;

    return Math.round((watchedMovies / totalMovies) * 100);
  };

  // Format date
  const formatDateRelative = (dateString) => {
    return moment(dateString).fromNow();
  };

  if (loading && watchlists.length === 0) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shared watchlists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Group Watchlists</h1>
          <p className="text-muted-foreground mt-1">
            Track movies to watch with friends and see everyone's ratings
          </p>
        </div>

        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="size-4" />
          Create New Group
        </Button>
      </div>

      {error ? (
        <div className="text-center py-12">
          <div className="bg-destructive/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={fetchWatchlists} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      ) : watchlists.length === 0 ? (
        <div className="text-center py-12">
          <Users className="size-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-medium mb-2">No group watchlists yet</h3>
          <p className="text-muted-foreground mb-6">
            Create a group watchlist to track movies you want to watch together
            with friends
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            Create Your First Group
          </Button>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {watchlists.map((watchlist) => {
            const progress = calculateWatchlistProgress(watchlist);
            const movieCount = watchlist.movies
              ? Object.keys(watchlist.movies).length
              : 0;
            const memberCount = watchlist.userIds
              ? watchlist.userIds.length
              : 1;

            return (
              <motion.div key={watchlist.id} variants={itemVariants}>
                <Link href={`/shared-watchlist/${watchlist.id}`}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <CardTitle className="line-clamp-1">
                            {watchlist.name}
                          </CardTitle>
                          {watchlist.description && (
                            <p className="text-muted-foreground text-sm mt-1 line-clamp-1">
                              {watchlist.description}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant={progress === 100 ? "default" : "outline"}
                        >
                          {progress === 100 ? "Completed" : "In Progress"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Completion
                            </span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>

                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Film className="h-4 w-4 text-muted-foreground" />
                            <span>{movieCount} movies</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{memberCount} members</span>
                          </div>

                          {watchlist.lastUpdated && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {formatDateRelative(watchlist.lastUpdated)}
                              </span>
                            </div>
                          )}
                        </div>

                        {!movieCount ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add movies
                          </Button>
                        ) : progress < 100 ? (
                          <Button size="sm" className="w-full">
                            <ListChecks className="h-4 w-4 mr-2" />
                            Continue watching
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                          >
                            View ratings
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Create Watchlist Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Group Watchlist</DialogTitle>
            <DialogDescription>
              Create a watchlist for your group to track movies you want to
              watch together by summer.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Group Name
              </Label>
              <Input
                id="name"
                value={newWatchlist.name}
                onChange={(e) =>
                  setNewWatchlist({ ...newWatchlist, name: e.target.value })
                }
                placeholder="e.g., Summer Movie Marathon"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                value={newWatchlist.description}
                onChange={(e) =>
                  setNewWatchlist({
                    ...newWatchlist,
                    description: e.target.value,
                  })
                }
                placeholder="e.g., Movies we need to watch before summer vacation ends"
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateWatchlist} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Group"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

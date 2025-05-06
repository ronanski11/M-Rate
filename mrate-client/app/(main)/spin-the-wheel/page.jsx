"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import MovieCard from "@/components/movie-card";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { fetchMovieById } from "@/lib/omdb-service";

// Dynamically import the Wheel component with SSR disabled
const Wheel = dynamic(
  () => import("react-custom-roulette").then((mod) => mod.Wheel),
  { ssr: false }
);

export default function SpinWheelPage() {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [winningMovie, setWinningMovie] = useState(null);
  const [wheelData, setWheelData] = useState([]);
  const [movieOptions, setMovieOptions] = useState([]);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();

  useEffect(() => {
    // Get options from URL query parameters
    const optionsParam = searchParams.get("options");

    if (!optionsParam) {
      // If no options provided, set some sample data
      setWheelData([
        { option: "Add movies in URL" },
        { option: "Example: ?options=Inception=tt1375666" },
        { option: "No movies found" },
        { option: "Try again" },
      ]);
      setMovieOptions([]);
      setLoading(false);
      return;
    }

    try {
      // Parse movies in format: Name=imdbId,Name2=imdbId2
      const parsedOptions = optionsParam.split(",").map((item) => {
        const [name, imdbId] = item.split("=");
        if (!name || !imdbId) {
          throw new Error("Invalid format");
        }
        return { name: name.trim(), imdbId: imdbId.trim() };
      });

      // Set movie options for later use
      setMovieOptions(parsedOptions);

      // Format data for the wheel component
      const formattedOptions = parsedOptions.map((movie) => ({
        option: movie.name,
        style: {
          fontSize: Math.max(12, 16 - Math.floor(movie.name.length / 10)),
        },
      }));

      setWheelData(formattedOptions);
    } catch (error) {
      console.error("Error parsing options:", error);
      setWheelData([
        { option: "Invalid format" },
        { option: "Use: Name=imdbId,Name2=imdbId2" },
        { option: "Try again" },
      ]);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const handleSpinClick = () => {
    // Close any open dialog
    setIsResultDialogOpen(false);
    setWinningMovie(null);

    // Generate random prize
    const newPrizeNumber = Math.floor(Math.random() * wheelData.length);
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
  };

  const handleSpinComplete = async () => {
    setMustSpin(false);

    // Get winning movie data
    if (movieOptions.length > 0) {
      const winner = movieOptions[prizeNumber];

      try {
        setLoading(true);
        // Fetch complete movie data
        const movieData = await fetchMovieById(winner.imdbId);
        setWinningMovie({
          ...movieData,
          imdbID: winner.imdbId,
        });

        // Open dialog with movie card
        setIsResultDialogOpen(true);
      } catch (error) {
        console.error("Error fetching winning movie:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">Movie Wheel of Fortune</h1>
        <p className="text-muted-foreground">
          Spin the wheel to choose your next movie!
        </p>
      </motion.div>

      <div className="mb-8 relative">
        {loading ? (
          <div className="w-[300px] h-[300px] flex items-center justify-center">
            <Loading message="wheel" />
          </div>
        ) : (
          <>
            {typeof window !== "undefined" && wheelData.length > 0 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Wheel
                  mustStartSpinning={mustSpin}
                  prizeNumber={prizeNumber}
                  data={wheelData}
                  onStopSpinning={handleSpinComplete}
                  backgroundColors={[
                    "#E63946", // Bright Red
                    "#FFD166", // Yellow
                    "#06D6A0", // Teal
                    "#118AB2", // Blue
                    "#073B4C", // Dark Blue
                    "#7209B7", // Purple
                    "#F72585", // Pink
                    "#4CC9F0", // Light Blue
                    "#FB8500", // Orange
                    "#2EC4B6", // Seafoam
                    "#F8961E", // Light Orange
                    "#43AA8B", // Green
                    "#277DA1", // Steel Blue
                    "#F94144", // Coral Red
                    "#90BE6D", // Light Green
                  ]}
                  textColors={["#ffffff"]}
                  outerBorderColor="#eeeeee"
                  outerBorderWidth={2}
                  innerRadius={30}
                  innerBorderColor="#30303080"
                  innerBorderWidth={10}
                  radiusLineColor="#eeeeee"
                  radiusLineWidth={1}
                  spinDuration={0.5}
                  textDistance={70}
                />
              </motion.div>
            )}
          </>
        )}

        {wheelData.length === 0 && !loading && (
          <div className="bg-muted p-8 rounded-lg text-center">
            <p className="text-lg">No movie options provided</p>
            <p className="text-muted-foreground mt-2">
              Add movies using the URL format: <br />
              <code>?options=MovieName=imdbId,AnotherMovie=imdbId2</code>
            </p>
          </div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex justify-center items-center flex-col gap-4">
          <Button
            onClick={handleSpinClick}
            disabled={mustSpin || loading || wheelData.length === 0}
            size="lg"
            className="px-8 py-6 text-lg gap-2"
          >
            {mustSpin ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                Spinning...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Spin the Wheel
              </>
            )}
          </Button>
          <Button
            size="lg"
            className="px-8 py-6 text-lg gap-2"
            variant="secondary"
            onClick={() => window.history.back()}
          >
            Back
          </Button>
        </div>
      </motion.div>

      {/* Result Dialog */}
      <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
        <DialogTitle />
        <DialogContent className="sm:max-w-md">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold">Your Movie Pick!</h2>
            <p className="text-muted-foreground">The wheel has spoken!</p>
          </div>

          {winningMovie && (
            <div className="p-4 flex justify-center items-center w-full">
              <div className="w-40">
                <MovieCard movie={winningMovie} fetchWatchlistStatus={true} />
              </div>
            </div>
          )}

          <div className="flex justify-center mt-4">
            <Button onClick={handleSpinClick} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Spin Again
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

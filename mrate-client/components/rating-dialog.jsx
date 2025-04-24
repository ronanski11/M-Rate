import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";
import axios from "@/app/axiosInstance";

const RatingDialog = ({ isOpen, onClose, movie, onRatingSubmit }) => {
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!movie) return;

    try {
      setIsSubmitting(true);

      // Call API to update rating
      await axios.post("/rating", {
        imdbId: movie.imdbID,
        rating: rating,
      });

      // Notify parent component about successful rating
      if (onRatingSubmit) {
        onRatingSubmit(rating);
      }

      // Close the dialog
      onClose();
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get rating text based on value
  const getRatingText = (value) => {
    if (value < 3) return "Poor";
    if (value < 5) return "Below Average";
    if (value < 6) return "Average";
    if (value < 7.5) return "Good";
    if (value < 9) return "Great";
    if (value === 10.0) return "Cap 🤨";
    return "Excellent";
  };

  // Get color based on rating value
  const getRatingColor = (value) => {
    if (value < 3) return "text-red-500";
    if (value < 6) return "text-orange-500";
    if (value < 8) return "text-yellow-500";
    if (value < 9) return "text-green-500";
    return "text-green-600";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-6 rounded-lg">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-2xl font-bold">
            Rate "{movie?.Title}"
          </DialogTitle>
          <DialogDescription className="text-base">
            How would you rate this movie on a scale from 1 to 10?
          </DialogDescription>
        </DialogHeader>

        <div className="py-8">
          <div className="flex flex-col space-y-6">
            <div className="flex justify-center items-center">
              <span className={`text-4xl font-bold ${getRatingColor(rating)}`}>
                {rating.toFixed(1)}
              </span>
              <span className="text-base text-muted-foreground ml-2">
                / 10 ({getRatingText(rating)})
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm text-muted-foreground px-1">
                <span>1</span>
                <span>10</span>
              </div>

              <Slider
                value={[rating]}
                min={1}
                max={10}
                step={0.1}
                onValueChange={(value) => setRating(value[0])}
                className="w-full"
              />

              <div className="flex justify-between items-center text-sm text-muted-foreground px-1 pt-1">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Rating"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RatingDialog;

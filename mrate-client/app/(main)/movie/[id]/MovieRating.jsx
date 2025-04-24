"use client";

import { useState, useEffect } from "react";
import { Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import axios from "@/app/axiosInstance";

// Rating categories and descriptions
const ratingCategories = [
  {
    id: "narrative",
    name: "Narrative Execution",
    description:
      "Evaluates how effectively the story is told, including pacing, structure, coherence, and thematic depth.",
  },
  {
    id: "technical",
    name: "Technical Craftsmanship",
    description:
      "A holistic assessment of direction, cinematography, editing, sound design, and visual effects.",
  },
  {
    id: "performance",
    name: "Performance Quality",
    description:
      "Rates acting performances, character development, and the authenticity of portrayals.",
  },
  {
    id: "emotional",
    name: "Emotional Resonance",
    description:
      "Measures how effectively the film connects with viewers emotionally.",
  },
  {
    id: "cultural",
    name: "Cultural Impact & Originality",
    description:
      "Assesses the film's uniqueness, innovation, cultural relevance, and lasting influence.",
  },
];

// Main Movie Rating Component
export default function MovieRating({
  movieId,
  movieTitle,
  onClose,
  onSubmitRating,
}) {
  const [ratings, setRatings] = useState({
    narrative: 5.0,
    technical: 5.0,
    performance: 5.0,
    emotional: 5.0,
    cultural: 5.0,
  });
  const [overallRating, setOverallRating] = useState(5.0);
  const [submitted, setSubmitted] = useState(false);

  // Calculate overall rating whenever individual ratings change
  useEffect(() => {
    const values = Object.values(ratings);
    const average =
      values.reduce((sum, value) => sum + value, 0) / values.length;
    setOverallRating(average);
  }, [ratings]);

  // Handle rating change for a specific category
  const handleRatingChange = (category, value) => {
    setRatings((prev) => ({
      ...prev,
      [category]: value[0],
    }));
  };

  // Handle form submission
  const handleSubmit = () => {
    try {
      const response = axios.post(`/rate?imdbId=${movieId}`, ratings);
      setSubmitted(true);
      onSubmitRating({ ...response.data, overall: response.data.overall });
    } catch (error) {
      console.log("Problem submitting rating:", error);
    }
  };

  // Handle going back to movie details
  const handleBackToDetails = () => {
    onClose();
  };

  // Handle rating again
  const handleRateAgain = () => {
    setSubmitted(false);
  };

  // If rating was already submitted, show the results
  if (submitted) {
    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center"
            onClick={handleBackToDetails}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Details
          </Button>
          <h2 className="text-xl font-semibold">Your Rating</h2>
        </div>

        <div className="text-center space-y-4 py-4">
          <div className="text-3xl font-bold flex items-center justify-center">
            {overallRating.toFixed(1)}
            <Star className="h-6 w-6 ml-1 text-yellow-500 fill-yellow-500" />
          </div>
          <p className="text-muted-foreground mb-4">
            Thanks for rating "{movieTitle}"!
          </p>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              {ratingCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm">{category.name}</span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium mr-1">
                      {ratings[category.id].toFixed(1)}
                    </span>
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-6">
          <Button onClick={handleRateAgain}>Rate Again</Button>
        </div>
      </div>
    );
  }

  // Show the rating form
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center"
          onClick={handleBackToDetails}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Details
        </Button>
        <h2 className="text-xl font-semibold">Rate "{movieTitle}"</h2>
      </div>

      <div className="space-y-6">
        {ratingCategories.map((category) => (
          <div key={category.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{category.name}</span>
              <span className="text-xl font-bold flex items-center">
                {ratings[category.id].toFixed(1)}
                <Star className="h-4 w-4 ml-1 text-yellow-500 fill-yellow-500" />
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {category.description}
            </p>
            <Slider
              value={[ratings[category.id]]}
              max={10}
              min={1}
              step={0.1}
              onValueChange={(value) => handleRatingChange(category.id, value)}
              className="my-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1.0</span>
              <span>10.0</span>
            </div>
            {category.id !== "cultural" && <Separator className="my-4" />}
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold">Overall Rating</span>
          <span className="text-2xl font-bold flex items-center">
            {overallRating.toFixed(1)}
            <Star className="h-5 w-5 ml-1 text-yellow-500 fill-yellow-500" />
          </span>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleBackToDetails}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit Rating</Button>
        </div>
      </div>
    </div>
  );
}

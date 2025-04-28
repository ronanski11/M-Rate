"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FilmIcon, Star, Clock, Check, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function SharedWatchlistMovieCard({
  movie,
  members = [],
  onRate,
  currentUserId,
  className,
}) {
  // Organize ratings by user
  const userRatings = {};
  let isWatched = false;

  if (movie.watchlistData && movie.watchlistData.ratings) {
    Object.entries(movie.watchlistData.ratings).forEach(([userId, rating]) => {
      userRatings[userId] = rating;
    });

    // A movie is watched when all members have rated it
    isWatched =
      members.length > 0 &&
      members.every((member) =>
        Object.keys(movie.watchlistData.ratings).includes(member.id)
      );
  }

  // Calculate average rating if any exist
  const ratings = Object.values(userRatings);
  const averageRating = ratings.length
    ? (
        ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      ).toFixed(1)
    : null;

  // Check if current user has rated
  const hasUserRated = currentUserId && userRatings[currentUserId];

  // Function to determine color class based on rating
  const getRatingColorClass = (rating) => {
    if (!rating) return "bg-gray-500";

    const numRating = parseFloat(rating);

    if (numRating < 6) return "bg-red-500 text-white";
    if (numRating < 7.5) return "bg-yellow-400 text-black";
    if (numRating < 8) return "bg-green-300 text-black";
    if (numRating < 8.5) return "bg-green-400 text-black";
    if (numRating < 9) return "bg-green-500 text-white";
    if (numRating < 9.5) return "bg-green-600 text-white";
    return "bg-green-700 text-white";
  };

  return (
    <Card
      className={cn(
        "overflow-hidden h-full transition-all hover:shadow-md p-0 gap-0",
        className
      )}
    >
      <div className="relative">
        {/* Movie Poster */}
        <div className="aspect-[2/3] bg-muted relative">
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
              <FilmIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Movie Status Badge */}
        <div className="absolute top-2 left-2">
          {isWatched && (
            <Badge className="bg-green-500">
              <Check className="h-3 w-3 mr-1" />
              Watched
            </Badge>
          )}
        </div>

        {/* Average Rating Badge */}
        {averageRating && (
          <div className="absolute top-2 right-2">
            <Badge className={getRatingColorClass(averageRating)}>
              <Star className="h-3 w-3 mr-1 fill-current" />
              {averageRating}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Movie Title & Year */}
        <Link href={`/movie/${movie.imdbID}`} className="hover:text-primary">
          <h3 className="font-medium line-clamp-2 mb-1">{movie.Title}</h3>
        </Link>
        <p className="text-sm text-muted-foreground mb-3">{movie.Year}</p>

        {/* User Ratings */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Ratings</h4>

            {!hasUserRated && (
              <Button
                size="sm"
                variant=""
                className="h-7 px-2 text-xs"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRate && onRate(movie);
                }}
              >
                <Star className="h-3 w-3 mr-1" />
                Rate
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-1">
            {members.length > 0 ? (
              members.map((member) => {
                const hasRated = userRatings[member.id];
                const rating = hasRated ? userRatings[member.id] : null;

                return (
                  <TooltipProvider key={member.id} delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative cursor-pointer">
                          <Avatar
                            className={cn(
                              "h-9 w-9 border-2",
                              hasRated
                                ? "border-green-500 opacity-100"
                                : "border-muted opacity-70"
                            )}
                          >
                            <AvatarFallback>
                              {member.username?.charAt(0).toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          {hasRated && (
                            <div
                              className={cn(
                                "absolute -bottom-1 -right-1 rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-bold border border-background",
                                getRatingColorClass(rating)
                              )}
                            >
                              {rating}
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{member.username}</p>
                        {hasRated ? (
                          <p>Rated: {rating.toFixed(1)}/10</p>
                        ) : (
                          <p>Not rated yet</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground">No members yet</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Star, BookmarkIcon } from "lucide-react";
import SearchBar from "@/components/searchbar";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container px-4 py-8 flex flex-col items-center">
        <section className="w-full max-w-3xl mx-auto text-center mb-12 mt-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Rate Movies with Friends
          </h1>
          <p className="text-lg mb-8">
            Search, rate, and keep track of movies you've watched
          </p>

          {/* Search Bar Component */}
          <SearchBar />
        </section>

        {/* Tabs Section */}
        <section className="w-full max-w-6xl mx-auto">
          <Tabs defaultValue="watchlist" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-lg p-1">
              <TabsTrigger
                value="watchlist"
                className="data-[state=active]:bg-transparent"
              >
                Watchlist
              </TabsTrigger>
              <TabsTrigger
                value="rated"
                className="data-[state=active]:bg-transparent"
              >
                Rated
              </TabsTrigger>
            </TabsList>

            <TabsContent value="watchlist" className="mt-6">
              <div className="text-center py-12">
                <BookmarkIcon className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  Your watchlist is empty
                </h3>
                <p className="mb-6">
                  Search for movies and add them to your watchlist
                </p>
                <Button>Discover Movies</Button>
              </div>
            </TabsContent>

            <TabsContent value="rated" className="mt-6">
              <div className="text-center py-12">
                <Star className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  You haven't rated any movies yet
                </h3>
                <p className="mb-6">
                  Rate movies to keep track of what you've watched
                </p>
                <Button>Discover Movies</Button>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
}

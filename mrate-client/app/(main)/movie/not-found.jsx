import Link from "next/link";
import { Film } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function MovieNotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <Film className="h-24 w-24 text-muted-foreground mb-6" />
      <h1 className="text-4xl font-bold tracking-tight mb-2">
        Movie Not Found
      </h1>
      <p className="text-xl text-muted-foreground mb-8">
        We couldn't find the movie you're looking for.
      </p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}

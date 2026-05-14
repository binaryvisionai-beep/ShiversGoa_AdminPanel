import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-xl text-center">
        <div className="mx-auto size-16 rounded-2xl bg-gradient-amber flex items-center justify-center shadow-glow">
          <Sparkles className="size-7 text-primary-foreground" />
        </div>
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mt-6">
          Shivers · Luxury Suite
        </p>
        <h1 className="font-display text-4xl md:text-5xl mt-3">
          A premium hospitality <span className="text-gradient-amber">command centre</span>
        </h1>
        <p className="text-muted-foreground mt-4">
          Step into the admin suite designed for boutique resorts and private estates.
        </p>
        <Link
          to="/admin"
          className="mt-8 inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-gradient-amber text-primary-foreground font-medium shadow-glow hover:opacity-95 transition"
        >
          Enter admin panel <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

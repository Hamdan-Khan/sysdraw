import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Philosophy } from "@/components/Philosophy";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

export function Home() {
  return (
    <main className="min-h-screen bg-white text-black font-sans">
      <Hero />
      <Philosophy />
      <Features />
      <Footer />
    </main>
  );
}

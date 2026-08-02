import githubIcon from "@/assets/github.svg";
import { ArrowUpRight } from "lucide-react";
import { CANVAS_URL, GITHUB_URL } from "../constants";

export const Hero = () => {
  return (
    <section className="border-b-8 border-b-black bg-white">
      <div className="mx-auto max-w-262.5 px-6 py-16 sm:px-10 md:py-24 lg:py-32">
        <div className="flex flex-col gap-6 md:gap-8">
          <div>
            <h1 className="text-6xl font-black tracking-tight sm:text-7xl md:text-8xl lg:text-9xl text-black">
              ZeroSketch
            </h1>
            <p className="mt-3 text-xl font-medium sm:text-2xl md:text-3xl lg:text-4xl text-neutral-600">
              system design for everyone
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-16 items-center justify-center gap-3 rounded-xl border-4 border-black bg-white px-7 py-3 text-xl font-bold text-black transition-all hover:bg-black hover:text-white focus:outline-none focus:ring-4 focus:ring-black/20"
            >
              <img
                src={githubIcon}
                alt="GitHub"
                className="h-7 w-7 transition-all group-hover:invert"
              />
              <span>View on GitHub</span>
            </a>

            <a
              href={CANVAS_URL}
              className="flex min-h-16 items-center justify-center gap-3 rounded-xl border-4 border-black bg-black px-7 py-3 text-xl font-bold text-white transition-all hover:bg-neutral-800 focus:outline-none focus:ring-4 focus:ring-black/20"
            >
              <span>Open Canvas</span>
              <ArrowUpRight className="h-7 w-7" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

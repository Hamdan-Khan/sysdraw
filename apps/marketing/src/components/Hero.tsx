import githubIcon from "@/assets/github.svg";
import { ArrowUpRight } from "lucide-react";
import { CANVAS_URL, GITHUB_URL } from "../constants";

export const Hero = () => {
  return (
    <section className="border-b-8 border-b-black bg-white">
      <div className="mx-auto max-w-262.5 px-6 py-16 sm:px-10 md:py-24 lg:py-32">
        <div className="flex flex-col gap-6 md:gap-8">
          <div className="flex flex-col items-center sm:flex-row sm:items-center gap-6 sm:gap-8 md:gap-10">
            <img
              src="/logo.svg"
              alt="ZeroSketch Logo"
              className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 lg:h-48 lg:w-48 shrink-0"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-6xl font-black tracking-tight sm:text-7xl md:text-8xl lg:text-9xl text-black">
                ZeroSketch
              </h1>
              <p className="mt-3 text-xl font-medium sm:text-2xl md:text-3xl lg:text-4xl text-neutral-600">
                system design for everyone
              </p>
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-3 sm:mt-4 sm:flex-row sm:items-center sm:gap-4">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-12 items-center justify-center gap-2.5 rounded-xl border-3 border-black bg-white px-5 py-2.5 text-base font-bold text-black transition-all hover:bg-black hover:text-white focus:outline-none focus:ring-4 focus:ring-black/20 sm:min-h-16 sm:gap-3 sm:border-4 sm:px-7 sm:py-3 sm:text-xl"
            >
              <img
                src={githubIcon}
                alt="GitHub"
                className="h-5 w-5 transition-all group-hover:invert sm:h-7 sm:w-7"
              />
              <span>View on GitHub</span>
            </a>

            <a
              href={CANVAS_URL}
              className="flex min-h-12 items-center justify-center gap-2.5 rounded-xl border-3 border-black bg-black px-5 py-2.5 text-base font-bold text-white transition-all hover:bg-neutral-800 focus:outline-none focus:ring-4 focus:ring-black/20 sm:min-h-16 sm:gap-3 sm:border-4 sm:px-7 sm:py-3 sm:text-xl"
            >
              <span>Open Canvas</span>
              <ArrowUpRight className="h-5 w-5 sm:h-7 sm:w-7" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

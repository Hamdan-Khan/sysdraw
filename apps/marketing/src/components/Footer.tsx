import { CANVAS_URL, GITHUB_URL } from "@/constants";
import { ArrowUpRight } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-black py-12 text-white">
      <div className="mx-auto max-w-262.5 px-6 sm:px-10">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-xl font-bold tracking-tight text-white">sysdraw</p>
          <div className="flex items-center gap-6 text-base sm:text-lg font-medium">
            <a
              href={CANVAS_URL}
              className="group inline-flex items-center gap-1 text-white underline underline-offset-4 decoration-neutral-500 hover:text-neutral-300 hover:decoration-white transition-colors"
            >
              <span>Open Canvas</span>
              <ArrowUpRight className="h-4 w-4 text-neutral-400 group-hover:text-white transition-colors" />
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1 text-white underline underline-offset-4 decoration-neutral-500 hover:text-neutral-300 hover:decoration-white transition-colors"
            >
              <span>GitHub</span>
              <ArrowUpRight className="h-4 w-4 text-neutral-400 group-hover:text-white transition-colors" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

import { LIBRARIES_URL } from "@/constants";
import { ArrowUpRight, LayoutGrid } from "lucide-react";

export const Philosophy = () => {
  return (
    <section className="border-b-8 border-b-black py-20 md:py-28 bg-neutral-50">
      <div className="mx-auto max-w-262.5 px-6 sm:px-10">
        <h2 className="mb-6 text-3xl font-black tracking-tight sm:text-5xl md:text-6xl text-black">
          System Design is <span className="text-red-700">not</span> complicated
        </h2>

        <p className="mb-10 text-lg leading-relaxed sm:text-2xl sm:leading-relaxed text-neutral-800">
          ZeroSketch is built for system design with{" "}
          <span className="font-semibold text-black">least friction</span>.
          Simple drag and drop sketching with zero bloat. Easily customize your
          architecture using{" "}
          <span className="font-semibold text-black">
            local and community libraries
          </span>{" "}
          providing ready to use icons that most system design tools ignore.
        </p>

        <div className="flex justify-center sm:justify-start">
          <a
            href={LIBRARIES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex min-h-12 items-center justify-center gap-2.5 rounded-xl border-3 border-black bg-white px-5 py-2.5 text-base font-bold text-black transition-all hover:bg-black hover:text-white focus:outline-none focus:ring-4 focus:ring-black/20 sm:min-h-16 sm:gap-3 sm:border-4 sm:px-7 sm:py-3 sm:text-xl"
          >
            <LayoutGrid className="h-5 w-5 transition-colors group-hover:text-white sm:h-6 sm:w-6" />
            <span>Explore Icon Libraries</span>
            <ArrowUpRight className="h-4 w-4 transition-colors group-hover:text-white sm:h-5 sm:w-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

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

        <a
          href={LIBRARIES_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 rounded-xl border-4 border-black bg-white px-6 py-3.5 text-lg font-bold text-black transition-all hover:bg-black hover:text-white md:text-xl group"
        >
          <LayoutGrid className="h-6 w-6 group-hover:text-white transition-colors" />
          <span>Explore Icon Libraries</span>
          <ArrowUpRight className="h-5 w-5 group-hover:text-white transition-colors" />
        </a>
      </div>
    </section>
  );
};

import { Check, Timer } from "lucide-react";
import { WaitlistForm } from "./WaitlistForm";

export const Features = () => {
  const availableFeatures = [
    "Drag & Drop Canvas",
    "Icon Libraries",
    "Custom Library Builder",
    "Free SVG & PNG Exports",
    "Local Persistant Storage",
  ];

  const roadmapFeatures = [
    "Realtime Collaboration",
    "Cloud Sync",
    "AI Assisted Drawings",
    "DSL Parsing (mermaid, etc.)",
    "Continuous Documentation Sync",
  ];

  return (
    <section className="border-b-8 border-b-black py-20 md:py-28 bg-white">
      <div className="mx-auto max-w-262.5 px-6 sm:px-10">
        <h2 className="mb-4 text-3xl font-black tracking-tight sm:text-5xl md:text-6xl text-black">
          What's Here & What's Coming
        </h2>
        <p className="mb-10 text-base leading-relaxed sm:text-xl text-neutral-600">
          Everything you need right now, plus the features coming soon.
        </p>

        <div className="rounded-2xl border-4 border-black bg-white overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y-4 md:divide-y-0 md:divide-x-4 divide-black">
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b-4 border-black bg-black px-6 py-4 text-white">
              <span className="text-lg font-black uppercase tracking-wider">
                Available Now
              </span>
            </div>

            <ul className="p-4 sm:p-6 space-y-3">
              {availableFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center justify-between rounded-xl border-2 border-black bg-neutral-50 px-4 py-3 text-base font-bold text-black sm:text-lg"
                >
                  <span>{feature}</span>
                  <Check className="h-5 w-5 stroke-3 text-black shrink-0" />
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col bg-neutral-50/50">
            <div className="flex items-center justify-between border-b-4 border-black bg-neutral-100 px-6 py-4 text-black">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black uppercase tracking-wider text-black">
                  Roadmap
                </span>
              </div>
              <span className="rounded-md border border-neutral-300 bg-white px-2.5 py-0.5 text-xs font-bold text-neutral-600">
                Coming soon!
              </span>
            </div>

            <ul className="p-4 sm:p-6 space-y-3">
              {roadmapFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center justify-between rounded-xl border-2 border-neutral-300 bg-white px-4 py-3 text-base font-bold text-neutral-400 sm:text-lg"
                >
                  <span>{feature}</span>
                  <Timer className="h-5 w-5 text-neutral-400 shrink-0" />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <WaitlistForm />
      </div>
    </section>
  );
};

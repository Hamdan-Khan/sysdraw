import { CANVAS_URL, GITHUB_URL, SITE_URL } from "../constants";

export const jsonLdSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#webapp`,
      name: "ZeroSketch",
      url: CANVAS_URL,
      description:
        "Free and open-source system design diagramming tool with zero-friction drag & drop canvas, custom icon libraries, and high-level system architecture sketching.",
      applicationCategory: "DesignApplication",
      operatingSystem: "All",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      isAccessibleForFree: true,
      featureList: [
        "Drag & drop canvas interface",
        "Custom system design icon libraries",
        "High-level architecture sketching",
        "Open source and free to use",
      ],
      sameAs: [GITHUB_URL],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "ZeroSketch",
      description:
        "ZeroSketch - Free & Open Source System Design Diagramming Tool",
    },
  ],
};

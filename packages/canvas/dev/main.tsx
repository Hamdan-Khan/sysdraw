import { ReactFlowProvider } from "@xyflow/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { scan } from "react-scan";
import "./main.css";
import { PlayGround } from "./playground";

// react scan
if (typeof window !== "undefined") {
  scan({
    enabled: true,
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReactFlowProvider>
      <PlayGround />
    </ReactFlowProvider>
  </StrictMode>,
);

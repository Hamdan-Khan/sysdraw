import { ReactFlowProvider } from "@xyflow/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
import { PlayGround } from "./playground";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReactFlowProvider>
      <PlayGround />
    </ReactFlowProvider>
  </StrictMode>,
);

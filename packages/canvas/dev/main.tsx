import { Canvas } from "@sysdraw/canvas";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Canvas />
  </StrictMode>,
);

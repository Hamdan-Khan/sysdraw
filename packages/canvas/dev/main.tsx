import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
import { PlayGround } from "./playground";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PlayGround />
  </StrictMode>,
);

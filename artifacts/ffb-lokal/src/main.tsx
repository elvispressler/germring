import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

document.getElementById("seo-fallback")?.remove();

createRoot(document.getElementById("root")!).render(<App />);

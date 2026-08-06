import { createRoot } from "react-dom/client";
import "./styles/global.css";
import App from "./App";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Missing #root element");

createRoot(rootEl).render(<App />);

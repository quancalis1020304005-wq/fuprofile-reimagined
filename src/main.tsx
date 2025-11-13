import { createRoot } from "react-dom/client";
import { Buffer } from "buffer";
import App from "./App.tsx";
import "./index.css";

// Polyfills for WalletConnect
window.global = window;
window.Buffer = Buffer;

createRoot(document.getElementById("root")!).render(<App />);

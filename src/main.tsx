import { createRoot } from "react-dom/client";
import "./index.css";
import AppRouter from "./router/AppRouter.tsx";
import { ThemeProvider } from "./context/themeContext.tsx";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <AppRouter />
  </ThemeProvider>
);

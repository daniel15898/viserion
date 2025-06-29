import { useTheme } from "@/context/themeContext";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";

export default function ThemeToggler() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="icon"
      className="h-9 w-9"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <div className="relative flex h-4 w-4 items-center justify-center">
        {theme === "light" ? (
          <Sun className="h-4 w-4 transition-all duration-300 ease-in-out" />
        ) : (
          <Moon className="h-4 w-4 transition-all duration-300 ease-in-out" />
        )}
      </div>
    </Button>
  );
}

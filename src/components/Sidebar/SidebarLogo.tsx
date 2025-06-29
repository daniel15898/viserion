import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import viserionLightLogo from "@/assets/vesrion-light2.jpeg";
import viserionDarkLogo from "@/assets/vesrion-dark.jpeg";
import { useTheme } from "@/context/themeContext";
import { useMemo } from "react";

function SidebarLogo() {
  // You can switch between light and dark logo based on theme
  const { theme } = useTheme();

  const currentLogo = useMemo(() => {
    return theme === "dark" ? viserionDarkLogo : viserionLightLogo;
  }, [theme]);

  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-10 flex aspect-square">
        <AvatarImage className="rounded-full" src={currentLogo} />
      </Avatar>
      <div className="grid flex-1 leading-tight">
        <span className="truncate font-bold text-xl bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
          Viserion
        </span>
      </div>
    </div>
  );
}

export default SidebarLogo;

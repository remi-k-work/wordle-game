// services, features, and other libraries
import { useTheme } from "next-themes";

// components
import { Button } from "@base-ui/react";

// assets
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

export default function ThemeChanger() {
  // Determine whether the current theme is dark or light
  const { resolvedTheme, setTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  return (
    <Button className="button p-1" title={isDarkMode ? "Light Mode" : "Dark Mode"} onClick={() => setTheme(isDarkMode ? "light" : "dark")}>
      {isDarkMode ? <SunIcon className="size-11" /> : <MoonIcon className="size-11" />}
    </Button>
  );
}

import { useEffect, useState } from "react"
import SkyToggle from "@/components/ui/sky-toggle"

type Theme = "dark" | "light"

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark"
    return (localStorage.getItem("querymind-theme") as Theme) || "dark"
  })

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute("data-theme", theme)
    localStorage.setItem("querymind-theme", theme)
  }, [theme])

  const toggle = () => setTheme(t => (t === "dark" ? "light" : "dark"))

  return { theme, toggle, isDark: theme === "dark" }
}

export default function ThemeToggle() {
  const { theme, toggle, isDark } = useTheme()

  return (
    <div title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      <SkyToggle
        checked={!isDark}
        onChange={() => toggle()}
      />
    </div>
  )
}

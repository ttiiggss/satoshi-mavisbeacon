"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { Keyboard, Trophy } from "lucide-react"

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const getThemeColor = () => {
    return theme === "dark" ? "text-neutral-400 hover:text-neutral-300" : "text-neutral-600 hover:text-neutral-800"
  }

  const getActiveBgColor = () => {
    return theme === "dark" ? "bg-neutral-800" : "bg-neutral-200"
  }

  return (
    <div className="flex justify-center mb-8">
      <div className={cn("flex border", theme === "dark" ? "border-neutral-800" : "border-neutral-200")}>
        <NavButton
          active={activeTab === "typing"}
          onClick={() => onTabChange("typing")}
          icon={<Keyboard size={16} />}
          label="Typing Test"
          theme={theme}
          getThemeColor={getThemeColor}
          getActiveBgColor={getActiveBgColor}
        />
        <NavButton
          active={activeTab === "leaderboard"}
          onClick={() => onTabChange("leaderboard")}
          icon={<Trophy size={16} />}
          label="Leaderboard"
          theme={theme}
          getThemeColor={getThemeColor}
          getActiveBgColor={getActiveBgColor}
        />
      </div>
    </div>
  )
}

interface NavButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  theme: string | undefined
  getThemeColor: () => string
  getActiveBgColor: () => string
}

function NavButton({ active, onClick, icon, label, theme, getThemeColor, getActiveBgColor }: NavButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-sm",
        getThemeColor(),
        active ? getActiveBgColor() : "bg-transparent",
        theme === "dark" ? "border-neutral-800" : "border-neutral-200",
        "relative",
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {icon}
      <span>{label}</span>
      {active && (
        <motion.div
          className={cn(
            "absolute bottom-0 left-0 right-0 h-0.5",
            theme === "dark" ? "bg-neutral-400" : "bg-neutral-600",
          )}
          layoutId="activeTab"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </motion.button>
  )
}

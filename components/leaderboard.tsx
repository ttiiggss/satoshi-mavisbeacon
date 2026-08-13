"use client"

import { useState, useEffect } from "react"
import { fetchTopScores, type TypingScore } from "@/lib/nostr"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { Trophy, RefreshCw, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Leaderboard() {
  const [scores, setScores] = useState<TypingScore[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { theme } = useTheme()

  const loadScores = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const topScores = await fetchTopScores(10)
      setScores(topScores)
    } catch (err) {
      console.error("Error fetching scores:", err)
      setError("Failed to load leaderboard")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadScores()
  }, [])

  const getThemeColor = () => {
    return theme === "dark" ? "text-neutral-400" : "text-neutral-600"
  }

  const getThemeBgColor = () => {
    return theme === "dark" ? "bg-neutral-800" : "bg-neutral-100"
  }

  const getThemeBorderColor = () => {
    return theme === "dark" ? "border-neutral-700" : "border-neutral-200"
  }

  return (
    <div className="w-full max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy size={20} className={getThemeColor()} />
          <h2 className={cn("text-xl font-medium", getThemeColor())}>Leaderboard</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadScores}
          disabled={isLoading}
          className={cn("text-xs", getThemeColor())}
        >
          <RefreshCw size={14} className={cn("mr-1", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {error && <div className="text-theme-error text-center py-4">{error}</div>}

      {isLoading && !error ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-muted-foreground">Loading scores...</div>
        </div>
      ) : (
        <div className={cn("border rounded-none", getThemeBorderColor())}>
          <div
            className={cn(
              "grid grid-cols-12 py-2 px-4 text-xs uppercase tracking-wider text-muted-foreground",
              getThemeBgColor(),
            )}
          >
            <div className="col-span-1">#</div>
            <div className="col-span-5">User</div>
            <div className="col-span-3 text-right">WPM</div>
            <div className="col-span-3 text-right">Accuracy</div>
          </div>

          {scores.length === 0 && !isLoading ? (
            <div className="py-8 text-center text-muted-foreground">No scores yet. Be the first to submit!</div>
          ) : (
            <div>
              {scores.map((score, index) => (
                <motion.div
                  key={score.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={cn(
                    "grid grid-cols-12 py-3 px-4 border-t",
                    getThemeBorderColor(),
                    index === 0 && "bg-opacity-10 " + getThemeBgColor(),
                  )}
                >
                  <div className="col-span-1 font-medium">{index + 1}</div>
                  <div className="col-span-5 flex items-center gap-2">
                    {score.picture ? (
                      <img
                        src={score.picture || "/placeholder.svg"}
                        alt={score.name || "User"}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          // If image fails to load, replace with user icon
                          e.currentTarget.style.display = "none"
                          e.currentTarget.nextElementSibling?.classList.remove("hidden")
                        }}
                      />
                    ) : null}
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        theme === "dark" ? "bg-neutral-800" : "bg-neutral-200",
                        score.picture ? "hidden" : "",
                      )}
                    >
                      <User size={16} className={getThemeColor()} />
                    </div>
                    <span className="truncate font-medium">{score.name || "Anonymous"}</span>
                  </div>
                  <div className="col-span-3 text-right font-mono font-medium">{score.wpm}</div>
                  <div className="col-span-3 text-right font-mono">{score.accuracy}%</div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

"use client"

import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { Lock, Check, Star } from "lucide-react"
import type { Quote } from "@/lib/quotes"

interface LevelPickerProps {
  levels: Quote[]
  unlockedLevel: number
  completed: number[]
  bestWpm: Record<number, number>
  onSelect: (level: Quote) => void
  onReset: () => void
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00")
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export default function LevelPicker({
  levels,
  unlockedLevel,
  completed,
  bestWpm,
  onSelect,
  onReset,
}: LevelPickerProps) {
  const { theme } = useTheme()
  const dark = theme === "dark"

  const completedCount = completed.length
  const progressPct = Math.round((completedCount / levels.length) * 100)

  return (
    <div className="w-full flex flex-col items-center gap-6 py-4">
      {/* Progress summary */}
      <div className="w-full flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className={cn("uppercase tracking-wider text-xs", dark ? "text-neutral-400" : "text-neutral-600")}>
            Progress
          </span>
          <span className={cn("text-xs", dark ? "text-neutral-400" : "text-neutral-600")}>
            {completedCount} / {levels.length} levels ({progressPct}%)
          </span>
        </div>
        <div className={cn("h-1.5 w-full rounded-full overflow-hidden", dark ? "bg-neutral-800" : "bg-neutral-200")}>
          <div
            className={cn("h-full transition-all duration-500", dark ? "bg-neutral-400" : "bg-neutral-700")}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Level grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {levels.map((level) => {
          const unlocked = level.id <= unlockedLevel
          const done = completed.includes(level.id)
          const best = bestWpm[level.id]

          return (
            <motion.button
              key={level.id}
              onClick={() => unlocked && onSelect(level)}
              disabled={!unlocked}
              whileHover={unlocked ? { scale: 1.01 } : undefined}
              whileTap={unlocked ? { scale: 0.99 } : undefined}
              className={cn(
                "text-left p-4 rounded-lg border transition-colors",
                !unlocked && "cursor-not-allowed opacity-50",
                dark
                  ? done
                    ? "border-neutral-700 bg-neutral-900/60 hover:border-neutral-500"
                    : unlocked
                      ? "border-neutral-800 bg-neutral-900/40 hover:border-neutral-600"
                      : "border-neutral-900 bg-neutral-900/20"
                  : done
                    ? "border-neutral-300 bg-neutral-100 hover:border-neutral-400"
                    : unlocked
                      ? "border-neutral-200 bg-white hover:border-neutral-400"
                      : "border-neutral-200 bg-neutral-50",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      "flex h-7 w-12 shrink-0 items-center justify-center rounded-full text-xs font-medium tabular-nums",
                      dark ? "bg-neutral-800 text-neutral-300" : "bg-neutral-200 text-neutral-700",
                    )}
                  >
                    {level.id}/{levels.length}
                  </span>
                  <span className={cn("text-xs uppercase tracking-wider", dark ? "text-neutral-500" : "text-neutral-500")}>
                    {formatDate(level.date)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {done && (
                    <span className="flex items-center gap-1 text-xs">
                      <Star size={12} className="fill-current text-amber-500" />
                      <span className={dark ? "text-neutral-300" : "text-neutral-700"}>{best}</span>
                      <span className={dark ? "text-neutral-500" : "text-neutral-500"}>wpm</span>
                    </span>
                  )}
                  {done ? (
                    <Check size={16} className={dark ? "text-emerald-500" : "text-emerald-600"} />
                  ) : !unlocked ? (
                    <Lock size={14} className={dark ? "text-neutral-600" : "text-neutral-400"} />
                  ) : null}
                </div>
              </div>

              <p
                className={cn(
                  "mt-3 text-sm leading-snug line-clamp-2",
                  dark ? "text-neutral-300" : "text-neutral-700",
                )}
              >
                {level.text}
              </p>
              <p className={cn("mt-2 text-[11px] truncate", dark ? "text-neutral-600" : "text-neutral-400")}>
                {level.source}
              </p>
            </motion.button>
          )
        })}
      </div>

      {completedCount > 0 && (
        <button
          onClick={onReset}
          className={cn(
            "mt-2 text-xs uppercase tracking-wider underline-offset-4 hover:underline",
            dark ? "text-neutral-500 hover:text-neutral-300" : "text-neutral-500 hover:text-neutral-700",
          )}
        >
          Reset progress
        </button>
      )}
    </div>
  )
}

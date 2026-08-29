"use client"

import { useCallback, useEffect, useState } from "react"
import { levels } from "@/lib/quotes"

const STORAGE_KEY = "satoshiLevelsProgress"

export interface LevelProgress {
  completed: number[] // level ids the user has finished
  bestWpm: Record<number, number> // best wpm per level id
}

interface StoredProgress extends LevelProgress {
  unlockedLevel: number // highest unlocked level id (1-indexed)
}

function loadProgress(): StoredProgress {
  if (typeof window === "undefined") {
    return { completed: [], bestWpm: {}, unlockedLevel: 1 }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { completed: [], bestWpm: {}, unlockedLevel: 1 }
    const parsed = JSON.parse(raw) as Partial<StoredProgress>
    const completed = Array.isArray(parsed.completed) ? parsed.completed : []
    const bestWpm = parsed.bestWpm && typeof parsed.bestWpm === "object" ? parsed.bestWpm : {}
    // unlockedLevel is derived: one past the longest contiguous run of completed
    // levels starting from 1, but never less than 1.
    let unlocked = 1
    const completedSet = new Set(completed)
    for (const lvl of levels) {
      if (completedSet.has(lvl.id)) unlocked = Math.max(unlocked, lvl.id + 1)
      else break
    }
    return { completed, bestWpm, unlockedLevel: Math.min(unlocked, levels.length) }
  } catch {
    return { completed: [], bestWpm: {}, unlockedLevel: 1 }
  }
}

function saveProgress(progress: StoredProgress) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function useLevels() {
  const [progress, setProgress] = useState<StoredProgress>(() => ({
    completed: [],
    bestWpm: {},
    unlockedLevel: 1,
  }))
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setProgress(loadProgress())
    setMounted(true)
  }, [])

  const isUnlocked = useCallback(
    (levelId: number) => levelId <= progress.unlockedLevel,
    [progress.unlockedLevel],
  )

  const isCompleted = useCallback(
    (levelId: number) => progress.completed.includes(levelId),
    [progress.completed],
  )

  const completeLevel = useCallback((levelId: number, wpm: number) => {
    setProgress((prev) => {
      const completed = prev.completed.includes(levelId)
        ? prev.completed
        : [...prev.completed, levelId].sort((a, b) => a - b)
      const prevBest = prev.bestWpm[levelId] ?? 0
      const bestWpm = {
        ...prev.bestWpm,
        [levelId]: Math.max(prevBest, wpm),
      }
      // recompute unlockedLevel
      let unlocked = 1
      const completedSet = new Set(completed)
      for (const lvl of levels) {
        if (completedSet.has(lvl.id)) unlocked = Math.max(unlocked, lvl.id + 1)
        else break
      }
      const next: StoredProgress = {
        completed,
        bestWpm,
        unlockedLevel: Math.min(unlocked, levels.length),
      }
      saveProgress(next)
      return next
    })
  }, [])

  const resetProgress = useCallback(() => {
    const fresh: StoredProgress = { completed: [], bestWpm: {}, unlockedLevel: 1 }
    saveProgress(fresh)
    setProgress(fresh)
  }, [])

  return {
    mounted,
    levels,
    completed: progress.completed,
    bestWpm: progress.bestWpm,
    unlockedLevel: progress.unlockedLevel,
    isUnlocked,
    isCompleted,
    completeLevel,
    resetProgress,
  }
}

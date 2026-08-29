"use client"

import { useState, useEffect } from "react"
import { levels } from "@/lib/quotes"
import type { Quote } from "@/lib/quotes"
import TypingTest from "@/components/typing-test"
import LevelPicker from "@/components/level-picker"
import { ThemeProvider } from "@/components/theme-provider"
import NostrLogin from "@/components/nostr-login"
import Leaderboard from "@/components/leaderboard"
import Navigation from "@/components/navigation"
import ThemeToggle from "@/components/theme-toggle"
import { useLevels } from "@/hooks/use-levels"
import type { NostrProfile } from "@/lib/nostr"

export default function Home() {
  const [activeTab, setActiveTab] = useState("typing")
  const [userProfile, setUserProfile] = useState<NostrProfile | null>(null)
  const [mounted, setMounted] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<Quote | null>(null)

  const {
    mounted: levelsMounted,
    completed,
    bestWpm,
    unlockedLevel,
    isUnlocked,
    completeLevel,
    resetProgress,
  } = useLevels()

  // Handle user login
  const handleLogin = (profile: NostrProfile) => {
    setUserProfile(profile)
    localStorage.setItem("nostrProfile", JSON.stringify(profile))
  }

  // Handle user logout
  const handleLogout = () => {
    setUserProfile(null)
    localStorage.removeItem("nostrProfile")
  }

  // Load saved profile on mount
  useEffect(() => {
    setMounted(true)
    const savedProfile = localStorage.getItem("nostrProfile")
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile))
      } catch (e) {
        console.error("Failed to parse saved profile", e)
        localStorage.removeItem("nostrProfile")
      }
    }
  }, [])

  const handleSelectLevel = (level: Quote) => {
    if (!isUnlocked(level.id)) return
    setSelectedLevel(level)
  }

  const handleBackToLevels = () => {
    setSelectedLevel(null)
  }

  const handleNext = () => {
    if (!selectedLevel) return
    const nextLevel = levels.find((l) => l.id === selectedLevel.id + 1)
    if (nextLevel && isUnlocked(nextLevel.id)) {
      setSelectedLevel(nextLevel)
    }
  }

  const handleComplete = (levelId: number, wpm: number) => {
    completeLevel(levelId, wpm)
  }

  if (!mounted) return null

  const renderTypingContent = () => {
    // Wait for level progress to load from localStorage before rendering
    if (!levelsMounted) return null

    if (selectedLevel) {
      const hasNext =
        !!levels.find((l) => l.id === selectedLevel.id + 1) &&
        isUnlocked(selectedLevel.id + 1)
      return (
        <TypingTest
          key={selectedLevel.id}
          level={selectedLevel}
          levelNumber={selectedLevel.id}
          totalLevels={levels.length}
          hasNext={hasNext}
          userProfile={userProfile}
          completedCount={completed.length}
          bestWpm={bestWpm}
          onComplete={handleComplete}
          onNext={handleNext}
          onBack={handleBackToLevels}
        />
      )
    }

    return (
      <LevelPicker
        levels={levels}
        unlockedLevel={unlockedLevel}
        completed={completed}
        bestWpm={bestWpm}
        onSelect={handleSelectLevel}
        onReset={resetProgress}
      />
    )
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme={null} enableSystem={false}>
      <main className="flex min-h-screen flex-col items-center p-4 md:p-24 bg-background">
        <div className="w-full max-w-3xl">
          {/* Header with login and theme toggle */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-medium">Satoshi MavisBeacon</h1>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <NostrLogin onLogin={handleLogin} onLogout={handleLogout} profile={userProfile} />
            </div>
          </div>

          {/* Navigation */}
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Content */}
          {activeTab === "typing" ? renderTypingContent() : <Leaderboard />}
        </div>
      </main>
    </ThemeProvider>
  )
}

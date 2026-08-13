"use client"

import { useState, useEffect } from "react"
import { quotes } from "@/lib/quotes"
import TypingTest from "@/components/typing-test"
import { ThemeProvider } from "@/components/theme-provider"
import NostrLogin from "@/components/nostr-login"
import Leaderboard from "@/components/leaderboard"
import Navigation from "@/components/navigation"
import ThemeToggle from "@/components/theme-toggle"
import type { NostrProfile } from "@/lib/nostr"

export default function Home() {
  const [activeTab, setActiveTab] = useState("typing")
  const [userProfile, setUserProfile] = useState<NostrProfile | null>(null)
  const [mounted, setMounted] = useState(false)

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

  if (!mounted) return null

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
          {activeTab === "typing" ? <TypingTest quotes={quotes} userProfile={userProfile} /> : <Leaderboard />}
        </div>
      </main>
    </ThemeProvider>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { hasNostrExtension, loginWithNostr, type NostrProfile } from "@/lib/nostr"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { User, LogOut } from "lucide-react"

interface NostrLoginProps {
  onLogin: (profile: NostrProfile) => void
  onLogout: () => void
  profile: NostrProfile | null
}

export default function NostrLogin({ onLogin, onLogout, profile }: NostrLoginProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [hasExtension, setHasExtension] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setHasExtension(hasNostrExtension())
  }, [])

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      const profile = await loginWithNostr()
      if (profile) {
        onLogin(profile)
      }
    } catch (error) {
      console.error("Login failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    onLogout()
  }

  const getThemeColor = () => {
    return theme === "dark" ? "text-neutral-400 hover:text-neutral-300" : "text-neutral-600 hover:text-neutral-800"
  }

  if (profile) {
    return (
      <div className="flex items-center gap-2">
        {profile.picture ? (
          <img
            src={profile.picture || "/placeholder.svg"}
            alt={profile.name || "User"}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              theme === "dark" ? "bg-neutral-800" : "bg-neutral-200",
            )}
          >
            <User size={16} className={getThemeColor()} />
          </div>
        )}
        <div className="flex flex-col">
          <span className={cn("text-sm font-medium", getThemeColor())}>
            {profile.name || profile.displayName || profile.npub.slice(0, 8) + "..."}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className={cn("h-6 px-2 text-xs flex items-center gap-1", getThemeColor())}
          >
            <LogOut size={12} />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {hasExtension ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogin}
          disabled={isLoading}
          className={cn("text-xs uppercase tracking-wider", getThemeColor())}
        >
          {isLoading ? "Connecting..." : "Login with Nostr"}
        </Button>
      ) : (
        <div className="text-xs text-muted-foreground">
          <a
            href="https://getalby.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn("underline", getThemeColor())}
          >
            Get a Nostr extension
          </a>
        </div>
      )}
    </motion.div>
  )
}

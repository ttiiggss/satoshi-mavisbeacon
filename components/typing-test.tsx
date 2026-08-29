"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { type NostrProfile, publishScore, fetchTopScores, type TypingScore } from "@/lib/nostr"
import { type Quote } from "@/lib/quotes"
import { Trophy, AlertCircle, ArrowLeft, ArrowRight, Info, Star, User } from "lucide-react"

interface TypingTestProps {
  level: Quote
  levelNumber: number
  totalLevels: number
  hasNext: boolean
  userProfile: NostrProfile | null
  completedCount: number
  bestWpm: Record<number, number>
  onComplete: (levelId: number, wpm: number) => void
  onNext: () => void
  onBack: () => void
}

export default function TypingTest({
  level,
  levelNumber,
  totalLevels,
  hasNext,
  userProfile,
  completedCount,
  bestWpm,
  onComplete,
  onNext,
  onBack,
}: TypingTestProps) {
  const [currentQuote, setCurrentQuote] = useState(level.text)
  const [userInput, setUserInput] = useState("")
  const [startTime, setStartTime] = useState<number | null>(null)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [wpm, setWpm] = useState(0)
  const [liveWpm, setLiveWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [isFinished, setIsFinished] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const [currentPosition, setCurrentPosition] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState<boolean | null>(null)
  const [showBackstory, setShowBackstory] = useState(false)
  const [isPersonalBest, setIsPersonalBest] = useState(false)
  const [levelScores, setLevelScores] = useState<TypingScore[]>([])
  const [levelScoresLoading, setLevelScoresLoading] = useState(false)
  const [fontSize, setFontSize] = useState(18) // Default font size in pixels
  // Track the best WPM this user had on this level *before* the current run,
  // so we can detect a personal best at completion time. Updated whenever the
  // level changes (before any keystrokes for the new level could land).
  const previousBestRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const textContainerRef = useRef<HTMLDivElement>(null)
  const wpmIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioBufferRef = useRef<AudioBuffer | null>(null)
  const { theme } = useTheme()
  const [cursorStyle, setCursorStyle] = useState({
    left: 0,
    top: 0,
    height: 0,
  })

  // Handle mounted state to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load typewriter sound
  useEffect(() => {
    const loadSound = async () => {
      try {
        const ctx = new AudioContext()
        const response = await fetch("/typewriter.wav")
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
        audioContextRef.current = ctx
        audioBufferRef.current = audioBuffer
      } catch (e) {
        console.error("Failed to load typewriter sound:", e)
      }
    }
    loadSound()
  }, [])

  // Play typewriter click sound
  const playClick = () => {
    if (audioContextRef.current && audioBufferRef.current) {
      const ctx = audioContextRef.current
      if (ctx.state === "suspended") {
        ctx.resume()
      }
      const source = ctx.createBufferSource()
      source.buffer = audioBufferRef.current
      source.connect(ctx.destination)
      source.start(0)
    }
  }

  // Update cursor position
  useEffect(() => {
    if (textContainerRef.current) {
      const textContainer = textContainerRef.current
      const chars = textContainer.querySelectorAll("span[data-char]")

      if (chars.length > 0 && currentPosition < chars.length) {
        const currentChar = chars[currentPosition]
        const rect = currentChar.getBoundingClientRect()
        const containerRect = textContainer.getBoundingClientRect()

        setCursorStyle({
          left: rect.left - containerRect.left,
          top: rect.top - containerRect.top,
          height: rect.height,
        })
      }
    }
  }, [currentPosition, currentQuote, userInput])

  // Initialize game for the current level
  const initGame = () => {
    setCurrentQuote(level.text)
    setUserInput("")
    setStartTime(null)
    setEndTime(null)
    setWpm(0)
    setLiveWpm(0)
    setShowBackstory(false)
    setAccuracy(100)
    setIsFinished(false)
    setIsStarted(false)
    setCurrentPosition(0)
    setCursorStyle({ left: 0, top: 0, height: 0 })
    setPublishSuccess(null)

    // Clear any existing interval
    if (wpmIntervalRef.current) {
      clearInterval(wpmIntervalRef.current)
      wpmIntervalRef.current = null
    }
  }

  // Start the game (re-initialize whenever the level changes)
  useEffect(() => {
    // Snapshot the user's prior best on this level *before* the run starts,
    // so completion can detect a personal best. bestWpm may update after
    // onComplete fires in the parent, but this ref captures the pre-run value.
    previousBestRef.current = bestWpm[level.id] ?? 0
    setIsPersonalBest(false)
    initGame()
    return () => {
      if (wpmIntervalRef.current) {
        clearInterval(wpmIntervalRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level.id])

  // Focus the container when loaded
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus()
    }
  }, [isFinished])

  // Fetch this level's leaderboard when the run finishes so we can show
  // the user's ranking against others on this exact level.
  useEffect(() => {
    if (!isFinished) return
    let cancelled = false
    const load = async () => {
      setLevelScoresLoading(true)
      try {
        const top = await fetchTopScores(10, level.id)
        if (!cancelled) setLevelScores(top)
      } catch (e) {
        console.error("Failed to load level leaderboard:", e)
      } finally {
        if (!cancelled) setLevelScoresLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [isFinished, level.id])

  // Calculate WPM
  const calculateWPM = () => {
    if (!startTime || !isStarted) return 0

    const timeInMinutes = (Date.now() - startTime) / 60000
    const wordCount = userInput.length / 5 // standard: 5 chars = 1 word

    if (timeInMinutes === 0) return 0
    return Math.round(wordCount / timeInMinutes)
  }

  // Update WPM in real-time
  useEffect(() => {
    if (isStarted && !isFinished) {
      // Clear any existing interval
      if (wpmIntervalRef.current) {
        clearInterval(wpmIntervalRef.current)
      }

      // Update WPM every second
      wpmIntervalRef.current = setInterval(() => {
        setLiveWpm(calculateWPM())
      }, 1000)

      // Calculate initial WPM
      setLiveWpm(calculateWPM())
    }

    return () => {
      if (wpmIntervalRef.current) {
        clearInterval(wpmIntervalRef.current)
      }
    }
  }, [isStarted, isFinished, userInput])

  // Adjust font size based on quote length
  useEffect(() => {
    if (currentQuote) {
      // Calculate font size based on quote length
      // This is a simple algorithm - you can adjust the thresholds as needed
      let newSize = 18 // Default size for normal quotes

      if (currentQuote.length > 500) {
        newSize = 14
      }
      if (currentQuote.length > 1000) {
        newSize = 12
      }
      if (currentQuote.length > 1500) {
        newSize = 10
      }

      // Don't go below 10px to maintain readability
      setFontSize(Math.max(10, newSize))
    }
  }, [currentQuote])

  // Handle keyboard input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ignore modifier keys and special keys
    if (
      e.ctrlKey ||
      e.altKey ||
      e.metaKey ||
      e.key === "Shift" ||
      e.key === "Control" ||
      e.key === "Alt" ||
      e.key === "Meta" ||
      e.key === "Tab" ||
      e.key === "CapsLock" ||
      e.key === "Escape"
    ) {
      return
    }

    // Prevent default behavior for most keys
    if (e.key !== "Backspace") {
      e.preventDefault()
    }

    // Start timer on first keystroke
    if (!isStarted && !startTime) {
      setStartTime(Date.now())
      setIsStarted(true)
    }

    // Handle backspace
    if (e.key === "Backspace" && currentPosition > 0) {
      e.preventDefault()
      playClick()
      setCurrentPosition(currentPosition - 1)
      setUserInput(userInput.slice(0, -1))
      return
    }

    // Ignore if we're at the end of the quote
    if (currentPosition >= currentQuote.length) {
      return
    }

    // Handle character input
    if (e.key.length === 1) {
      playClick()
      const newUserInput = userInput + e.key
      setUserInput(newUserInput)
      setCurrentPosition(currentPosition + 1)

      // Calculate accuracy
      let correctChars = 0
      for (let i = 0; i < newUserInput.length; i++) {
        if (i < currentQuote.length && newUserInput[i] === currentQuote[i]) {
          correctChars++
        }
      }
      const accuracyPercent = newUserInput.length > 0 ? Math.floor((correctChars / newUserInput.length) * 100) : 100
      setAccuracy(accuracyPercent)

      // Check if quote is completed
      if (newUserInput === currentQuote || currentPosition + 1 >= currentQuote.length) {
        setEndTime(Date.now())
        setIsFinished(true)

        // Set final WPM
        const finalWpm = calculateWPM()
        setWpm(finalWpm)

        // Detect personal best against the pre-run snapshot
        setIsPersonalBest(finalWpm > previousBestRef.current)

        // Notify parent so progress can be saved / next level unlocked
        onComplete(level.id, finalWpm)

        // Clear interval
        if (wpmIntervalRef.current) {
          clearInterval(wpmIntervalRef.current)
          wpmIntervalRef.current = null
        }
      }
    }
  }

  // Reset the game
  const resetGame = () => {
    initGame()
  }

  // Publish score to Nostr
  const handlePublishScore = async () => {
    if (!userProfile) return

    setIsPublishing(true)
    setPublishSuccess(null)

    try {
      const result = await publishScore(wpm, accuracy, level.id)
      setPublishSuccess(!!result)
    } catch (error) {
      console.error("Failed to publish score:", error)
      setPublishSuccess(false)
    } finally {
      setIsPublishing(false)
    }
  }

  // Get cursor color based on theme
  const getCursorColor = () => {
    return theme === "dark" ? "bg-blue-400" : "bg-blue-500"
  }

  // Get error text color based on theme
  const getErrorColor = () => {
    return "text-red-500"
  }

  // Get theme-specific text color
  const getThemeColor = () => {
    return theme === "dark" ? "text-neutral-400" : "text-neutral-600"
  }

  // If not mounted yet, don't render to avoid hydration mismatch
  if (!mounted) return null

  // Results Screen
  if (isFinished) {
    // Compute overall summary stats from the user's best-WPM map (which the
    // parent has already updated to include this run via onComplete).
    const wpmValues = Object.values(bestWpm)
    const avgWpm = wpmValues.length > 0 ? Math.round(wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length) : 0
    let bestLevelId = level.id
    let bestWpmOverall = wpm
    for (const [id, w] of Object.entries(bestWpm)) {
      if (w > bestWpmOverall) {
        bestWpmOverall = w
        bestLevelId = Number.parseInt(id)
      }
    }
    const progressPct = Math.round((completedCount / totalLevels) * 100)

    return (
      <div className="w-full h-[70vh] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-0 text-left">
          <div className="text-muted-foreground text-xl">wpm</div>
          <div className={cn("text-7xl font-normal", theme === "dark" ? "text-neutral-500" : "text-neutral-600")}>
            {wpm}
          </div>
          <div className="text-muted-foreground text-xl mt-6">acc</div>
          <div className={cn("text-7xl font-normal", theme === "dark" ? "text-neutral-500" : "text-neutral-600")}>
            {accuracy}%
          </div>
        </div>

        {/* Overall summary */}
        <div
          className={cn(
            "mt-8 w-full max-w-md rounded-lg border px-5 py-4",
            theme === "dark" ? "border-neutral-800 bg-neutral-900/40" : "border-neutral-200 bg-neutral-50",
          )}
        >
          <div className={cn("text-[11px] uppercase tracking-wider mb-3", theme === "dark" ? "text-neutral-600" : "text-neutral-400")}>
            Overall summary
          </div>

          {/* Levels completed + progress bar */}
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className={theme === "dark" ? "text-neutral-400" : "text-neutral-600"}>Levels completed</span>
            <span className={cn("font-mono font-medium", theme === "dark" ? "text-neutral-300" : "text-neutral-700")}>
              {completedCount} / {totalLevels}
            </span>
          </div>
          <div className={cn("h-1.5 w-full rounded-full overflow-hidden mb-4", theme === "dark" ? "bg-neutral-800" : "bg-neutral-200")}>
            <div
              className={cn("h-full transition-all duration-500", theme === "dark" ? "bg-neutral-400" : "bg-neutral-700")}
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Avg + Best WPM */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className={cn("text-[11px] uppercase tracking-wider", theme === "dark" ? "text-neutral-600" : "text-neutral-400")}>
                Avg WPM
              </div>
              <div className={cn("font-mono font-medium text-lg", theme === "dark" ? "text-neutral-300" : "text-neutral-700")}>
                {avgWpm}
              </div>
            </div>
            <div>
              <div className={cn("text-[11px] uppercase tracking-wider", theme === "dark" ? "text-neutral-600" : "text-neutral-400")}>
                Best WPM
              </div>
              <div className={cn("font-mono font-medium text-lg", theme === "dark" ? "text-neutral-300" : "text-neutral-700")}>
                {bestWpmOverall}
                <span className={cn("text-xs font-normal ml-1.5", theme === "dark" ? "text-neutral-600" : "text-neutral-400")}>
                  L{bestLevelId}
                </span>
              </div>
            </div>
          </div>

          {/* Personal best badge */}
          {isPersonalBest && (
            <div className="mt-4 flex items-center gap-1.5 text-sm text-amber-500">
              <Star size={14} className="fill-current" />
              <span>New personal best on this level!</span>
            </div>
          )}
        </div>

        {/* Publish score button (only if logged in) */}
        {userProfile && (
          <div className="mt-8 mb-4">
            <Button
              onClick={handlePublishScore}
              disabled={isPublishing || publishSuccess === true}
              variant="outline"
              className={cn("flex items-center gap-2", getThemeColor())}
            >
              <Trophy size={16} />
              {isPublishing ? "Publishing..." : publishSuccess === true ? "Score Published!" : "Publish to Leaderboard"}
            </Button>

            {publishSuccess === false && (
              <div className="flex items-center gap-1 mt-2 text-sm text-theme-error">
                <AlertCircle size={14} />
                <span>Failed to publish score. Please try again.</span>
              </div>
            )}
          </div>
        )}

        {/* Inline leaderboard for this level */}
        <div
          className={cn(
            "mt-6 w-full max-w-md rounded-lg border px-5 py-4",
            theme === "dark" ? "border-neutral-800 bg-neutral-900/40" : "border-neutral-200 bg-neutral-50",
          )}
        >
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={14} className={theme === "dark" ? "text-neutral-500" : "text-neutral-500"} />
            <span className={cn("text-[11px] uppercase tracking-wider", theme === "dark" ? "text-neutral-600" : "text-neutral-400")}>
              Level {levelNumber} leaderboard
            </span>
          </div>

          {levelScoresLoading ? (
            <div className="py-3 text-center text-xs text-muted-foreground animate-pulse">Loading rankings...</div>
          ) : levelScores.length === 0 ? (
            <div className="py-3 text-center text-xs text-muted-foreground">
              No scores for this level yet. Publish yours to claim #1!
            </div>
          ) : (
            <div className="flex flex-col">
              {levelScores.map((score, index) => {
                const isYou = userProfile?.pubkey === score.pubkey
                return (
                  <div
                    key={score.id}
                    className={cn(
                      "grid grid-cols-12 items-center gap-2 py-1.5 text-sm",
                      index > 0 && (theme === "dark" ? "border-t border-neutral-800" : "border-t border-neutral-200"),
                      isYou && (theme === "dark" ? "bg-neutral-800/50" : "bg-neutral-200/50"),
                    )}
                  >
                    <div className="col-span-1 text-xs font-medium">{index + 1}</div>
                    <div className="col-span-7 flex items-center gap-2 min-w-0">
                      {score.picture ? (
                        <img
                          src={score.picture}
                          alt={score.name || "User"}
                          className="w-5 h-5 rounded-full object-cover shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                            e.currentTarget.nextElementSibling?.classList.remove("hidden")
                          }}
                        />
                      ) : null}
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                          theme === "dark" ? "bg-neutral-800" : "bg-neutral-200",
                          score.picture ? "hidden" : "",
                        )}
                      >
                        <User size={11} className={theme === "dark" ? "text-neutral-500" : "text-neutral-500"} />
                      </div>
                      <span className="truncate text-xs">
                        {score.name || "Anonymous"}
                        {isYou && <span className="ml-1 text-[10px] uppercase tracking-wider text-amber-500">you</span>}
                      </span>
                    </div>
                    <div className="col-span-4 text-right font-mono text-xs font-medium">{score.wpm}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <Button
            onClick={resetGame}
            variant="ghost"
            className={cn("text-sm uppercase tracking-wider", getThemeColor())}
          >
            start over
          </Button>
          <Button
            onClick={onBack}
            variant="ghost"
            className={cn("flex items-center gap-1.5 text-sm uppercase tracking-wider", getThemeColor())}
          >
            <ArrowLeft size={14} />
            levels
          </Button>
          {hasNext && (
            <Button
              onClick={onNext}
              variant="default"
              className="flex items-center gap-1.5 text-sm uppercase tracking-wider"
            >
              next level
              <ArrowRight size={14} />
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col items-center gap-3 py-8 px-4">
      {/* Level header */}
      <div className="w-full max-w-3xl flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className={cn(
            "flex items-center gap-1.5 text-xs uppercase tracking-wider shrink-0",
            theme === "dark" ? "text-neutral-500 hover:text-neutral-300" : "text-neutral-500 hover:text-neutral-700",
          )}
        >
          <ArrowLeft size={14} />
          levels
        </button>
        <div className="flex flex-col items-center text-center min-w-0">
          <span className={cn("text-xs uppercase tracking-wider", getThemeColor())}>
            Level {levelNumber} / {totalLevels}
          </span>
          <span className={cn("text-[11px] mt-0.5 truncate max-w-full", theme === "dark" ? "text-neutral-600" : "text-neutral-400")}>
            {new Date(level.date + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · {level.source}
          </span>
        </div>
        <button
          onClick={() => setShowBackstory((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 text-xs uppercase tracking-wider shrink-0",
            theme === "dark" ? "text-neutral-500 hover:text-neutral-300" : "text-neutral-500 hover:text-neutral-700",
            showBackstory && (theme === "dark" ? "text-neutral-300" : "text-neutral-700"),
          )}
          aria-expanded={showBackstory}
          aria-controls="backstory-panel"
        >
          <Info size={14} />
          about
        </button>
      </div>

      {/* Backstory panel */}
      {showBackstory && (
        <div
          id="backstory-panel"
          className={cn(
            "w-full max-w-3xl rounded-lg border p-4 text-sm leading-relaxed",
            theme === "dark" ? "border-neutral-800 bg-neutral-900/40 text-neutral-300" : "border-neutral-200 bg-neutral-50 text-neutral-700",
          )}
        >
          <div className={cn("text-[11px] uppercase tracking-wider mb-2", theme === "dark" ? "text-neutral-600" : "text-neutral-400")}>
            About this quote
          </div>
          <p>{level.backstory}</p>
        </div>
      )}

      {/* Interactive quote display - no background, no borders */}
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="w-full max-w-3xl h-80 overflow-y-auto focus:outline-none focus:ring-0 border border-border p-4"
      >
        <div ref={textContainerRef} className="relative leading-relaxed" style={{ fontSize: `${fontSize}px` }}>
          {/* Cursor */}
          <span
            className={cn("absolute w-0.5 will-change-transform", getCursorColor(), isStarted ? "" : "animate-cursor")}
            style={{
              left: `${cursorStyle.left}px`,
              top: `${cursorStyle.top}px`,
              height: `${cursorStyle.height}px`,
              transition: "all 30ms cubic-bezier(0.25, 0.1, 0.25, 1.0)",
            }}
          />

          {/* Text */}
          {currentQuote.split("").map((char, index) => {
            let style = "opacity-40" // Default untyped style

            if (index < userInput.length) {
              // Typed characters
              if (userInput[index] === char) {
                style = "opacity-100" // Correct
              } else {
                style = cn(getErrorColor(), "opacity-100") // Incorrect
              }
            }

            return (
              <span key={index} data-char={index} className={style}>
                {char}
              </span>
            )
          })}
        </div>
      </div>

      {/* Live WPM counter */}
      <div className={cn("text-sm mt-4 flex items-center gap-1.5 h-5", getThemeColor())}>
        {isStarted && !isFinished ? (
          <>
            <span className="font-medium">{liveWpm}</span>
            <span className="uppercase text-xs tracking-wider">wpm</span>
          </>
        ) : (
          <span className="text-xs uppercase tracking-wider">{!isStarted ? "click and start typing" : ""}</span>
        )}
      </div>

      {/* Reset button - minimal style */}
      <Button
        onClick={resetGame}
        variant="ghost"
        size="sm"
        className={cn("mt-2 text-xs uppercase tracking-wider", getThemeColor())}
      >
        Reset
      </Button>
    </div>
  )
}

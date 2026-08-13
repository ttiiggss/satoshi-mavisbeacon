"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { type NostrProfile, publishScore } from "@/lib/nostr"
import { Trophy, AlertCircle } from "lucide-react"

interface TypingTestProps {
  quotes: string[]
  userProfile: NostrProfile | null
}

export default function TypingTest({ quotes, userProfile }: TypingTestProps) {
  const [currentQuote, setCurrentQuote] = useState("")
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
  const [fontSize, setFontSize] = useState(18) // Default font size in pixels
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

  // Get a random quote
  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length)
    return quotes[randomIndex]
  }

  // Initialize game
  const initGame = () => {
    setCurrentQuote(getRandomQuote())
    setUserInput("")
    setStartTime(null)
    setEndTime(null)
    setWpm(0)
    setLiveWpm(0)
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

  // Start the game
  useEffect(() => {
    initGame()
    return () => {
      if (wpmIntervalRef.current) {
        clearInterval(wpmIntervalRef.current)
      }
    }
  }, [])

  // Focus the container when loaded
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus()
    }
  }, [isFinished])

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
        setWpm(calculateWPM())

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
      const result = await publishScore(wpm, accuracy)
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

        <div className="flex gap-4 mt-8">
          <Button
            onClick={resetGame}
            variant="ghost"
            className={cn("text-sm uppercase tracking-wider", getThemeColor())}
          >
            start over
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col items-center gap-3 py-8 px-4">
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

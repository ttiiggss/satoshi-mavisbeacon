import { SimplePool, type Event, nip19 } from "nostr-tools"

// Event kinds
export const SCORE_EVENT_KIND = 30017 // Custom event kind for typing scores

// Create a pool for Nostr relay connections
const pool = new SimplePool()

// Default relays to connect to
const DEFAULT_RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.nostr.band",
  "wss://nos.lol",
  "wss://relay.current.fyi",
  "wss://relay.snort.social",
]

// Interface for user profile
export interface NostrProfile {
  pubkey: string
  npub: string
  name?: string
  displayName?: string
  picture?: string
  about?: string
  nip05?: string
}

// Interface for typing score
export interface TypingScore {
  id: string
  pubkey: string
  npub: string
  name?: string
  picture?: string
  wpm: number
  accuracy: number
  timestamp: number
  levelId?: number
}

// Cache for user profiles to avoid repeated fetches
const profileCache = new Map<string, Partial<NostrProfile>>()

// Check if NIP-07 extension is available
export const hasNostrExtension = (): boolean => {
  return typeof window !== "undefined" && window.nostr !== undefined
}

// Login with Nostr extension (NIP-07)
export const loginWithNostr = async (): Promise<NostrProfile | null> => {
  try {
    if (!hasNostrExtension()) {
      throw new Error("Nostr extension not found")
    }

    // Request public key from extension
    const pubkey = await window.nostr.getPublicKey()
    if (!pubkey) {
      throw new Error("Failed to get public key")
    }

    // Convert to npub format
    const npub = nip19.npubEncode(pubkey)

    // Fetch user profile
    const profile = await fetchUserProfile(pubkey)

    return {
      pubkey,
      npub,
      ...profile,
    }
  } catch (error) {
    console.error("Login error:", error)
    return null
  }
}

// Fetch user profile metadata
export const fetchUserProfile = async (pubkey: string): Promise<Partial<NostrProfile>> => {
  try {
    // Check cache first
    if (profileCache.has(pubkey)) {
      return profileCache.get(pubkey) || {}
    }

    // Create a filter for the user's metadata event
    const filter = {
      kinds: [0],
      authors: [pubkey],
      limit: 1,
    }

    let events: Event[] = []
    try {
      // Try different methods based on the available API
      if (typeof pool.list === "function") {
        events = await pool.list(DEFAULT_RELAYS, [filter])
        if (events.length > 0) {
          const event = events[0]
          try {
            const content = JSON.parse(event.content)
            const profile = {
              name: content.name || content.username || "Anonymous",
              displayName: content.display_name || content.displayName || content.name || "Anonymous",
              picture: content.picture || "",
              about: content.about || "",
              nip05: content.nip05 || "",
            }

            // Cache the profile
            profileCache.set(pubkey, profile)
            return profile
          } catch (e) {
            console.error("Error parsing profile content:", e)
          }
        }
      } else {
        // Try the get method for newer versions
        const event = await pool.get(DEFAULT_RELAYS, filter)
        if (event) {
          try {
            const content = JSON.parse(event.content)
            const profile = {
              name: content.name || content.username || "Anonymous",
              displayName: content.display_name || content.displayName || content.name || "Anonymous",
              picture: content.picture || "",
              about: content.about || "",
              nip05: content.nip05 || "",
            }

            // Cache the profile
            profileCache.set(pubkey, profile)
            return profile
          } catch (e) {
            console.error("Error parsing profile content:", e)
          }
        }
      }
    } catch (e) {
      console.error("Error fetching profile:", e)
    }

    // Default profile if nothing was found
    const defaultProfile = { name: "Anonymous", displayName: "Anonymous" }
    profileCache.set(pubkey, defaultProfile)
    return defaultProfile
  } catch (error) {
    console.error("Error fetching profile:", error)
    return { name: "Anonymous", displayName: "Anonymous" }
  }
}

// Publish a typing score to Nostr
export const publishScore = async (
  wpm: number,
  accuracy: number,
  levelId?: number,
): Promise<string | null> => {
  try {
    if (!hasNostrExtension()) {
      throw new Error("Nostr extension not found")
    }

    const tags: string[][] = [
      ["t", "typing-test"],
      ["wpm", wpm.toString()],
      ["accuracy", accuracy.toString()],
    ]
    if (levelId !== undefined) {
      tags.push(["level", levelId.toString()])
    }

    const event: Partial<Event> = {
      kind: SCORE_EVENT_KIND,
      created_at: Math.floor(Date.now() / 1000),
      tags,
      content: JSON.stringify({
        wpm,
        accuracy,
        app: "typing-game",
        ...(levelId !== undefined ? { levelId } : {}),
      }),
    }

    // Sign the event with the extension
    const signedEvent = await window.nostr.signEvent(event)

    // Publish to relays
    const pubs = pool.publish(DEFAULT_RELAYS, signedEvent)

    // Wait for at least one relay to accept the event
    await Promise.any(pubs)

    return signedEvent.id
  } catch (error) {
    console.error("Error publishing score:", error)
    return null
  }
}

// Fetch top scores from Nostr
export const fetchTopScores = async (limit = 10, levelId?: number): Promise<TypingScore[]> => {
  try {
    // Always fetch all typing-test scores via the #t tag (widely supported by
    // relays). We filter by level client-side because most relays silently
    // ignore arbitrary single-letter tag filters like #level.
    const filter = {
      kinds: [SCORE_EVENT_KIND],
      "#t": ["typing-test"],
      limit: 100, // Fetch more than needed to process
    }

    // Use the list method with proper error handling
    let events: Event[] = []
    try {
      // Try to use the list method if available
      if (typeof pool.list === "function") {
        events = await pool.list(DEFAULT_RELAYS, [filter])
      } else {
        // Fallback to using query method which is available in newer versions
        events = await pool.querySync(DEFAULT_RELAYS, filter)
      }
    } catch (e) {
      console.error("Error using pool methods:", e)
      // If both methods fail, return empty array
      return []
    }

    if (!events || events.length === 0) {
      return []
    }

    // Process events into score objects
    const scores: TypingScore[] = []

    // Process events in parallel for better performance
    const processedScores = await Promise.all(
      events.map(async (event) => {
        try {
          // Extract WPM and accuracy from tags
          const wpmTag = event.tags.find((tag) => tag[0] === "wpm")
          const accuracyTag = event.tags.find((tag) => tag[0] === "accuracy")
          const levelTag = event.tags.find((tag) => tag[0] === "level")

          const wpm = wpmTag ? Number.parseInt(wpmTag[1]) : 0
          const accuracy = accuracyTag ? Number.parseInt(accuracyTag[1]) : 0
          const eventLevelId = levelTag ? Number.parseInt(levelTag[1]) : undefined

          // Get user profile info
          const profile = await fetchUserProfile(event.pubkey)

          return {
            id: event.id,
            pubkey: event.pubkey,
            npub: nip19.npubEncode(event.pubkey),
            name: profile.name || profile.displayName || "Anonymous",
            picture: profile.picture || "",
            wpm,
            accuracy,
            timestamp: event.created_at,
            levelId: eventLevelId,
          }
        } catch (e) {
          console.error("Error processing event:", e)
          return null
        }
      }),
    )

    // Filter out null results, then apply the level filter client-side.
    processedScores.forEach((score) => {
      if (!score) return
    if (levelId !== undefined && score.levelId !== levelId) return
      scores.push(score)
    })

    // Sort by WPM (highest first)
    scores.sort((a, b) => b.wpm - a.wpm)

    // Return top scores
    return scores.slice(0, limit)
  } catch (error) {
    console.error("Error fetching scores:", error)
    return []
  }
}

// Declare global Window interface to include nostr
declare global {
  interface Window {
    nostr?: {
      getPublicKey(): Promise<string>
      signEvent(event: Partial<Event>): Promise<Event>
      getRelays(): Promise<{ [url: string]: { read: boolean; write: boolean } }>
    }
  }
}

import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { audioUrl } = await req.json()

  try {
    // Step 1: Identify the song using Shazam API
    const shazamResponse = await fetch(`https://shazam.p.rapidapi.com/songs/detect`, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "X-RapidAPI-Key": process.env.SHAZAM_API_KEY!,
        "X-RapidAPI-Host": "shazam.p.rapidapi.com",
      },
      body: new URLSearchParams({ url: audioUrl }),
    })
    const shazamData = await shazamResponse.json()

    if (!shazamData.track) {
      return NextResponse.json({ error: "Song not recognized" }, { status: 404 })
    }

    const {
      title,
      subtitle: artist,
      images: { coverart },
    } = shazamData.track

    // Step 2: Get additional information from Spotify API
    const spotifyToken = await getSpotifyToken()
    const spotifyResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(title + " " + artist)}&type=track&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${spotifyToken}`,
        },
      },
    )
    const spotifyData = await spotifyResponse.json()

    const spotifyTrack = spotifyData.tracks.items[0]
    const album = spotifyTrack.album.name
    const mood = analyzeMood(spotifyTrack.audio_features)
    const facts = await getFacts(artist)

    return NextResponse.json({
      title,
      artist,
      album,
      mood,
      facts,
    })
  } catch (error) {
    console.error("Error analyzing song:", error)
    return NextResponse.json({ error: "Error analyzing song" }, { status: 500 })
  }
}

async function getSpotifyToken() {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64"),
    },
    body: "grant_type=client_credentials",
  })
  const data = await response.json()
  return data.access_token
}

function analyzeMood(audioFeatures: any) {
  // This is a simplified mood analysis based on valence and energy
  const { valence, energy } = audioFeatures
  if (valence > 0.6 && energy > 0.6) return "Happy"
  if (valence < 0.4 && energy < 0.4) return "Sad"
  if (energy > 0.7) return "Energetic"
  return "Neutral"
}

async function getFacts(artist: string) {
  // This is a placeholder function. In a real application, you'd want to use a more
  // comprehensive database or API for artist facts.
  const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(artist)}`)
  const data = await response.json()
  return data.extract
}


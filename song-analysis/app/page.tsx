"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SongAnalysis() {
  const [audioUrl, setAudioUrl] = useState("")
  const [analysis, setAnalysis] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAnalyze = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audioUrl }),
      })
      const data = await response.json()
      setAnalysis(data)
    } catch (error) {
      console.error("Error analyzing song:", error)
    }
    setIsLoading(false)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Song Analysis System</h1>
      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          value={audioUrl}
          onChange={(e) => setAudioUrl(e.target.value)}
          placeholder="Enter audio URL"
          className="flex-grow"
        />
        <Button onClick={handleAnalyze} disabled={isLoading}>
          {isLoading ? "Analyzing..." : "Analyze"}
        </Button>
      </div>
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Title:</strong> {analysis.title}
            </p>
            <p>
              <strong>Artist:</strong> {analysis.artist}
            </p>
            <p>
              <strong>Album:</strong> {analysis.album}
            </p>
            <p>
              <strong>Mood:</strong> {analysis.mood}
            </p>
            <p>
              <strong>Facts:</strong> {analysis.facts}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


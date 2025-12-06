"use server"

import { generateText } from "ai"
import { fetchPlaceReviews } from "@/lib/google-places"

interface Lead {
  place_id: string
  name: string
  address: string
  rating: number
  user_ratings_total: number
}

interface BattleCard {
  pitch_angle: string
  pain_points: string[]
  value_proposition: string
  objection_handling: string[]
  conversation_starters: string[]
  review_sentiment: string
}

export async function generateBattleCard(lead: Lead): Promise<BattleCard> {
  const reviews = await fetchPlaceReviews(lead.place_id)

  const reviewsText =
    reviews.length > 0
      ? reviews
          .map((r) => `Rating: ${r.rating}★ - "${r.text.slice(0, 200)}${r.text.length > 200 ? "..." : ""}"`)
          .join("\n")
      : "No reviews available"

  const prompt = `You are a B2B sales strategist analyzing this business for lead generation.

Business: ${lead.name}
Location: ${lead.address}
Rating: ${lead.rating}/5 stars
Total Reviews: ${lead.user_ratings_total}

Recent Reviews (from Google):
${reviewsText}

Based on the actual customer reviews and business data, create a sales battle card with:

1. Pitch Angle: 2-3 sentence approach tailored to this specific business based on review themes
2. Pain Points: 3-4 specific challenges evident from the reviews and business profile
3. Value Proposition: How your solution addresses the pain points identified in reviews
4. Objection Handling: 3 common objections with data-driven responses
5. Conversation Starters: 3 opening questions based on review insights
6. Review Sentiment: Detailed analysis of the ${reviews.length} reviews - common themes, strengths, complaints, and overall sentiment

Return ONLY valid JSON with this exact structure:
{
  "pitch_angle": "...",
  "pain_points": ["...", "...", "..."],
  "value_proposition": "...",
  "objection_handling": ["...", "...", "..."],
  "conversation_starters": ["...", "...", "..."],
  "review_sentiment": "..."
}`

  try {
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.7,
    })

    // Parse the JSON response
    let jsonText = text.trim()
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.split("```")[1]
      if (jsonText.startsWith("json")) {
        jsonText = jsonText.slice(4)
      }
    }

    const battleCard = JSON.parse(jsonText) as BattleCard
    return battleCard
  } catch (error) {
    console.error("Error generating battle card:", error)
    throw new Error("Failed to generate battle card")
  }
}

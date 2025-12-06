"use server"

import { generateText } from "ai"
import { fetchPlaceReviews } from "@/lib/google-places"
import { getActiveProfile } from "./profiles"

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
  const activeProfile = await getActiveProfile()

  const reviewsText =
    reviews.length > 0
      ? reviews
          .map((r) => `Rating: ${r.rating}★ - "${r.text.slice(0, 200)}${r.text.length > 200 ? "..." : ""}"`)
          .join("\n")
      : "No reviews available"

  const companyContext = activeProfile
    ? `
Your Company Profile:
Profile Name: ${activeProfile.name}
Company Information & Pitch:
${activeProfile.knowledge_base}

Use this company information to tailor your sales approach and demonstrate how your specific products/services address the business's needs.
`
    : `
Note: No company profile is currently active. Generate a generic sales approach.
`

  const prompt = `You are a B2B sales strategist analyzing this business for lead generation.

Business: ${lead.name}
Location: ${lead.address}
Rating: ${lead.rating}/5 stars
Total Reviews: ${lead.user_ratings_total}

Recent Reviews (from Google):
${reviewsText}

${companyContext}

Based on the actual customer reviews, business data, and YOUR COMPANY PROFILE, create a comprehensive sales battle card that counters negative sentiments and leverages opportunities using your specific strengths and products:

1. Pitch Angle: 2-3 sentence approach tailored to this specific business based on review themes AND how your company's offerings can help
2. Pain Points: 3-4 specific challenges evident from the reviews and business profile
3. Value Proposition: How YOUR SPECIFIC PRODUCTS/SERVICES address the pain points identified in reviews
4. Objection Handling: 3 common objections with data-driven responses using your company's strengths
5. Conversation Starters: 3 opening questions based on review insights that lead to your solutions
6. Review Sentiment: Detailed analysis of the ${reviews.length} reviews - common themes, strengths, complaints, and overall sentiment

IMPORTANT: The battle card should be a strategic document that shows how YOUR company can solve THEIR problems based on what customers are saying in reviews.

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

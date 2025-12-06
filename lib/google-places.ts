/**
 * Google Places API Integration
 * Matches the Python algorithm - fetches places and reviews, no fake scoring
 */

export interface PlacesSearchParams {
  business_type: string
  location: string
  radius: number
  max_results: number
}

export interface PlaceResult {
  place_id: string
  name: string
  address: string
  phone_number?: string
  website?: string
  latitude: number
  longitude: number
  rating: number
  user_ratings_total: number
  price_level?: number
  types: string[]
  business_status: string
  open_now?: boolean
  google_maps_url: string
}

/**
 * Review data structure from Google Places API
 */
export interface PlaceReview {
  author_name: string
  author_url?: string
  profile_photo_url?: string
  rating: number
  relative_time_description: string
  text: string
  time: number
}

/**
 * Fetch places from Google Places API
 * Uses Google Places Text Search and Place Details API
 */
export async function fetchPlaces(params: PlacesSearchParams): Promise<PlaceResult[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    console.error("[v0] Google Maps API key is missing")
    throw new Error(
      "Server-side Google Maps API key is not configured. Please add GOOGLE_MAPS_API_KEY (without NEXT_PUBLIC prefix) to your environment variables in the Vars section.",
    )
  }

  try {
    const searchQuery = `${params.business_type} in ${params.location}`
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      searchQuery,
    )}&radius=${params.radius}&key=${apiKey}`

    console.log("[v0] Searching places:", searchQuery)
    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()

    if (searchData.status !== "OK" && searchData.status !== "ZERO_RESULTS") {
      console.error("[v0] Places search error:", searchData.status, searchData.error_message)
      throw new Error(`Google Places API error: ${searchData.status}`)
    }

    if (!searchData.results || searchData.results.length === 0) {
      console.log("[v0] No results found")
      return []
    }

    const placeIds = searchData.results.slice(0, params.max_results).map((place: any) => place.place_id)

    console.log("[v0] Fetching details for", placeIds.length, "places")

    const detailedPlaces = await Promise.all(
      placeIds.map(async (placeId: string) => {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,formatted_phone_number,website,geometry,rating,user_ratings_total,price_level,types,business_status,opening_hours,url&key=${apiKey}`

        const detailsResponse = await fetch(detailsUrl)
        const detailsData = await detailsResponse.json()

        if (detailsData.status !== "OK") {
          console.error("[v0] Place details error:", detailsData.status)
          return null
        }

        const place = detailsData.result

        return {
          place_id: place.place_id,
          name: place.name,
          address: place.formatted_address || "Address not available",
          phone_number: place.formatted_phone_number,
          website: place.website,
          latitude: place.geometry?.location?.lat || 0,
          longitude: place.geometry?.location?.lng || 0,
          rating: place.rating || 0,
          user_ratings_total: place.user_ratings_total || 0,
          price_level: place.price_level,
          types: place.types || [],
          business_status: place.business_status || "OPERATIONAL",
          open_now: place.opening_hours?.open_now,
          google_maps_url: place.url || `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
        }
      }),
    )

    const validPlaces = detailedPlaces.filter((place): place is PlaceResult => place !== null)

    validPlaces.sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating
      }
      return b.user_ratings_total - a.user_ratings_total
    })

    console.log("[v0] Returning", validPlaces.length, "places sorted by rating")
    return validPlaces
  } catch (error) {
    console.error("[v0] Error fetching places:", error)
    throw error
  }
}

/**
 * Fetch reviews for a specific place
 * Google Places API returns maximum 5 most helpful reviews
 */
export async function fetchPlaceReviews(placeId: string): Promise<PlaceReview[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    console.error("[v0] Google Maps API key is missing")
    throw new Error("Server-side Google Maps API key is not configured")
  }

  try {
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`

    console.log("[v0] Fetching reviews for place:", placeId)
    const response = await fetch(detailsUrl)
    const data = await response.json()

    if (data.status !== "OK") {
      console.error("[v0] Reviews fetch error:", data.status)
      return []
    }

    const reviews = data.result?.reviews || []
    console.log("[v0] Found", reviews.length, "reviews (Google API max: 5)")

    return reviews.map((review: any) => ({
      author_name: review.author_name || "Anonymous",
      author_url: review.author_url,
      profile_photo_url: review.profile_photo_url,
      rating: review.rating || 0,
      relative_time_description: review.relative_time_description || "Recently",
      text: review.text || "",
      time: review.time || Date.now() / 1000,
    }))
  } catch (error) {
    console.error("[v0] Error fetching reviews:", error)
    return []
  }
}

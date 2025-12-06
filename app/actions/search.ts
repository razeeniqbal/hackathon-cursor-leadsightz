"use server"
import { fetchPlaces, fetchPlaceReviews } from "@/lib/google-places"

export interface SearchParams {
  business_type: string
  location: string
  radius: number
  max_results: number
}

export async function searchLeads(params: SearchParams) {
  const places = await fetchPlaces(params)
  return places
}

export async function getPlaceReviews(placeId: string) {
  const reviews = await fetchPlaceReviews(placeId)
  return reviews
}

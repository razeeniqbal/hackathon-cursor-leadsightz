"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Search } from "lucide-react"
import { SearchResults } from "@/components/search-results"
import { searchLeads } from "@/app/actions/search"

export function SearchForm() {
  const [isSearching, setIsSearching] = useState(false)
  const [businessType, setBusinessType] = useState("")
  const [location, setLocation] = useState("")
  const [searchResults, setSearchResults] = useState<{
    businessType: string
    location: string
    leads: any[]
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!businessType || !location) return

    setIsSearching(true)

    try {
      const leads = await searchLeads({
        business_type: businessType,
        location: location,
        radius: 5000,
        max_results: 20,
      })

      setSearchResults({
        businessType,
        location,
        leads,
      })
    } catch (error) {
      console.error("[v0] Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <>
      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="business-type">Business Type</Label>
                <Input
                  id="business-type"
                  placeholder="e.g., restaurant, cafe, bakery"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Kuala Lumpur, KLCC"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={isSearching} className="w-full md:w-auto">
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Find Leads
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {searchResults && <SearchResults searchResults={searchResults} />}
    </>
  )
}

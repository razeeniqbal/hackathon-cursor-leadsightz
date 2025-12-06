"use client"

import { LeadList } from "@/components/lead-list"
import { LeadMap } from "@/components/lead-map"
import { ExportButton } from "@/components/export-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, List } from "lucide-react"

interface SearchResultsProps {
  searchResults: {
    businessType: string
    location: string
    leads: any[]
  }
}

export function SearchResults({ searchResults }: SearchResultsProps) {
  const { businessType, location, leads } = searchResults

  if (leads.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No leads found for this search</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {businessType} in {location}
          </h2>
          <p className="text-muted-foreground">Found {leads.length} leads</p>
        </div>
        <ExportButton leads={leads} businessType={businessType} location={location} />
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="list">
            <List className="mr-2 h-4 w-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="map">
            <MapPin className="mr-2 h-4 w-4" />
            Map View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <LeadList leads={leads} />
        </TabsContent>

        <TabsContent value="map">
          <LeadMap leads={leads} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

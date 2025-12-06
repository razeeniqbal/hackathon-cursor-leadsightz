"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ExportButtonProps {
  leads: any[]
  businessType: string
  location: string
}

export function ExportButton({ leads, businessType, location }: ExportButtonProps) {
  const handleExportCSV = () => {
    const headers = [
      "Name",
      "Address",
      "Phone",
      "Website",
      "Rating",
      "Total Reviews",
      "Latitude",
      "Longitude",
      "Google Maps URL",
    ]

    const rows = leads.map((lead) => [
      lead.name,
      lead.address,
      lead.phone_number || "",
      lead.website || "",
      lead.rating,
      lead.user_ratings_total,
      lead.latitude,
      lead.longitude,
      lead.google_maps_url,
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const cellStr = String(cell)
            if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
              return `"${cellStr.replace(/"/g, '""')}"`
            }
            return cellStr
          })
          .join(","),
      ),
    ].join("\n")

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `leads-${businessType}-${location}-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handleExportJSON = () => {
    const jsonData = {
      search: {
        business_type: businessType,
        location: location,
        total_leads: leads.length,
        exported_at: new Date().toISOString(),
      },
      leads: leads.map((lead) => ({
        place_id: lead.place_id,
        name: lead.name,
        address: lead.address,
        phone_number: lead.phone_number,
        website: lead.website,
        rating: lead.rating,
        user_ratings_total: lead.user_ratings_total,
        latitude: lead.latitude,
        longitude: lead.longitude,
        google_maps_url: lead.google_maps_url,
      })),
    }

    // Download JSON
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `leads-${businessType}-${location}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV}>Export as CSV</DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJSON}>Export as JSON</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

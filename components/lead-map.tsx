"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Lead {
  id: number
  name: string
  address: string
  latitude: number
  longitude: number
  rating: number
  user_ratings_total: number
  total_score: number
  priority_tier: string
  phone_number: string | null
  website: string | null
  google_maps_url: string
}

interface LeadMapProps {
  leads: Lead[]
}

declare global {
  interface Window {
    google: any
  }
}

export function LeadMap({ leads }: LeadMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!mapRef.current || leads.length === 0 || !isLoaded || !window.google) return

    const google = window.google

    // Calculate center from all leads
    const avgLat = leads.reduce((sum, lead) => sum + Number(lead.latitude), 0) / leads.length
    const avgLng = leads.reduce((sum, lead) => sum + Number(lead.longitude), 0) / leads.length

    // Initialize map
    const map = new google.maps.Map(mapRef.current, {
      center: { lat: avgLat, lng: avgLng },
      zoom: 13,
      mapTypeControl: true,
      streetViewControl: false,
    })

    mapInstanceRef.current = map

    // Add markers for each lead with color coding by priority
    leads.forEach((lead) => {
      const markerColor = getMarkerColor(lead.priority_tier)

      const marker = new google.maps.Marker({
        position: { lat: Number(lead.latitude), lng: Number(lead.longitude) },
        map: map,
        title: lead.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: markerColor,
          fillOpacity: 0.9,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      })

      // Create info window with lead details
      const infoWindow = new google.maps.InfoWindow({
        content: createInfoWindowContent(lead),
      })

      marker.addListener("click", () => {
        infoWindow.open(map, marker)
      })
    })

    return () => {
      // Cleanup
      if (mapInstanceRef.current && google.maps.event) {
        google.maps.event.clearInstanceListeners(mapInstanceRef.current)
      }
    }
  }, [leads, isLoaded])

  const getMarkerColor = (tier: string): string => {
    switch (tier) {
      case "Critical":
        return "#ef4444" // Red
      case "High":
        return "#f97316" // Orange
      case "Medium":
        return "#3b82f6" // Blue
      default:
        return "#6b7280" // Gray
    }
  }

  const createInfoWindowContent = (lead: Lead): string => {
    const phoneHtml = lead.phone_number
      ? `<div><strong>Phone:</strong> <a href="tel:${lead.phone_number}">${lead.phone_number}</a></div>`
      : ""
    const websiteHtml = lead.website
      ? `<div><strong>Website:</strong> <a href="${lead.website}" target="_blank" rel="noopener noreferrer">Visit</a></div>`
      : ""

    return `
      <div style="max-width: 300px; padding: 8px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${lead.name}</h3>
        <div style="margin-bottom: 8px;">
          <span style="background: ${getMarkerColor(lead.priority_tier)}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
            ${lead.priority_tier} Priority
          </span>
        </div>
        <div style="margin-bottom: 4px;"><strong>Score:</strong> ${lead.total_score.toFixed(1)}</div>
        <div style="margin-bottom: 4px;"><strong>Rating:</strong> ${lead.rating.toFixed(1)} ★ (${lead.user_ratings_total} reviews)</div>
        <div style="margin-bottom: 8px;"><strong>Address:</strong> ${lead.address}</div>
        ${phoneHtml}
        ${websiteHtml}
        <div style="margin-top: 8px;">
          <a href="/lead/${lead.id}" style="color: #3b82f6; text-decoration: none;">View Full Details →</a>
        </div>
      </div>
    `
  }

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        onLoad={() => setIsLoaded(true)}
        strategy="afterInteractive"
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Map View</span>
            <div className="flex gap-2 text-sm font-normal">
              <Badge variant="destructive">Critical</Badge>
              <Badge variant="default">High</Badge>
              <Badge variant="secondary">Medium</Badge>
              <Badge variant="outline">Low</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isLoaded ? (
            <div className="w-full h-[600px] rounded-lg bg-muted flex items-center justify-center">
              <p className="text-muted-foreground">Loading map...</p>
            </div>
          ) : (
            <div ref={mapRef} className="w-full h-[600px] rounded-lg" />
          )}
        </CardContent>
      </Card>
    </>
  )
}

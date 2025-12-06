"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Lead {
  place_id: string
  name: string
  address: string
  latitude: number
  longitude: number
  rating: number
  user_ratings_total: number
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

    const mapStyles = [
      {
        elementType: "geometry",
        stylers: [{ saturation: -100 }],
      },
      {
        elementType: "labels.text.fill",
        stylers: [{ saturation: -100 }],
      },
      {
        elementType: "labels.text.stroke",
        stylers: [{ saturation: -100 }],
      },
      {
        featureType: "administrative",
        elementType: "geometry.stroke",
        stylers: [{ saturation: -100 }],
      },
      {
        featureType: "administrative.land_parcel",
        elementType: "geometry.stroke",
        stylers: [{ saturation: -100 }],
      },
      {
        featureType: "administrative.land_parcel",
        elementType: "labels.text.fill",
        stylers: [{ saturation: -100 }],
      },
      {
        featureType: "landscape.natural",
        elementType: "geometry",
        stylers: [{ saturation: -100 }],
      },
      {
        featureType: "poi",
        elementType: "geometry",
        stylers: [{ saturation: -100 }],
      },
      {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ saturation: -100 }],
      },
      {
        featureType: "poi.park",
        elementType: "geometry.fill",
        stylers: [{ saturation: -100 }],
      },
      {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ saturation: -100 }],
      },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ saturation: -100 }],
      },
      {
        featureType: "road.arterial",
        elementType: "labels.text.fill",
        stylers: [{ saturation: -100 }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ saturation: -100 }],
      },
      {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ saturation: -100 }],
      },
      {
        featureType: "road.local",
        elementType: "labels.text.fill",
        stylers: [{ saturation: -100 }],
      },
      {
        featureType: "transit.line",
        elementType: "geometry",
        stylers: [{ saturation: -100 }],
      },
      {
        featureType: "transit.station",
        elementType: "geometry",
        stylers: [{ saturation: -100 }],
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ saturation: -100 }],
      },
      {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ saturation: -100 }],
      },
    ]

    // Initialize map with monotone styles
    const map = new google.maps.Map(mapRef.current, {
      center: { lat: avgLat, lng: avgLng },
      zoom: 13,
      mapTypeControl: true,
      streetViewControl: false,
      styles: mapStyles,
    })

    mapInstanceRef.current = map

    leads.forEach((lead) => {
      const markerColor = getMarkerColorByRating(lead.rating)

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
      if (mapInstanceRef.current && window.google.maps.event) {
        window.google.maps.event.clearInstanceListeners(mapInstanceRef.current)
      }
    }
  }, [leads, isLoaded])

  const getMarkerColorByRating = (rating: number): string => {
    if (rating >= 4.5) return "#22c55e" // Green - Excellent
    if (rating >= 4.0) return "#3b82f6" // Blue - Good
    if (rating >= 3.5) return "#f97316" // Orange - Average
    return "#6b7280" // Gray - Below Average
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
        <div style="margin-bottom: 4px;"><strong>Rating:</strong> ${lead.rating.toFixed(1)} ★ (${lead.user_ratings_total} reviews)</div>
        <div style="margin-bottom: 8px;"><strong>Address:</strong> ${lead.address}</div>
        ${phoneHtml}
        ${websiteHtml}
        <div style="margin-top: 8px;">
          <a href="${lead.google_maps_url}" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: none;">View on Google Maps →</a>
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
            <div className="flex gap-2 text-sm font-normal items-center">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span>4.5+</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span>4.0+</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                <span>3.5+</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-gray-500"></span>
                <span>&lt;3.5</span>
              </span>
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

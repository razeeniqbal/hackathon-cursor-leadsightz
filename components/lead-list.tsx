"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpDown, ExternalLink, Phone, Globe, TrendingUp, Activity } from "lucide-react"

interface Lead {
  place_id: string
  name: string
  address: string
  phone_number: string | null
  website: string | null
  rating: number
  user_ratings_total: number
  volume_score: number
  stability_score: number
  total_score: number
  priority_tier: string
  google_maps_url: string
}

interface LeadListProps {
  leads: Lead[]
}

type SortField = "name" | "rating" | "user_ratings_total" | "total_score" | "volume_score" | "stability_score"
type SortDirection = "asc" | "desc"

export function LeadList({ leads }: LeadListProps) {
  const [sortField, setSortField] = useState<SortField>("total_score")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const sortedLeads = [...leads].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    const aNum = Number(aValue) || 0
    const bNum = Number(bValue) || 0
    return sortDirection === "asc" ? aNum - bNum : bNum - aNum
  })

  const getPriorityBadgeVariant = (tier: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (tier) {
      case "Critical":
        return "destructive"
      case "High":
        return "default"
      case "Medium":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("name")} className="h-8 px-2">
                    Business Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("total_score")} className="h-8 px-2">
                    Total Score
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("volume_score")} className="h-8 px-2">
                    Volume
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("stability_score")} className="h-8 px-2">
                    Stability
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("rating")} className="h-8 px-2">
                    Rating
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLeads.map((lead) => (
                <TableRow key={lead.place_id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold text-foreground">{lead.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">{lead.address}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="font-bold text-lg">{lead.total_score.toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{lead.volume_score.toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{lead.stability_score.toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{lead.rating.toFixed(1)} ★</span>
                      <span className="text-xs text-muted-foreground">({lead.user_ratings_total} reviews)</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityBadgeVariant(lead.priority_tier)}>{lead.priority_tier}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {lead.phone_number && (
                        <a
                          href={`tel:${lead.phone_number}`}
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <Phone className="h-3 w-3" />
                          {lead.phone_number}
                        </a>
                      )}
                      {lead.website && (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <Globe className="h-3 w-3" />
                          Website
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={lead.google_maps_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

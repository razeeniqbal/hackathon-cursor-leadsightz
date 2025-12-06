"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpDown, ExternalLink, Phone, Globe, MessageSquare, Sparkles } from "lucide-react"
import { BattleCardDialog } from "./battle-card-dialog"
import { ReviewsDialog } from "./reviews-dialog"

interface Lead {
  place_id: string
  name: string
  address: string
  phone_number: string | null
  website: string | null
  rating: number
  user_ratings_total: number
  google_maps_url: string
}

interface LeadListProps {
  leads: Lead[]
}

type SortField = "name" | "rating" | "user_ratings_total"
type SortDirection = "asc" | "desc"

export function LeadList({ leads }: LeadListProps) {
  const [sortField, setSortField] = useState<SortField>("rating")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showBattleCard, setShowBattleCard] = useState(false)
  const [showReviews, setShowReviews] = useState(false)

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
                  <Button variant="ghost" onClick={() => handleSort("rating")} className="h-8 px-2">
                    Rating
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("user_ratings_total")} className="h-8 px-2">
                    Reviews
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
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
                      <span className="text-2xl font-bold text-foreground">{lead.rating.toFixed(1)}</span>
                      <span className="text-yellow-500 text-xl">★</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">{lead.user_ratings_total.toLocaleString()} reviews</span>
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
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedLead(lead)
                          setShowReviews(true)
                        }}
                        title="View Reviews"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedLead(lead)
                          setShowBattleCard(true)
                        }}
                        title="Generate Battle Card with AI"
                      >
                        <Sparkles className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={lead.google_maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View on Google Maps"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {selectedLead && (
          <>
            <ReviewsDialog
              lead={selectedLead}
              open={showReviews}
              onOpenChange={(open) => {
                setShowReviews(open)
                if (!open) setSelectedLead(null)
              }}
            />
            <BattleCardDialog
              lead={selectedLead}
              open={showBattleCard}
              onOpenChange={(open) => {
                setShowBattleCard(open)
                if (!open) setSelectedLead(null)
              }}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}

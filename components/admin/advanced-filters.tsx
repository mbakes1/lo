"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, Filter, RotateCcw } from "lucide-react"
import { format } from "date-fns"

interface AdvancedFiltersProps {
  filters: {
    search: string
    status: string
    entityType: string
    dateFrom: Date | undefined
    dateTo: Date | undefined
    minTrucks: string
    maxTrucks: string
    hasDocuments: string
  }
  onFiltersChange: (filters: any) => void
  onClearFilters: () => void
}

export function AdvancedFilters({ filters, onFiltersChange, onClearFilters }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.status !== "all") count++
    if (filters.entityType !== "all") count++
    if (filters.dateFrom || filters.dateTo) count++
    if (filters.minTrucks || filters.maxTrucks) count++
    if (filters.hasDocuments !== "all") count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative bg-transparent">
          <Filter className="h-4 w-4 mr-2" />
          Advanced Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-6" align="end">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Advanced Filters</h4>
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>

          <Separator />

          {/* Entity Type Filter */}
          <div className="space-y-2">
            <Label>Entity Type</Label>
            <Select value={filters.entityType} onValueChange={(value) => updateFilter("entityType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label>Submission Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom ? format(filters.dateFrom, "MMM dd, yyyy") : "From date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => updateFilter("dateFrom", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo ? format(filters.dateTo, "MMM dd, yyyy") : "To date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => updateFilter("dateTo", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Truck Count Filter */}
          <div className="space-y-2">
            <Label>Number of Trucks</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="number"
                  placeholder="Min trucks"
                  value={filters.minTrucks}
                  onChange={(e) => updateFilter("minTrucks", e.target.value)}
                  min="0"
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Max trucks"
                  value={filters.maxTrucks}
                  onChange={(e) => updateFilter("maxTrucks", e.target.value)}
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Documents Filter */}
          <div className="space-y-2">
            <Label>Documents Status</Label>
            <Select value={filters.hasDocuments} onValueChange={(value) => updateFilter("hasDocuments", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All applications" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="with_documents">With Documents</SelectItem>
                <SelectItem value="without_documents">Without Documents</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

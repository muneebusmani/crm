"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Building2 } from "lucide-react"

interface CompanyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CompanyDialog({ open, onOpenChange }: CompanyDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    owner: "",
    industry: "",
    location: "",
    employees: "",
    website: "",
    description: "",
    logo: null as File | null,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted:", formData)
    onOpenChange(false)
    // Reset form
    setFormData({
      name: "",
      email: "",
      password: "",
      owner: "",
      industry: "",
      location: "",
      employees: "",
      website: "",
      description: "",
      logo: null,
    })
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, logo: file }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Add New Dealer/Garage
          </DialogTitle>
          <DialogDescription>Create a new dealer or garage profile in your CRM system.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label htmlFor="logo">Company Logo</Label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted">
                {formData.logo ? (
                  <img
                    src={URL.createObjectURL(formData.logo) || "/placeholder.svg"}
                    alt="Logo preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Upload className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <Input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                <Button type="button" variant="outline" onClick={() => document.getElementById("logo")?.click()}>
                  Upload Logo
                </Button>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Dealer/Garage Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e: { target: { value: any } }) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter company name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner">Owner Name</Label>
              <Input
                id="owner"
                value={formData.owner}
                onChange={(e) => setFormData((prev) => ({ ...prev, owner: e.target.value }))}
                placeholder="Enter owner name"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Dealer Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="dealer@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Dealer Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Enter secure password"
                required
              />
            </div>
          </div>

          {/* Business Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry Type</Label>
              <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, industry: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automotive-services">Automotive Services</SelectItem>
                  <SelectItem value="car-dealership">Car Dealership</SelectItem>
                  <SelectItem value="auto-repair">Auto Repair</SelectItem>
                  <SelectItem value="luxury-auto">Luxury Auto Services</SelectItem>
                  <SelectItem value="motorcycle">Motorcycle Services</SelectItem>
                  <SelectItem value="truck-services">Truck Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="employees">Company Size</Label>
              <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, employees: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-25">11-25 employees</SelectItem>
                  <SelectItem value="26-50">26-50 employees</SelectItem>
                  <SelectItem value="51-100">51-100 employees</SelectItem>
                  <SelectItem value="100+">100+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="City, State"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the company..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Company</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

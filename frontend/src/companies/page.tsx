"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  MoreHorizontal,
  Star,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { CompanyDialog } from "@/components/company-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const companies = [
  {
    id: 1,
    name: "Syntyce Solutions",
    logo: "/generic-company-logo.png",
    email: "syntycesolutions@gmail.com",
    owner: "Charles Dickens",
    industry: "Chemical Industries",
    location: "United States",
    employees: "10-50",
    rating: 4.5,
    since: "07 Apr, 2021",
    status: "Active",
  },
  {
    id: 2,
    name: "Zoetic Fashion",
    logo: "/elegant-fashion-logo.png",
    email: "info@zoetic.com",
    owner: "James Lemire",
    industry: "Clothes & Fashion",
    location: "Brazil",
    employees: "10-50",
    rating: 4.8,
    since: "02 Jan, 2022",
    status: "Active",
  },
  {
    id: 3,
    name: "Meta4Systems",
    logo: "/abstract-tech-logo.png",
    email: "meta4@example.com",
    owner: "Jonny Stromberg",
    industry: "Computer Industry",
    location: "Spain",
    employees: "10-50",
    rating: 4.2,
    since: "25 Sep, 2021",
    status: "Active",
  },
  {
    id: 4,
    name: "Moetic Fashion",
    logo: "/diverse-fashion-collection.png",
    email: "moetic@fashion.com",
    owner: "James Morris",
    industry: "Clothes & Fashion",
    location: "Argentina",
    employees: "10-50",
    rating: 4.9,
    since: "16 Dec, 2021",
    status: "Active",
  },
  {
    id: 5,
    name: "Syntyce Solutions",
    logo: "/solutions-logo.png",
    email: "solutions@syntyce.com",
    owner: "Michael Morris",
    industry: "Chemical Industries",
    location: "United States",
    employees: "10-50",
    rating: 4.3,
    since: "02 May, 2022",
    status: "Active",
  },
];

export function CompaniesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <div className="flex items-center text-sm text-muted-foreground">
          <span>CRM</span>
          <span className="mx-2">/</span>
          <span className="text-foreground">Companies</span>
        </div>
        <h1 className="text-2xl font-semibold text-foreground">Companies</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">
              Companies List
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                onClick={() => setShowDialog(true)}
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Company
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="w-12">
                  <input type="checkbox" className="rounded border-gray-300" />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Industry Type</TableHead>
                <TableHead>Star Value</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id} className="border-b">
                  <TableCell>
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={company.logo || "./placeholder.svg"}
                        alt={company.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-medium text-foreground">
                          {company.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {company.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">
                      {company.owner}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {company.industry}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{company.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-foreground">{company.location}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-foreground">{company.employees}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <Eye className="h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Edit className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-destructive">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Company Dialog */}
      <CompanyDialog open={showDialog} onOpenChange={setShowDialog} />
    </div>
    </>
  );
}

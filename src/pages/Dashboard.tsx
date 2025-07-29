import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Filter, 
  Download, 
  FileText, 
  MoreHorizontal,
  Calendar,
  FileCheck,
  Eye,
  Copy,
  Trash2
} from "lucide-react";

// Mock data
const documents = [
  {
    id: "1",
    type: "Bill of Entry",
    status: "Completed",
    date: "2024-01-15",
    invoiceNo: "INV-2024-001",
    value: "₹2,45,000",
    items: "Electronics Components"
  },
  {
    id: "2", 
    type: "Shipping Bill",
    status: "Draft",
    date: "2024-01-14",
    invoiceNo: "INV-2024-002",
    value: "₹1,80,500",
    items: "Textile Products"
  },
  {
    id: "3",
    type: "FIRC",
    status: "Completed", 
    date: "2024-01-12",
    invoiceNo: "INV-2024-003",
    value: "₹3,20,000",
    items: "Auto Parts"
  },
  {
    id: "4",
    type: "Bill of Entry",
    status: "Processing",
    date: "2024-01-10",
    invoiceNo: "INV-2024-004", 
    value: "₹95,500",
    items: "Pharmaceuticals"
  }
];

const statusColors = {
  "Completed": "default",
  "Draft": "secondary", 
  "Processing": "outline"
} as const;

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.items.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || doc.status.toLowerCase() === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Your Document Vault
            </h1>
            <p className="text-text-secondary text-lg">
              Manage and track all your export documentation in one place
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-soft border-0">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <FileCheck className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold text-text-primary">12</p>
                    <p className="text-sm text-text-secondary">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft border-0">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <FileText className="w-8 h-8 text-amber-500" />
                  <div>
                    <p className="text-2xl font-bold text-text-primary">3</p>
                    <p className="text-sm text-text-secondary">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft border-0">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold text-text-primary">7</p>
                    <p className="text-sm text-text-secondary">This Month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft border-0">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Download className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-text-primary">₹8.4L</p>
                    <p className="text-sm text-text-secondary">Total Value</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="shadow-medium border-0 mb-6">
            <CardHeader>
              <CardTitle>Export Documents</CardTitle>
              <CardDescription>
                View and manage all your generated export documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                  <Input
                    placeholder="Search by invoice number or items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="shrink-0">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter by Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSelectedStatus("all")}>
                      All Documents
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedStatus("completed")}>
                      Completed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedStatus("draft")}>
                      Draft
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedStatus("processing")}>
                      Processing
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Documents Table */}
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-surface">
                      <TableHead>Document Type</TableHead>
                      <TableHead>Invoice No.</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => (
                      <TableRow key={doc.id} className="hover:bg-surface/50">
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-primary" />
                            <span>{doc.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{doc.invoiceNo}</TableCell>
                        <TableCell className="text-text-secondary">{doc.items}</TableCell>
                        <TableCell className="font-semibold">{doc.value}</TableCell>
                        <TableCell>
                          <Badge variant={statusColors[doc.status as keyof typeof statusColors]}>
                            {doc.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-text-secondary">{doc.date}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Empty State */}
              {filteredDocuments.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-text-primary mb-2">No documents found</h3>
                  <p className="text-text-secondary mb-4">
                    {searchTerm ? "Try adjusting your search terms" : "Upload your first document to get started"}
                  </p>
                  <Button variant="ai">
                    Start Uploading
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
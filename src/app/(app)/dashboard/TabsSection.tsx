import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tag } from "@/types/types";
import { File, ListFilter } from "lucide-react";
import React from "react";

interface UserFile {
  id: string;
  user_id: string;
  folder_id: string | null;
  file_name: string;
  file_url: string;
  created_at: string;
  file_data: any[];
  pages?: number;
  size?: string;
  dateProcessed?: string;
  status?: "Processed" | "In Processing";
  tags?: Tag[];
}

interface TabsSectionProps {
  data: UserFile[];
}

const TabsSection: React.FC<TabsSectionProps> = ({ data }) => {
  const renderFiles = (files: UserFile[]) =>
    files.map((file) => (
      <TableRow key={file.id}>
        <TableCell>
          <div className="font-medium">{file.file_name}</div>
        </TableCell>
        <TableCell className="hidden sm:table-cell">{file.pages}</TableCell>
        <TableCell className="hidden sm:table-cell">{file.size}</TableCell>
        <TableCell className="hidden md:table-cell">
          {file.dateProcessed}
        </TableCell>
        <TableCell className="text-right">
          <Badge className="text-xs" variant="secondary">
            {file.status}
          </Badge>
        </TableCell>
      </TableRow>
    ));

  return (
    <Tabs defaultValue="week">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="year">Year</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 gap-1 text-sm">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>
                Some filter
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Some filter</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Some filter</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="outline" className="h-7 gap-1 text-sm">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Export</span>
          </Button>
        </div>
      </div>
      <TabsContent value="week">
        <Card x-chunk="dashboard-05-chunk-3">
          <CardHeader className="px-7">
            <CardTitle>PDF Files</CardTitle>
            <CardDescription>
              Recent PDF files processed by your application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Pages</TableHead>
                  <TableHead className="hidden sm:table-cell">Size</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Date Processed
                  </TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderFiles(data)}</TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default TabsSection;

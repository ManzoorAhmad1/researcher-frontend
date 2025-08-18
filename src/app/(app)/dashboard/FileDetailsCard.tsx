import { Copy, Download, MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { PDFData } from "@/types/types";
import {
  formatDate,
  formatBytes,
  removeFilenameFromUrl,
} from "@/utils/commonUtils";

interface FileDetailsCardProps {
  fileId?: number;
  fileName: string;
  PDFData?: PDFData;
}

export const FileDetailsCard: React.FC<FileDetailsCardProps> = ({
  fileId,
  fileName,
  PDFData,
}) => {
  const formateDates =
    (PDFData?.created_at && formatDate(PDFData?.created_at)) || "June 10, 2024";
  const formateLastUpdateDates =
    (PDFData?.last_update && formatDate(PDFData?.last_update)) ||
    "June 10, 2024";
  const formatSize = PDFData?.size && formatBytes(PDFData?.size);

  return (
    <Card
      className="overflow-hidden w-full h-full flex flex-col"
      x-chunk="dashboard"
    >
      <CardHeader className="flex flex-row items-start bg-muted flex-wrap justify-between w-full">
        <div className="grid gap-0.5">
          <CardTitle className="group flex items-center gap-2 text-lg">
            {PDFData?.file_name || fileName}
            <Button
              size="icon"
              variant="outline"
              className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Copy className="h-3 w-3" />
              <span className="sr-only">Copy File Name</span>
            </Button>
          </CardTitle>
          <CardDescription>Date Processed: {formateDates}</CardDescription>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <Download className="h-3.5 w-3.5" />
            <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
              Download File
            </span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="h-8 w-8">
                <MoreVertical className="h-3.5 w-3.5" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-6 text-sm h-full">
        <div className="grid gap-3">
          <div className="font-semibold">File Details</div>
          <ul className="grid gap-3">
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Pages</span>
              <span>{PDFData?.number_of_page || 2}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Size</span>
              <span>{formatSize}</span>
            </li>
          </ul>
          <Separator className="my-2" />
          <ul className="grid gap-3">
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span>{PDFData?.status || "processed"}</span>
            </li>
          </ul>
        </div>
        <Separator className="my-4" />
        <div className="grid gap-3">
          <div className="font-semibold">File Location</div>
          <address className="grid gap-0.5 not-italic text-muted-foreground">
            <span>Server: {PDFData?.server}</span>
            <span>Path: {removeFilenameFromUrl(PDFData?.file_link || "")}</span>
          </address>
        </div>
        <Separator className="my-4" />
        <div className="grid gap-3">
          <div className="font-semibold">User Information</div>
          <dl className="grid gap-3">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Uploaded By</dt>
              <dd>{PDFData?.upload_user_name || "James Cameron"}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd>
                <a href="mailto:liam@acme.com">
                  {PDFData?.upload_user_email || "james@c.com"}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </CardContent>
      <CardFooter className="flex flex-row items-center border-t bg-muted px-6 py-3 mb-auto">
        <div className="text-xs text-muted-foreground">
          Last Updated{" "}
          <time dateTime="2024-06-10">{formateLastUpdateDates}</time>
        </div>
      </CardFooter>
    </Card>
  );
};

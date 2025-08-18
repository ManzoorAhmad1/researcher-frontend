import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Activity, CreditCard, DollarSign, Users2 } from "lucide-react";
import { formatBytes, formatDate } from "@/utils/commonUtils";

interface HighlightAreas {
  top: number;
  left: number;
  width: number;
  height: number;
  pageIndex: number;
}

interface Comment {
  user: string;
  comment: string;
}

interface NewNote {
  id: number;
  color: string;
  quote: string;
  content: string;
  comments: Comment[];
  newComment: string;
  highlightAreas: HighlightAreas[];
  isCommentDialogOpen: boolean;
}

interface PDFData {
  id: number | null;
  created_at: string;
  note: NewNote[];
  file_link: string;
  file_name: string | null;
  file_updated_date: string | null;
  number_of_page: number | null;
  size: number | null;
  status: string | null;
  server: string | null;
  upload_user_name: string | null;
  upload_user_email: string | null;
  last_update: string | null;
}

interface InfoCardsProps {
  PDFData: PDFData;
}

export const InfoCards: React.FC<InfoCardsProps> = ({ PDFData }) => {
  const formateLastUpdateDates =
    (PDFData?.last_update && formatDate(PDFData?.last_update)) ||
    "June 10, 2024";
  const formatSize = PDFData?.size && formatBytes(PDFData?.size);
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
      <Card className="sm:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle>{PDFData.file_name}</CardTitle>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Title</AccordionTrigger>
              <AccordionContent>
                Adventures in Coding: A Journey Through Software Development
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Author</AccordionTrigger>
              <AccordionContent>Jane Doe</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Creation Date</AccordionTrigger>
              <AccordionContent>{formateLastUpdateDates}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Number of Pages</AccordionTrigger>
              <AccordionContent>
                {PDFData?.number_of_page || 2}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>File Size</AccordionTrigger>
              <AccordionContent>{formatSize}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger>Is it accessible?</AccordionTrigger>
              <AccordionContent>
                Yes. It adheres to the WAI-ARIA design pattern.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-7">
              <AccordionTrigger>Is it styled?</AccordionTrigger>
              <AccordionContent>
                Yes. It comes with default styles that match the other
                components{"'"} aesthetic.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-8">
              <AccordionTrigger>Is it animated?</AccordionTrigger>
              <AccordionContent>
                Yes. It{"'"}s animated by default, but you can disable it if you
                prefer.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardHeader>
      </Card>
      <div className="sm:col-span-2 flex flex-col gap-2">
        <div className="md:col-span-1 lg:col-span-1">
          <Card x-chunk="dashboard-01-chunk-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chart</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">chart</div>
              <p className="text-xs text-muted-foreground">from last month</p>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1 lg:col-span-1">
          <Card x-chunk="dashboard-01-chunk-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tags</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Science</div>
              <p className="text-xs text-muted-foreground">+ add tag</p>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1 lg:col-span-1 mt-4 lg:mt-0">
          <Card x-chunk="dashboard-01-chunk-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Uploaded files
              </CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">50</div>
              <p className="text-xs text-muted-foreground">
                +20 from last month
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1 lg:col-span-1 mt-4 lg:mt-0">
          <Card x-chunk="dashboard-01-chunk-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory used</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5.5GB</div>
              <p className="text-xs text-muted-foreground">
                +2GB since last hour
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

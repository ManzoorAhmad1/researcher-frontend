"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FolderPlus,
  History,
  LayoutGrid,
  LayoutList,
  ListTodo,
  Tags,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ExplorerTabsProps {
  children: React.ReactNode;
  hideAddFolderButton?: boolean;
}

export function ExplorerTabs({
  children,
  hideAddFolderButton,
}: ExplorerTabsProps) {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>("");

  useEffect(() => {
    const savedActiveTab = localStorage.getItem("activeTab");
    if (savedActiveTab) {
      setActiveTab(savedActiveTab);
    } else {
      setActiveTab("active");
    }
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && activeTab !== null) {
      localStorage.setItem("activeTab", activeTab);
    }
  }, [activeTab, isClient]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleCreateFolder = () => {
    setIsDialogOpen(false);
    setFolderName("");
  };

  if (activeTab === null) {
    return null;
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <div className="flex items-center">
        <div className="mr-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <ListTodo className="h-6 w-6" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Tags className="h-6 w-6" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Tags
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Tags</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>
                Active
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Archived</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <History className="h-6 w-6" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Changed
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Changed</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>day</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>week</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>year</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {!hideAddFolderButton && (
            <>
              <Button
                size="sm"
                className="h-8 gap-1"
                variant={"link"}
                onClick={() => setIsDialogOpen(true)}
              >
                <FolderPlus className="h-6 w-6" />
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Folder</DialogTitle>
                  </DialogHeader>
                  <div className="mt-2">
                    <Input
                      placeholder="Folder Name"
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="secondary"
                      onClick={() => setIsDialogOpen(false)}
                      className="rounded-[26px]"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateFolder} className="rounded-[26px] btn text-white">Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
        <TabsList>
          <TabsTrigger value="active">
            <LayoutList className="h-6 w-6" />
          </TabsTrigger>
          <TabsTrigger value="items">
            <LayoutGrid className="h-6 w-6" />
          </TabsTrigger>
        </TabsList>
      </div>
    </Tabs>
  );
}

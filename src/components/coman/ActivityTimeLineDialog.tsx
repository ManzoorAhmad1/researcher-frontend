import React from "react";
import { Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader } from "rizzui";

interface ActivityTimeLineDialogProps {
  isHistoryDialogOpen: boolean;
  setIsHistoryDialogOpen: (value: boolean) => void;
  history: any;
  isLoading: boolean;
}

const ActivityTimeLineDialog: React.FC<ActivityTimeLineDialogProps> = ({
  isHistoryDialogOpen,
  setIsHistoryDialogOpen,
  history,
  isLoading,
}) => {
  return (
    <Dialog
      open={isHistoryDialogOpen}
      onOpenChange={() => setIsHistoryDialogOpen(false)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Activity Timeline</DialogTitle>
        </DialogHeader>
        <div className="relative pl-8 pt-4 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : history && history?.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p className="font-semibold text-lg text-center">
                No History Found
              </p>
            </div>
          ) : (
            history?.map((activity: any) => (
              <div key={activity?.id} className="relative pb-8">
                <div className="absolute left-0 top-0 -ml-6 h-full w-0.5 bg-gray-200" />
                <div className="absolute left-0 top-1 -ml-8 h-4 w-4 rounded-full bg-blue-500" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{activity?.activity}</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Project: {activity?.projects?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Updated By:{" "}
                    {`${
                      activity?.users?.first_name
                    } ${activity?.users?.last_name?.charAt(0)}`}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>
                      {new Date(activity?.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityTimeLineDialog;

'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    DialogHeader,
    DialogTitle,
    DialogContent,
    DialogClose,
    Dialog,
    DialogDescription,
  } from "@/components/ui/dialog";
import { CalendarIcon, ClockIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { updateReminder } from '@/apis/reminder';
import toast from "react-hot-toast";

interface EditReminderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reminder: any;
  onSuccess: () => void;
}

const EditReminderDialog = ({
  isOpen,
  onOpenChange,
  reminder,
  onSuccess,
}: EditReminderDialogProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const { register, handleSubmit, setValue, reset, formState: { isValid } } = useForm({
    defaultValues: {
      customDate: '',
      customTime: '',
    },
    mode: 'onChange'
  });

  useEffect(() => {
    if (reminder && isOpen) {
      // Parse the scheduled_at to get date and time
      const scheduledDate = new Date(reminder.scheduled_at);
      const dateStr = scheduledDate.toISOString().split('T')[0];
      const timeStr = scheduledDate.toTimeString().slice(0, 5);
      
      reset({
        customDate: dateStr,
        customTime: timeStr,
      });
    }
  }, [reminder, isOpen, reset]);

  // Reset everything when dialog closes
  useEffect(() => {
    if (!isOpen) {
      reset({ customDate: '', customTime: '' });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: any) => {
    try {
      setIsSaving(true);
      
      if (!data.customDate || !data.customTime) {
        toast.error("Please select both date and time");
        return;
      }

      const scheduled_at = new Date(`${data.customDate}T${data.customTime}:00`).toISOString();

      const payload = {
        scheduled_at,
      };

      await updateReminder(reminder.id, payload);
      toast.success("Reminder updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating reminder:", error);
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Edit Reminder
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 truncate max-w-xs">
                {reminder?.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">When would you like to be reminded?</label>
            <div className="p-4 rounded-lg border bg-purple-50 border-purple-200 space-y-3">
              <div className="flex items-center space-x-2 text-purple-700 text-sm font-medium">
                <ClockIcon className="w-4 h-4" />
                <span>Edit Date & Time</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-purple-700 mb-1">Date</label>
                  <input
                    type="date"
                    {...register("customDate", { required: true })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-purple-700 mb-1">Time</label>
                  <input
                    type="time"
                    {...register("customTime", { required: true })}
                    className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !isValid}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center ${
                isValid && !isSaving
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update Reminder'
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditReminderDialog; 
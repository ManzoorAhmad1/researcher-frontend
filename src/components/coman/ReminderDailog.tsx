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
import { MdToday, MdDateRange } from 'react-icons/md';
import { IoMdTime, IoMdCalendar } from 'react-icons/io';
import { CalendarIcon, ClockIcon,  XIcon } from 'lucide-react';
import { BsPencil, BsTrash } from 'react-icons/bs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { createReminder, updateReminder, removeReminder, getRemindersByUserTypeAndItem } from '@/apis/reminder';
import { useSelector } from 'react-redux';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import toast from "react-hot-toast";
import { Loader } from 'rizzui';



interface ReminderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  paperTitle: string;
  itemType: string;
  itemId: string;
  userId:any
  type:string
}

function getScheduledAt(option: any, customDate: any, customTime: any): string | null {
  const now = new Date();
  
  if (option === 'today') {
    const today = new Date(now);
    if (customTime) {
      const [hours, minutes] = customTime.split(':').map(Number);
      today.setHours(hours, minutes, 0, 0);
    } else {
      today.setHours(21, 0, 0, 0); // Default to 9 PM
    }
    return today.toISOString();
  }
  
  if (option === 'tomorrow') {
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    if (customTime) {
      const [hours, minutes] = customTime.split(':').map(Number);
      tomorrow.setHours(hours, minutes, 0, 0);
    } else {
      tomorrow.setHours(9, 0, 0, 0); // Default to 9 AM
    }
    return tomorrow.toISOString();
  }
  
  if (option === 'next-week') {
    const nextMonday = new Date(now);
    const day = now.getDay();
    const diff = (8 - day) % 7 || 7;
    nextMonday.setDate(now.getDate() + diff);
    if (customTime) {
      const [hours, minutes] = customTime.split(':').map(Number);
      nextMonday.setHours(hours, minutes, 0, 0);
    } else {
      return null; // No default time for next-week
    }
    return nextMonday.toISOString();
  }
  
  if (option === 'custom' && customDate && customTime) {
    return new Date(`${customDate}T${customTime}:00`).toISOString();
  }
  
  return null;
}

const ReminderDialog = ({
  isOpen,
  onOpenChange,
  paperTitle = "Research Paper",
  itemType,
  itemId,
  userId,
  type,
  
}: ReminderDialogProps) => {
  const [activeTab, setActiveTab] = useState('add');
  const [editReminder, setEditReminder] = useState<any>(null);
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<any>(null);
  const [showDeleteTooltip, setShowDeleteTooltip] = useState(false);
  const { register, handleSubmit, watch, setValue, reset, trigger, formState: { isValid, errors, isSubmitted } } = useForm({
    defaultValues: {
      text: '',
      timeType: '',
      customDate: '',
      customTime: '',
    },
    mode: 'onChange'
  });

  // Register timeType for validation
  register("timeType", { 
    required: !editReminder ? "Please select a reminder time" : false 
  });

  const selectedTime = watch('timeType');
  const customTime = watch('customTime');

  // Dynamic time options that update based on selected time
  const getTimeOptions = () => {
    const now = new Date();
    const today = new Date(now);
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    // Get the selected time for today/tomorrow
    let selectedTimeForToday = '21:00'; // Default 9 PM
    let selectedTimeForTomorrow = '09:00'; // Default 9 AM

    if (selectedTime === 'today' && customTime) {
      selectedTimeForToday = customTime;
    }
    if (selectedTime === 'tomorrow' && customTime) {
      selectedTimeForTomorrow = customTime;
    }

    // Format times for display
    const formatTimeForDisplay = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    };

    return [
      {
        id: 'today',
        label: 'Today',
        icon: <MdToday className="w-5 h-5" />,
        description: formatTimeForDisplay(selectedTimeForToday),
        color: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900/30'
      },
      {
        id: 'tomorrow',
        label: 'Tomorrow',
        icon: <IoMdTime className="w-5 h-5" />,
        description: formatTimeForDisplay(selectedTimeForTomorrow),
        color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/30'
      },
      {
        id: 'next-week',
        label: 'Next Week',
        icon: <MdDateRange className="w-5 h-5" />,
        description: 'Next Monday',
        color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/30'
      },
      {
        id: 'custom',
        label: 'Custom',
        icon: <IoMdCalendar className="w-5 h-5" />,
        description: 'Pick date & time',
        color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/20 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/30'
      }
    ];
  };

  const getReminder = async()=> {
    // Don't fetch if no itemId (for main reminder page)
    if (!itemId) {
      setReminders([]);
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await getRemindersByUserTypeAndItem({user_id:userId, type:type || "paper", item_id:itemId});
      // Filter only pending reminders
      const pendingReminders = response?.data?.data?.filter((reminder: any) => reminder?.status === 'pending') || [];
      setReminders(pendingReminders)
    } catch (error) {
      console.error("Error fetching reminders:", error);
      toast.error("Failed to load reminders. Please try again.");
    } finally {
      setIsLoading(false);
    }
   }
  
   useEffect(() => {
      if(userId){
      getReminder()
      }
  }, [userId,itemId]);

  useEffect(() => {
    if (editReminder) {
      // Parse the scheduled_at to get date and time
      const scheduledDate = new Date(editReminder.scheduled_at);
      const dateStr = scheduledDate.toISOString().split('T')[0];
      const timeStr = scheduledDate.toTimeString().slice(0, 5);
      
      reset({
        text: editReminder.description || '',
        timeType: 'custom', // Always set to custom for editing
        customDate: dateStr,
        customTime: timeStr,
      });
    } else {
      reset({
        text: '',
        timeType: '',
        customDate: '',
        customTime: '',
      });
    }
  }, [editReminder, reset]);

  // Reset everything when dialog closes
  useEffect(() => {
    if (!isOpen) {
      reset({ text: '', timeType: '', customDate: '', customTime: '' });
      setEditReminder(null);
      setActiveTab('add');
    }
  }, [isOpen, reset]);

  useEffect(() => {
    // Only set default times if not editing
    if (!editReminder) {
      if (selectedTime === 'today') {
        setValue('customTime', '21:00', { shouldValidate: true });
        // Set today's date
        const today = new Date().toISOString().split('T')[0];
        setValue('customDate', today, { shouldValidate: true });
      } else if (selectedTime === 'tomorrow') {
        setValue('customTime', '09:00', { shouldValidate: true });
        // Set tomorrow's date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setValue('customDate', tomorrow.toISOString().split('T')[0], { shouldValidate: true });
      } else if (selectedTime === 'next-week') {
        // Set next Monday's date but don't set time
        const nextMonday = new Date();
        const day = nextMonday.getDay();
        const diff = (8 - day) % 7 || 7;
        nextMonday.setDate(nextMonday.getDate() + diff);
        setValue('customDate', nextMonday.toISOString().split('T')[0], { shouldValidate: true });
      }
    }
  }, [selectedTime, setValue, editReminder]);
    const handleDeleteReminder = async (id: any) => {
    try {
      const response = await removeReminder(id, {});
      await getReminder()
      setShowDeleteTooltip(true);
      setTimeout(() => setShowDeleteTooltip(false), 3000);
      toast.success(response?.data?.message || "Reminder deleted successfully")
    } catch (error: any) {
      console.error("Error deleting reminder:", error);
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
    }
  };

  const handleDeleteClick = (reminder: any) => {
    setReminderToDelete(reminder);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (reminderToDelete) {
      await handleDeleteReminder(reminderToDelete.id);
      setShowDeleteConfirm(false);
      setReminderToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setReminderToDelete(null);
  };
  const onSubmit = async (data:any) => {
    try {
      setIsSaving(true);
      const scheduled_at = getScheduledAt(data.timeType, data.customDate, data.customTime);

      
      const payload = {
        user_id:userId,
        item_id:itemId || "",
        type: type || "reminder",
        description: data.text,
        scheduled_at,
      };
      if (editReminder) {
        const response = await updateReminder(editReminder.id, payload);

        toast.success(response?.data?.message || "Reminder has been updated successfully");
      } else {
      const response =  await createReminder(payload);
        toast.success(response?.data?.message || "Reminder has been created successfully");
      }
      setEditReminder(null);
      // Only switch to list tab and refresh if we have itemId (for specific item reminders)
      if (itemId) {
        setActiveTab('list');
        await getReminder(); // Refresh the list
      } else {
        // For main reminder page, just close the dialog
        handleClose();
      }
    } catch (error: any) {
      console.error("Error saving reminder:", error);
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
    setEditReminder(null);
    setActiveTab('add');
  };

  const handleCancel = () => {
    if (editReminder) {
      // If editing, switch to list tab and clear edit state
      setEditReminder(null);
      setActiveTab('list');
      reset();
    } else {
      // If not editing, close the modal
      handleClose();
    }
  };

 

  // Custom edit handler for tab logic
  const handleEdit = (reminder: any, mode: string) => {
    setEditReminder(reminder);
    setActiveTab('add');
  };
  



  const formatScheduledDate = (scheduledAt: string) => {
    const date = new Date(scheduledAt);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(0deg, #0F55BA -32.81%, #0E70FF 107.89%)' }}>
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {editReminder ? 'Edit Reminder' : 'Reminders'}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                  {paperTitle}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="">
            <TabsList className='flex items-center bg-gray-100 rounded-full border border-[#E7E7E7] dark:border-[#e7e7e73b] dark:bg-[#152428] w-max'>
              <TabsTrigger value="add"
              
              style={{
                background:
                activeTab === "add"
                    ? "linear-gradient(0deg, #DB8606 -32.81%, #F59B14 107.89%)"
                    : "",
                border:
                activeTab === "add"
                    ? "2px solid #FDAB2F"
                    : "2px solid #fdab2f00",
              }}
              className={`cursor-pointer px-4 py-[5px] rounded-full text-sm font-medium transition-all relative group
             ${
              activeTab === "add"
                 ? "bg-orange-400 shadow-md  !text-[#FFFFFF]"
                 : "text-gray-500   dark:text-[#999999]"
             }`}
              >{editReminder ? 'Edit Reminder' : 'Add Reminder'}</TabsTrigger>
              <TabsTrigger value="list"
              style={{
                background:
                activeTab === "list"
                    ? "linear-gradient(0deg, #DB8606 -32.81%, #F59B14 107.89%)"
                    : "",
                border:
                activeTab === "list"
                    ? "2px solid #FDAB2F"
                    : "2px solid #fdab2f00",
              }}
              className={`cursor-pointer px-4 py-[5px] rounded-full text-sm font-medium transition-all relative group
             ${
              activeTab === "list"
                 ? "bg-orange-400 shadow-md  !text-[#FFFFFF]"
                 : "text-gray-500   dark:text-[#999999]"
             }`}
              >Reminders List</TabsTrigger>
            </TabsList>
            <TabsContent value="add" >
              <form onSubmit={async (e) => {
                e.preventDefault();
                const isValid = await trigger();
                if (isValid) {
                  const formData = {
                    text: watch('text'),
                    timeType: watch('timeType'),
                    customDate: watch('customDate'),
                    customTime: watch('customTime')
                  };
                  await onSubmit(formData);
                } 
              }} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Reminder Description</label>
                  <Input
                    {...register("text", { 
                      required: "Reminder description is required" 
                    })}
                    placeholder="e.g., Review methodology section, Complete literature review..."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 ${
                      errors.text ? 'border-red-300 focus:ring-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.text && (
                    <p className="text-red-500 text-xs mt-1">{errors.text.message}</p>
                  )}
                </div>
                                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">When would you like to be reminded?</label>
                    {!editReminder && (
                      <div className="grid grid-cols-2 gap-3 mb-[12px]">
                        {getTimeOptions().map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setValue('timeType', option.id, { shouldValidate: true })}
                            className={`
                              p-4 rounded-lg border-2 transition-all duration-200 text-left
                              ${selectedTime === option.id
                                ? `${option.color} border-2 ring-2 ring-offset-2 ring-blue-400` // Stronger highlight for selected
                                : option.color
                              }
                            `}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={selectedTime === option.id ? 'text-blue-600 dark:text-blue-400' : ''}>
                                {option.icon}
                              </div>
                              <div>
                                <div className={`font-medium text-sm ${selectedTime === option.id ? 'text-blue-900 dark:text-blue-100' : ''}`}>
                                  {option.label}
                                </div>
                                <div className={`text-xs ${selectedTime === option.id ? 'text-blue-600 dark:text-blue-400' : 'text-blue-500 dark:text-blue-400'}`}>{option.description}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {!editReminder && !selectedTime && (isSubmitted || errors.timeType) && (
                      <p className="text-red-500 text-xs mt-1">Please select a reminder time</p>
                    )}
                  {/* Time only input for Today and Tomorrow */}
                  {(selectedTime === 'today' || selectedTime === 'tomorrow') && (
                    <div
                      className={`!mt-[12px] p-4 rounded-lg border space-y-3 ${
                        selectedTime === 'today' ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700' :
                        selectedTime === 'tomorrow' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700' :
                        ''
                      }`}
                    >
                      <div className="flex items-center space-x-2 text-sm font-medium">
                        <ClockIcon className="w-4 h-4" />
                        <span className={selectedTime === 'today' ? 'text-orange-700 dark:text-orange-300' : 'text-blue-700 dark:text-blue-300'}>
                          {selectedTime === 'today' ? "Today Time" : "Tomorrow Time"}
                        </span>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{color: selectedTime === 'today' ? '#c2410c' : '#1d4ed8'}}>Time</label>
                        <input
                          type="time"
                          {...register("customTime", { 
                            required: "Time is required" 
                          })}
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:border-transparent text-sm reminder-time-input dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 ${
                            errors.customTime ? 'border-red-300 focus:ring-red-500 dark:border-red-500' : 
                            selectedTime === 'today' ? 'border-orange-300 focus:ring-orange-500 dark:border-orange-600' : 'border-blue-300 focus:ring-blue-500 dark:border-blue-600'
                          }`}
                        />
                        {errors.customTime && (
                          <p className="text-red-500 text-xs mt-1">{errors.customTime.message}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Date and Time input for Custom and Next Week */}
                  {(selectedTime === 'custom' || selectedTime === 'next-week' || editReminder)  && (
                    <div
                      className={`!mt-[12px] p-4 rounded-lg border space-y-3 ${
                        selectedTime === 'next-week' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700' :
                        selectedTime === 'custom' || editReminder ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700' :
                        ''
                      }`}
                    >
                      <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-300 text-sm font-medium">
                        <ClockIcon className="w-4 h-4" />
                        <span>{editReminder ? "Edit Date & Time" : selectedTime === 'next-week' ? "Next Week Time" : "Custom Date & Time"}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Date</label>
                          <input
                            type="date"
                            {...register("customDate", { 
                              required: "Date is required" 
                            })}
                            min={new Date().toISOString().split('T')[0]}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm reminder-date-input dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 ${
                              errors.customDate ? 'border-red-300 focus:ring-red-500 dark:border-red-500' : 'border-purple-300 dark:border-purple-600'
                            }`}
                          />
                          {errors.customDate && (
                            <p className="text-red-500 text-xs mt-1">{errors.customDate.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Time</label>
                          <input
                            type="time"
                            {...register("customTime", { 
                              required: "Time is required" 
                            })}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm reminder-time-input dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 ${
                              errors.customTime ? 'border-red-300 focus:ring-red-500 dark:border-red-500' : 'border-purple-300 dark:border-purple-600'
                            }`}
                          />
                          {errors.customTime && (
                            <p className="text-red-500 text-xs mt-1">{errors.customTime.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end space-x-3 pt-4 border-t dark:border-gray-700">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                                    <button
                    type="submit"
                    disabled={isSaving}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center ${
                      isValid && (selectedTime || editReminder) && !isSaving && watch('text') && watch('customDate') && watch('customTime')
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editReminder ? 'Updating...' : 'Saving...'}
                      </>
                    ) : (
                      editReminder ? 'Update Reminder' : 'Save Reminder'
                    )}
                  </button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="list" className=' '>
              <div className="space-y-4 mb-4 ">
                <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>Your Reminders</p>
               
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader variant="threeDot" size="lg" />
                      </div>
                    ) : !reminders || reminders?.length === 0 ? (
                      <div className="text-gray-400 dark:text-gray-500 text-sm text-center">No reminders yet.</div>
                    ) : (
                      <div className='overflow-y-auto max-h-[350px] h-full space-y-2'>
                        {reminders?.map((rem:any) => (
                          <div key={rem.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-gray-900 dark:text-gray-100 mb-1">{rem?.description}</p>
                              <span className='text-[12px] text-gray-600 dark:text-gray-400'>
                                Due on {formatScheduledDate(rem.scheduled_at)}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleEdit(rem, 'minimal')}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                              >
                                <BsPencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(rem)}
                                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              >
                                <BsTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Delete Reminder
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this reminder? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={cancelDelete}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>

      
    </>
  );
};

export default ReminderDialog;

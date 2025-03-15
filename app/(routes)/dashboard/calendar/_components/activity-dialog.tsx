import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Activity, ActivityCreate, PREDEFINED_CATEGORIES, PREDEFINED_LOCATIONS } from '@/types/activity';
import { useActivity } from '@/context/activity-context';
import { format, parse } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const activitySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  location: z.string().min(1, 'Location is required'),
  category: z.string().min(1, 'Category is required'),
  customLocation: z.string().optional(),
  customCategory: z.string().optional(),
}).refine((data) => {
  if (data.location === 'Other' && !data.customLocation) {
    return false;
  }
  return true;
}, {
  message: "Please enter a custom location",
  path: ["customLocation"]
}).refine((data) => {
  if (data.category === 'Other' && !data.customCategory) {
    return false;
  }
  return true;
}, {
  message: "Please enter a custom category",
  path: ["customCategory"]
});

type ActivityFormData = z.infer<typeof activitySchema>;

interface ActivityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activity?: Activity;
  defaultDate?: Date;
}

export const ActivityDialog: React.FC<ActivityDialogProps> = ({
  isOpen,
  onClose,
  activity,
  defaultDate,
}) => {
  const { createActivity, updateActivity } = useActivity();
  const isEditing = !!activity;
  const [showCustomLocation, setShowCustomLocation] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: activity
      ? {
          title: activity.title,
          description: activity.description || '',
          date: format(new Date(activity.start_time), "yyyy-MM-dd"),
          start_time: format(new Date(activity.start_time), "HH:mm"),
          end_time: format(new Date(activity.end_time), "HH:mm"),
          location: activity.location,
          category: activity.category,
        }
      : {
          date: defaultDate ? format(defaultDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
          start_time: "09:00",
          end_time: "10:00",
          location: PREDEFINED_LOCATIONS[0],
          category: PREDEFINED_CATEGORIES[0],
          description: '',
        },
  });

  const onSubmit = async (data: ActivityFormData) => {
    try {
      const startDateTime = parse(`${data.date} ${data.start_time}`, "yyyy-MM-dd HH:mm", new Date());
      const endDateTime = parse(`${data.date} ${data.end_time}`, "yyyy-MM-dd HH:mm", new Date());
      
      const activityData: ActivityCreate = {
        title: data.title,
        description: data.description,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        location: data.location === 'Other' ? data.customLocation! : data.location,
        category: data.category === 'Other' ? data.customCategory! : data.category,
        visibility: true,
      };

      if (isEditing && activity) {
        await updateActivity(activity.id, activityData);
      } else {
        await createActivity(activityData);
      }
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to save activity:', error);
    }
  };

  const selectedLocation = watch('location');
  const selectedCategory = watch('category');

  React.useEffect(() => {
    setShowCustomLocation(selectedLocation === 'Other');
  }, [selectedLocation]);

  React.useEffect(() => {
    setShowCustomCategory(selectedCategory === 'Other');
  }, [selectedCategory]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Activity' : 'Create Activity'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Edit the details of your activity. Click update when you\'re done.'
              : 'Fill in the details for your new activity. Required fields are marked with *.'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input 
              id="title" 
              {...register('title')}
              className={cn(
                "w-full",
                errors.title && "border-red-500 focus-visible:ring-red-500"
              )}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input 
              id="description"
              {...register('description')}
              className="w-full"
              placeholder="Add a description (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              {...register('date')}
              className={cn(
                "w-full",
                errors.date && "border-red-500 focus-visible:ring-red-500"
              )}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="time"
                {...register('start_time')}
                className={cn(
                  "w-full",
                  errors.start_time && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.start_time && (
                <p className="text-sm text-red-500">{errors.start_time.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">End Time *</Label>
              <Input
                id="end_time"
                type="time"
                {...register('end_time')}
                className={cn(
                  "w-full",
                  errors.end_time && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.end_time && (
                <p className="text-sm text-red-500">{errors.end_time.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className={cn(
                    errors.location && "border-red-500 focus-visible:ring-red-500"
                  )}>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREDEFINED_LOCATIONS.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {showCustomLocation && (
              <Input
                placeholder="Enter location"
                {...register('customLocation')}
                className={cn(
                  "mt-2",
                  errors.customLocation && "border-red-500 focus-visible:ring-red-500"
                )}
              />
            )}
            {(errors.location || errors.customLocation) && (
              <p className="text-sm text-red-500">
                {errors.location?.message || errors.customLocation?.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className={cn(
                    errors.category && "border-red-500 focus-visible:ring-red-500"
                  )}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREDEFINED_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {showCustomCategory && (
              <Input
                placeholder="Enter category"
                {...register('customCategory')}
                className={cn(
                  "mt-2",
                  errors.customCategory && "border-red-500 focus-visible:ring-red-500"
                )}
              />
            )}
            {(errors.category || errors.customCategory) && (
              <p className="text-sm text-red-500">
                {errors.category?.message || errors.customCategory?.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : isEditing
                ? 'Update Activity'
                : 'Create Activity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 
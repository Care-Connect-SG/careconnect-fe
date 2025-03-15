import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Activity, ActivityCreate, ActivityFilter, activityService } from '@/types/activity';
import { useToast } from '@/hooks/use-toast';

interface ActivityContextType {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  filters: ActivityFilter;
  selectedActivity: Activity | null;
  createActivity: (data: ActivityCreate) => Promise<void>;
  updateActivity: (id: number, data: Partial<ActivityCreate>) => Promise<void>;
  deleteActivity: (id: number) => Promise<void>;
  fetchActivities: () => Promise<void>;
  setFilters: (filters: ActivityFilter) => void;
  setSelectedActivity: (activity: Activity | null) => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
};

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ActivityFilter>({});
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const { toast } = useToast();

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await activityService.list(filters);
      setActivities(data);
    } catch (err) {
      setError('Failed to fetch activities');
      toast({
        title: "Error",
        description: "Failed to fetch activities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  const createActivity = async (data: ActivityCreate) => {
    try {
      setLoading(true);
      await activityService.create(data);
      toast({
        title: "Success",
        description: "Activity created successfully",
      });
      await fetchActivities();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create activity",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateActivity = async (id: number, data: Partial<ActivityCreate>) => {
    try {
      setLoading(true);
      await activityService.update(id, data);
      toast({
        title: "Success",
        description: "Activity updated successfully",
      });
      await fetchActivities();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update activity",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteActivity = async (id: number) => {
    try {
      setLoading(true);
      await activityService.delete(id);
      toast({
        title: "Success",
        description: "Activity deleted successfully",
      });
      await fetchActivities();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete activity",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return (
    <ActivityContext.Provider
      value={{
        activities,
        loading,
        error,
        filters,
        selectedActivity,
        createActivity,
        updateActivity,
        deleteActivity,
        fetchActivities,
        setFilters,
        setSelectedActivity,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
}; 
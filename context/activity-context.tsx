import { useToast } from "@/hooks/use-toast";
import {
  Activity,
  ActivityCreate,
  ActivityFilter,
} from "@/types/activity";
import { 
  fetchActivities as fetchActivitiesApi, 
  createActivity as createActivityApi, 
  updateActivity as updateActivityApi, 
  deleteActivity as deleteActivityApi 
} from "@/app/api/activities";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

interface ActivityContextType {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  filters: ActivityFilter;
  selectedActivity: Activity | null;
  createActivity: (data: ActivityCreate) => Promise<void>;
  updateActivity: (
    id: string | number,
    data: Partial<ActivityCreate>,
  ) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  fetchActivities: () => Promise<void>;
  setFilters: (filters: ActivityFilter) => void;
  setSelectedActivity: (activity: Activity | null) => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(
  undefined,
);

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return context;
};

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ActivityFilter>({});
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );
  const { toast } = useToast();

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // The API doesn't support filters yet, so we fetch all and filter client-side
      const data = await fetchActivitiesApi();
      
      // Apply filters client-side
      let filteredData = [...data];
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(
          activity => 
            activity.title.toLowerCase().includes(searchLower) ||
            (activity.description && activity.description.toLowerCase().includes(searchLower))
        );
      }
      
      if (filters.location) {
        filteredData = filteredData.filter(
          activity => activity.location === filters.location
        );
      }
      
      if (filters.category) {
        filteredData = filteredData.filter(
          activity => activity.category === filters.category
        );
      }
      
      if (filters.start_date) {
        const filterDate = new Date(filters.start_date).toDateString();
        filteredData = filteredData.filter(activity => {
          const activityDate = new Date(activity.start_time).toDateString();
          return activityDate === filterDate;
        });
      }
      
      setActivities(filteredData);
    } catch (err) {
      setError("Failed to fetch activities");
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
      await createActivityApi(data);
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

  const updateActivity = async (
    id: string | number,
    data: Partial<ActivityCreate>,
  ) => {
    try {
      setLoading(true);
      await updateActivityApi(String(id), data);
      toast({
        title: "Success",
        description: "Activity updated successfully",
        variant: "default",
      });
      await fetchActivities();
    } catch (error) {
      console.error("Failed to update activity:", error);
      toast({
        title: "Error",
        description: "Failed to update activity",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      setLoading(true);
      await deleteActivityApi(id);
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

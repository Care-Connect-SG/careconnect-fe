"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { getReports } from "@/app/api/report";
import { useRouter } from "next/navigation";

const RecentIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        const reports = await getReports();
        // Sort by date and take most recent 3
        const recentReports = reports
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3);
        setIncidents(recentReports);
      } catch (error) {
        console.error("Error fetching incidents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'under review':
        return 'bg-blue-100 text-blue-800';
      case 'documented':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-lg font-semibold text-gray-800">Recent Incidents</p>
        <Button
          variant="link"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          onClick={() => router.push('/dashboard/incidents')}
        >
          View All
        </Button>
      </div>
      <div className="space-y-4">
        {loading ? (
          // Loading skeletons
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="p-4 bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-32 mb-2" />
                  <div className="flex gap-2 mt-3">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </Card>
          ))
        ) : incidents.length > 0 ? (
          incidents.map((incident, i) => (
            <Card
              key={i}
              className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => router.push(`/dashboard/incidents/${incident.id}`)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{incident.title || 'Untitled Incident'}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {incident.resident_name || 'Unknown Resident'} • {formatTime(incident.created_at)}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Badge className={getSeverityColor(incident.severity)}>
                      {incident.severity || 'Unknown'} Severity
                    </Badge>
                    <Badge className={getStatusColor(incident.status)}>
                      {incident.status || 'Pending'}
                    </Badge>
                  </div>
                </div>
                <ArrowRight className="text-gray-400" />
              </div>
            </Card>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">No recent incidents found</p>
        )}
      </div>
    </Card>
  );
};

export default RecentIncidents;

"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Task } from "@/types/task";
import { Clock, User } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useState } from "react";

const TaskCard = ({ task }: { task: Task }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="text-sm font-medium text-gray-900">
            {task.task_title}
          </h4>
          <p className="text-xs text-gray-500">{task.category}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500">
            {task.due_date.toLocaleDateString()}
          </span>
        </div>
        {task.priority && (
          <span
            className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(
              task.priority,
            )}`}
          >
            {task.priority}
          </span>
        )}
      </div>
    </div>
  );
};

// const ResidentColumn = ({ resident }: { resident: Resident }) => {
//   return (
//     <div className="flex-none w-80 bg-gray-50 rounded-lg p-4 mr-4">
//       <div className="flex items-center mb-4">
//         <Image
//           src={resident.image}
//           alt={resident.name}
//           className="w-10 h-10 rounded-full mr-3"
//         />
//         <div>
//           <h3 className="text-sm font-medium text-gray-900">{resident.name}</h3>
//           <p className="text-xs text-gray-500">Room {resident.room_number}</p>
//         </div>
//       </div>
//       <div className="space-y-3">
//         {resident.tasks.map((task) => (
//           <TaskCard key={task.id} task={task} />
//         ))}
//       </div>
//     </div>
//   );
// };

export default function TaskResidentView({ tasks }: { tasks: Task[] }) {
  const { data: session } = useSession();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   const fetchResidents = async () => {
  //     try {
  //       const data: ResidentRecord[] = await getResidents();
  //       const formattedResidents: Resident[] = data.map((resident) => ({
  //         ...resident,
  //         tasks: resident.tasks || [],
  //       }));
  //       setResidents(formattedResidents);
  //     } catch (err) {
  //       setError("Failed to fetch residents");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchResidents();
  // }, []);

  if (loading)
    return (
      <div className="p-8">
        <Spinner />
      </div>
    );
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex-1 bg-white p-8 pt-0">
      <div className="flex justify-end mb-8">
        <div className="flex space-x-3">
          <Button variant="secondary">
            <User className="w-4 h-4 mr-2" /> Add Resident
          </Button>
          <Button>Add Task</Button>
        </div>
      </div>
      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-full">
          {/* {residents.map((resident) => (
            <ResidentColumn key={resident.id} resident={resident} />
          ))} */}
          <div className="flex-none w-80 bg-gray-50 rounded-lg p-4 mr-4 border-2 border-dashed border-gray-200 flex items-center justify-center">
            <Button className="text-gray-500 hover:text-gray-700 text-sm font-medium">
              + Add New Resident
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

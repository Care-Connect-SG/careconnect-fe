"use client";

import { createResident, getResidents } from "@/app/api/resident";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Task } from "@/types/task";
import { ResidentRecord } from "@/types/resident";
import { Clock, Plus, User } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useEffect, useState, Dispatch, SetStateAction } from "react";
import { toTitleCase } from "@/lib/utils";
import TaskForm from "./task-form";
import AddResidentModal from "../../residents/_components/add-resident-modal";

const TaskCard = ({ task }: { task: Task }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
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
            {new Date(task.due_date).toLocaleDateString()}
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

const ResidentColumn = ({ 
  resident, 
  tasks,
  setTasks
}: { 
  resident: ResidentRecord;
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
}) => {
  const residentTasks = tasks.filter(task => task.resident === resident.id);
  const [showTaskForm, setShowTaskForm] = useState(false);

  return (
    <div className="flex-none w-96 bg-gray-50 rounded-lg p-4 mr-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">{resident.full_name}</h3>
            <p className="text-xs text-gray-500">Room {resident.room_number}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setShowTaskForm(true)}
          className="h-8 w-8"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-3">
        {residentTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
      {showTaskForm && (
        <TaskForm
          onClose={() => setShowTaskForm(false)}
          setTasks={(updater) => {
            if (typeof updater === 'function') {
              setTasks(updater);
            } else {
              setTasks(prev => [...prev, updater]);
            }
            setShowTaskForm(false);
          }}
          defaultResident={resident.id}
          open={showTaskForm}
        />
      )}
    </div>
  );
};

export default function TaskKanbanView({ tasks }: { tasks: Task[] }) {
  const { data: session } = useSession();
  const [residents, setResidents] = useState<ResidentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [taskList, setTaskList] = useState<Task[]>(tasks);
  const [showAddResidentModal, setShowAddResidentModal] = useState(false);

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        const data = await getResidents();
        setResidents(data);
      } catch (err) {
        setError("Failed to fetch residents");
      } finally {
        setLoading(false);
      }
    };
    fetchResidents();
  }, []);

  const handleAddResident = async (newResidentData: any) => {
    try {
      const createdResident = await createResident(newResidentData);
      setResidents(prev => [...prev, createdResident]);
      setShowAddResidentModal(false);
    } catch (error) {
      console.error("Error creating resident:", error);
    }
  };

  if (loading)
    return (
      <div className="p-8">
        <Spinner />
      </div>
    );
  if (error) return <p className="text-red-500">{error}</p>;

  // Group residents into rows of 3
  const residentRows = [];
  for (let i = 0; i < residents.length; i += 3) {
    residentRows.push(residents.slice(i, i + 3));
  }

  return (
    <div className="flex-1 bg-white p-8 pt-0">
      <div className="flex justify-end mb-8">
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={() => setShowAddResidentModal(true)}>
            <User className="w-4 h-4 mr-2" /> Add Resident
          </Button>
        </div>
      </div>
      <div className="space-y-8">
        {residentRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex min-w-full">
            {row.map((resident) => (
              <ResidentColumn 
                key={resident.id} 
                resident={resident} 
                tasks={taskList}
                setTasks={setTaskList}
              />
            ))}
            {rowIndex === residentRows.length - 1 && residents.length % 3 !== 0 && (
              <div className="flex-none w-96 bg-gray-50 rounded-lg p-4 mr-4 border-2 border-dashed border-gray-200 flex items-center justify-center">
                <button 
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                  onClick={() => setShowAddResidentModal(true)}
                >
                  + Add New Resident
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <AddResidentModal
        isOpen={showAddResidentModal}
        onClose={() => setShowAddResidentModal(false)}
        onSave={handleAddResident}
      />
    </div>
  );
}

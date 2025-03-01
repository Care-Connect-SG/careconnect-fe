// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   ChevronRight,
//   Search,
//   Plus,
//   MoreVertical,
//   Check,
//   Trash2,
//   Edit3,
// } from "lucide-react";
// import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
// import * as Checkbox from "@radix-ui/react-checkbox";
// import { Button } from "@/components/ui/button";
// import { getTasks } from "@/services/taskService";
// import TaskFilters from "@/components/TaskFilters";
// import { Task, TaskStatus, TaskPriority } from "@/types/task";

// const TasksHeader = () => {
//   return (
//     <div className="mb-8">
//       <div className="flex items-center text-sm text-gray-600 mb-4">
//         <a href="#" className="hover:text-blue-600">
//           Dashboard
//         </a>
//         <ChevronRight className="w-4 h-4 mx-2" />
//         <span className="text-gray-800">Tasks</span>
//       </div>
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <h1 className="text-2xl font-semibold text-gray-800">
//           Task Management
//         </h1>
//         <Button>
//           <Plus className="w-4 h-4 mr-2" /> New Task
//         </Button>
//       </div>
//     </div>
//   );
// };

// const TaskTable = () => {
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [filters, setFilters] = useState({
//     search: "",
//     priority: "",
//     status: "",
//     sort: "",
//   });

//   useEffect(() => {
//     fetchTasks();
//   }, [filters]);

//   const fetchTasks = async () => {
//     try {
//       const data: Task[] = await getTasks(filters);
//       setTasks(data);
//     } catch (error) {
//       console.error("Error fetching tasks", error);
//     }
//   };

//   const getStatusColor = (status: TaskStatus): string => {
//     switch (status) {
//       case TaskStatus.COMPLETED:
//         return "bg-green-100 text-green-800";
//       case TaskStatus.DELAYED:
//         return "bg-yellow-100 text-yellow-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const getPriorityColor = (priority?: TaskPriority): string => {
//     switch (priority) {
//       case TaskPriority.HIGH:
//         return "bg-red-100 text-red-800";
//       case TaskPriority.MEDIUM:
//         return "bg-yellow-100 text-yellow-800";
//       default:
//         return "bg-green-100 text-green-800";
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                 <Checkbox.Root className="flex h-4 w-4 items-center justify-center rounded border border-gray-300 bg-white">
//                   <Checkbox.Indicator>
//                     <Check className="h-3 w-3 text-blue-600" />
//                   </Checkbox.Indicator>
//                 </Checkbox.Root>
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                 Task
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                 Resident {/* placeholder */}
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                 Assigned To {/* placeholder */}
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                 Priority
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                 Status
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                 Due Date
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200">
//             {tasks.map((task) => (
//               <tr key={task._id} className="hover:bg-gray-50">
//                 <td className="px-6 py-4 text-sm font-medium text-gray-900">
//                   {task.task_title}
//                 </td>
//                 <td className="px-6 py-4 text-sm text-gray-900">
//                   {task.resident ?? "N/A"} {/* placeholder */}
//                 </td>
//                 <td className="px-6 py-4 text-sm text-gray-900">
//                   {task.assigned_to?.join(", ") ?? "Unassigned"}{" "}
//                   {/* placeholder */}
//                 </td>
//                 <td className="px-6 py-4">
//                   <span
//                     className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(
//                       task.priority
//                     )}`}
//                   >
//                     {task.priority}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4">
//                   <span
//                     className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
//                       task.status
//                     )}`}
//                   >
//                     {task.status}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 text-sm">
//                   {new Date(task.due_date ?? "").toLocaleDateString()}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export const TasksPage = () => {
//   return (
//     <div className="flex-1 bg-gray-50 p-8">
//       <TasksHeader />
//       <TaskFilters />
//       <TaskTable />
//     </div>
//   );
// };

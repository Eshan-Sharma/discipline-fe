"use client";

import { motion } from "framer-motion";
import { TaskCard } from "./TaskCard";
import { Task } from "./DisciplineApp";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface ActiveTasksListProps {
  tasks: Task[];
  onResolveTask: (taskId: number, completed: boolean) => void;
  isLoading: boolean;
  userPublicKey?: string;
}

export function ActiveTasksList({
  tasks,
  onResolveTask,
  isLoading,
  userPublicKey,
}: ActiveTasksListProps) {
  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const completedTasks = tasks.filter((task) => task.status === "completed");
  const failedTasks = tasks.filter((task) => task.status === "failed");

  if (tasks.length === 0) {
    return (
      <motion.section
        className="bg-gray-800 rounded-2xl p-8 border border-gray-700 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-300 mb-2">
          No Tasks Yet
        </h3>
        <p className="text-gray-400">
          Create your first discipline task to get started
        </p>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      {/* Active Tasks */}
      {pendingTasks.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-yellow-600 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Active Tasks</h2>
            <span className="px-3 py-1 bg-yellow-600 text-white text-sm font-medium rounded-full">
              {pendingTasks.length}
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pendingTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                onResolveTask={onResolveTask}
                isLoading={isLoading}
                isOwner={task.owner === userPublicKey}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-green-600 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Completed Tasks</h2>
            <span className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-full">
              {completedTasks.length}
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {completedTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                onResolveTask={onResolveTask}
                isLoading={isLoading}
                isOwner={task.owner === userPublicKey}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* Failed Tasks */}
      {failedTasks.length > 0 && (
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-red-600 rounded-lg">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Failed Tasks</h2>
            <span className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-full">
              {failedTasks.length}
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {failedTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                onResolveTask={onResolveTask}
                isLoading={isLoading}
                isOwner={task.owner === userPublicKey}
                index={index}
              />
            ))}
          </div>
        </div>
      )}
    </motion.section>
  );
}

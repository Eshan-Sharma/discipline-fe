"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Clock, DollarSign } from "lucide-react";

interface CreateTaskSectionProps {
  onCreateTask: (
    description: string,
    duration: number,
    stakeAmount: number
  ) => void;
  isLoading: boolean;
  connected: boolean;
}

export function CreateTaskSection({
  onCreateTask,
  isLoading,
  connected,
}: CreateTaskSectionProps) {
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [durationType, setDurationType] = useState<"minutes" | "hours">(
    "minutes"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim() || !duration || !stakeAmount) {
      return;
    }

    const durationInSeconds =
      durationType === "hours"
        ? parseInt(duration) * 3600
        : parseInt(duration) * 60;

    onCreateTask(
      description.trim(),
      durationInSeconds,
      parseFloat(stakeAmount)
    );

    // Reset form
    setDescription("");
    setDuration("");
    setStakeAmount("");
  };

  return (
    <motion.section
      className="bg-gray-800 rounded-2xl p-8 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-green-600 rounded-lg">
          <Plus className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          Create Discipline Task
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Task Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Exercise for 30 minutes, Study programming..."
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duration
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
                min="1"
                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                disabled={isLoading}
              />
              <select
                value={durationType}
                onChange={(e) =>
                  setDurationType(e.target.value as "minutes" | "hours")
                }
                className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                disabled={isLoading}
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stake Amount (SOL)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="0.1"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              disabled={isLoading}
            />
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={
            !connected ||
            isLoading ||
            !description.trim() ||
            !duration ||
            !stakeAmount
          }
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
          whileHover={{ scale: connected ? 1.02 : 1 }}
          whileTap={{ scale: connected ? 0.98 : 1 }}
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>Create Task & Stake SOL</span>
            </>
          )}
        </motion.button>

        {!connected && (
          <p className="text-center text-gray-400 text-sm">
            Connect your wallet to create tasks
          </p>
        )}
      </form>
    </motion.section>
  );
}

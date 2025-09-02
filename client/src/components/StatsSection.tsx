"use client";

import { motion } from "framer-motion";
import { Heart, TrendingUp, Users } from "lucide-react";

interface StatsSectionProps {
  totalDonated: number;
}

export function StatsSection({ totalDonated }: StatsSectionProps) {
  return (
    <motion.section
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <motion.div
        className="bg-gradient-to-br from-pink-500/20 to-red-500/20 border border-pink-500/30 rounded-xl p-6"
        whileHover={{ scale: 1.05 }}
      >
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-pink-600 rounded-lg">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Total Donated</h3>
        </div>
        <p className="text-3xl font-bold text-pink-400">
          {totalDonated.toFixed(2)} SOL
        </p>
        <p className="text-sm text-gray-400 mt-1">From failed tasks</p>
      </motion.div>

      <motion.div
        className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6"
        whileHover={{ scale: 1.05 }}
      >
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-blue-600 rounded-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Success Rate</h3>
        </div>
        <p className="text-3xl font-bold text-blue-400">87%</p>
        <p className="text-sm text-gray-400 mt-1">Community average</p>
      </motion.div>

      <motion.div
        className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6"
        whileHover={{ scale: 1.05 }}
      >
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-green-600 rounded-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white">Active Users</h3>
        </div>
        <p className="text-3xl font-bold text-green-400">1,234</p>
        <p className="text-sm text-gray-400 mt-1">Building discipline</p>
      </motion.div>
    </motion.section>
  );
}

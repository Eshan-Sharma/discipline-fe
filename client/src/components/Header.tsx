"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";
import { Target } from "lucide-react";

export function Header() {
  return (
    <motion.header
      className="flex items-center justify-between mb-12"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-600 rounded-lg">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Discipline Rewarded
        </h1>
      </div>

      <div className="wallet-adapter-button-trigger">
        <WalletMultiButton />
      </div>
    </motion.header>
  );
}

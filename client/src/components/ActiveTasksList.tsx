"use client";

import { motion } from "framer-motion";
import { TaskCard } from "./TaskCard";
import { Task } from "./DisciplineApp";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { PublicKey, Connection, Transaction } from "@solana/web3.js";
import idl from "../../../discipline.json";
import type discipline from "../../../discipline.json";
import { AnchorProvider, Program, Idl, Wallet } from "@coral-xyz/anchor";
import { useEffect, useState } from "react";
import BN from "@coral-xyz/anchor";

import { BorshAccountsCoder } from "@coral-xyz/anchor";

const coder = new BorshAccountsCoder(idl as Idl);

interface ActiveTasksListProps {
  tasks: Task[];
  onResolveTask: (taskId: number, completed: boolean) => void;
  isLoading: boolean;
  userPublicKey?: string;
}
const PROGRAM_ID = new PublicKey(
  "8d8w7DMGf8G41nmg2qnDGDqL6d4hGABNPHLpTnTUfoqn"
);
const SOLANA_RPC = "https://api.devnet.solana.com";

// ---- types based on your IDL ----
type TaskAccount = {
  taskId: typeof BN;
  owner: PublicKey;
  description: string;
  stakeAmount: typeof BN;
  expiresAt: typeof BN;
  status:
    | { pending?: Record<string, never> }
    | { completed?: Record<string, never> }
    | { failed?: Record<string, never> };
  taskBump: number;
  vaultBump: number;
};

interface MinimalWallet {
  publicKey: PublicKey;
  signTransaction: (tx: Transaction) => Promise<Transaction>;
  signAllTransactions: (txs: Transaction[]) => Promise<Transaction[]>;
}
export async function fetchTasks(userPublicKey: string) {
  const connection = new Connection(SOLANA_RPC, "confirmed");

  const coder = new BorshAccountsCoder(idl as Idl);

  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [
      {
        memcmp: {
          offset: 8 + 8, // discriminator (8) + task_id (8)
          bytes: userPublicKey,
        },
      },
    ],
  });
  // Decode Task accounts
  const tasks = accounts.map(({ account, pubkey }) => {
    const decoded = coder.decode<TaskAccount>("Task", account.data);

    const status: "pending" | "completed" | "failed" =
      "pending" in decoded.status
        ? "pending"
        : "completed" in decoded.status
        ? "completed"
        : "failed";

    return {
      id: Number(decoded.taskId),
      owner: decoded.owner.toBase58(),
      description: decoded.description,
      stakeAmount: Number(decoded.stakeAmount),
      expiresAt: Number(decoded.expiresAt),
      status,
      duration: 7, // Default duration - adjust as needed
      createdAt: Number(decoded.expiresAt) - 7 * 24 * 60 * 60, // Calculate from expiresAt
    };
  });

  return tasks;
}

export function ActiveTasksList({
  onResolveTask,
  isLoading,
  userPublicKey,
}: ActiveTasksListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!userPublicKey) return;
    fetchTasks(userPublicKey).then(setTasks).catch(console.error);
  }, [userPublicKey]);

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

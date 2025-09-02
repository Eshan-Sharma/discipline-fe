"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, XCircle, Trophy, Heart } from "lucide-react";
import { Task } from "././DisciplineApp";
import idl from "../../../discipline.json";

/////////
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

// Program ID
const PROGRAM_ID = new PublicKey(
  "8d8w7DMGf8G41nmg2qnDGDqL6d4hGABNPHLpTnTUfoqn"
);

// Seeds
const getTaskPDA = async (owner: PublicKey, taskId: number) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("task"),
      owner.toBuffer(),
      new anchor.BN(taskId).toArrayLike(Buffer, "le", 8),
    ],
    PROGRAM_ID
  );
};

const getVaultPDA = async (taskPda: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), taskPda.toBuffer()],
    PROGRAM_ID
  );
};

const getGlobalStatePDA = () => {
  return PublicKey.findProgramAddressSync([Buffer.from("state")], PROGRAM_ID);
};

////////////

interface TaskCardProps {
  task: Task;
  onResolveTask: (taskId: number, completed: boolean) => void;
  isLoading: boolean;
  isOwner: boolean;
  index: number;
}

export function TaskCard({
  task,
  onResolveTask,
  isOwner,
  index,
}: TaskCardProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  onResolveTask = async (taskId: number, completed: boolean) => {
    try {
      setIsLoading(true);

      const provider = anchor.AnchorProvider.env(); // or your custom provider
      const program = new anchor.Program(idl, provider);

      const owner = provider.wallet.publicKey;

      const [taskPda] = await getTaskPDA(owner, taskId);
      const [vaultPda] = await getVaultPDA(taskPda);
      const [globalStatePda] = await getGlobalStatePDA();

      // Replace with your actual charity account (must match program check)
      const CHARITY_WALLET = new PublicKey(
        "3rzenMHF1M27EAK7moeTgLdKepu1pXWvFs9jTWpAeCCb"
      );

      const txSig = await program.methods
        .resolveTask(new anchor.BN(taskId), completed)
        .accounts({
          owner,
          task: taskPda,
          vault: vaultPda,
          charity: CHARITY_WALLET,
          globalState: globalStatePda,
          systemProgram: anchor.web3.SystemProgram.programId,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        })
        .rpc();

      console.log("✅ Task resolved:", txSig);
    } catch (err) {
      console.error("❌ Resolve task failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (task.status !== "pending") return;

    const updateTimer = () => {
      const remaining = Math.max(0, task.expiresAt - Date.now());
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [task.expiresAt, task.status]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else {
      return `${minutes}m ${remainingSeconds}s`;
    }
  };

  const getStatusIcon = () => {
    switch (task.status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case "completed":
        return "border-green-500 bg-green-500/10";
      case "failed":
        return "border-red-500 bg-red-500/10";
      default:
        return "border-yellow-500 bg-yellow-500/10";
    }
  };

  const canResolve =
    task.status === "pending" && timeRemaining === 0 && isOwner;

  return (
    <motion.div
      className={`bg-gray-800 rounded-xl p-6 border-2 ${getStatusColor()} transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium text-gray-300 capitalize">
            {task.status}
          </span>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-1 text-blue-400">
            <Trophy className="w-4 h-4" />
            <span className="font-semibold">{task.stakeAmount} SOL</span>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2">
        {task.description}
      </h3>

      <div className="space-y-3">
        {task.status === "pending" && (
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Time Remaining:</span>
              <span
                className={`font-mono font-semibold ${
                  timeRemaining > 0 ? "text-yellow-400" : "text-red-400"
                }`}
              >
                {timeRemaining > 0 ? formatTime(timeRemaining) : "EXPIRED"}
              </span>
            </div>
          </div>
        )}

        {task.status === "completed" && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-green-400">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-medium">
                SOL returned to wallet
              </span>
            </div>
          </div>
        )}

        {task.status === "failed" && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-red-400">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">
                SOL donated to charity
              </span>
            </div>
          </div>
        )}

        {canResolve && (
          <div className="flex space-x-3 pt-2">
            <motion.button
              onClick={() => onResolveTask(task.id, true)}
              disabled={isLoading}
              className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Complete
            </motion.button>
            <motion.button
              onClick={() => onResolveTask(task.id, false)}
              disabled={isLoading}
              className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Failed
            </motion.button>
          </div>
        )}

        {task.status === "pending" && timeRemaining > 0 && (
          <p className="text-xs text-gray-400 text-center pt-2">
            Task can be resolved when timer expires
          </p>
        )}
      </div>
    </motion.div>
  );
}

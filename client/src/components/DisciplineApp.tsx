"use client";

import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import toast from "react-hot-toast";
import { Header } from "./Header";
import { CreateTaskSection } from "./CreateTaskSection";
import { ActiveTasksList } from "./ActiveTasksList";
import { StatsSection } from "./StatsSection";

import idl from "../../../../anchor_project/discipline/target/idl/discipline.json";

const DISCIPLINE_IDL = idl as unknown;
const PROGRAM_ID = new PublicKey(
  "8d8w7DMGf8G41nmg2qnDGDqL6d4hGABNPHLpTnTUfoqn"
);

// ⚠️ Replace with your program’s actual hardcoded charity pubkey
const CHARITY_PUBKEY = new PublicKey(
  "3rzenMHF1M27EAK7moeTgLdKepu1pXWvFs9jTWpAeCCb"
);

export interface Task {
  id: number;
  description: string;
  stakeAmount: number;
  duration: number;
  createdAt: number;
  expiresAt: number;
  status: "pending" | "completed" | "failed";
  owner: string;
}

export function DisciplineApp() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalDonated, setTotalDonated] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const getProgram = () => {
    if (!wallet.publicKey) return null;
    const provider = new AnchorProvider(
      connection,
      wallet as any,
      AnchorProvider.defaultOptions()
    );
    return new Program(DISCIPLINE_IDL, PROGRAM_ID, provider);
  };

  // fetch tasks + donation tally
  useEffect(() => {
    const loadTasks = async () => {
      if (!wallet.connected || !wallet.publicKey) return;
      try {
        const program = getProgram();
        if (!program) return;

        // fetch all tasks
        const allTasks = await program.account.task.all();
        const userTasks = allTasks.filter(
          (t) => t.account.owner.toString() === wallet.publicKey?.toString()
        );

        setTasks(
          userTasks.map((t) => {
            const status = Object.keys(t.account.status)[0].toLowerCase();
            return {
              id: t.account.taskId.toNumber(),
              description: t.account.description,
              stakeAmount:
                t.account.stakeAmount.toNumber() / web3.LAMPORTS_PER_SOL,
              duration: 0, // could be derived if you store explicitly
              createdAt: Date.now(), // placeholder if not in struct
              expiresAt: t.account.expiresAt.toNumber() * 1000,
              status: status as "pending" | "completed" | "failed",
              owner: t.account.owner.toString(),
            };
          })
        );

        // fetch global donations
        const [globalStatePda] = web3.PublicKey.findProgramAddressSync(
          [Buffer.from("state")],
          program.programId
        );
        const globalState = await program.account.globalState.fetch(
          globalStatePda
        );
        setTotalDonated(
          globalState.totalDonated.toNumber() / web3.LAMPORTS_PER_SOL
        );
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };

    loadTasks();
  }, [wallet.connected, wallet.publicKey, connection]);

  const createTask = async (
    description: string,
    duration: number,
    stakeAmount: number
  ) => {
    if (!wallet.connected || !wallet.publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    try {
      const program = getProgram();
      if (!program) throw new Error("Program not initialized");

      const taskId = new BN(Date.now());

      const [taskPda] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("task"),
          wallet.publicKey.toBuffer(),
          taskId.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      const [vaultPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), taskPda.toBuffer()],
        program.programId
      );

      await program.methods
        .createTask(
          taskId,
          description,
          new BN(duration),
          new BN(stakeAmount * web3.LAMPORTS_PER_SOL)
        )
        .accounts({
          owner: wallet.publicKey,
          task: taskPda,
          vault: vaultPda,
          systemProgram: web3.SystemProgram.programId,
          clock: web3.SYSVAR_CLOCK_PUBKEY,
        })
        .rpc();

      toast.success(`Task created! ${stakeAmount} SOL staked`);
    } catch (err) {
      console.error("Error creating task:", err);
      toast.error("Failed to create task");
    } finally {
      setIsLoading(false);
    }
  };

  const resolveTask = async (taskId: number, completed: boolean) => {
    if (!wallet.connected || !wallet.publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    try {
      const program = getProgram();
      if (!program) throw new Error("Program not initialized");

      const taskIdBN = new BN(taskId);

      const [taskPda] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("task"),
          wallet.publicKey.toBuffer(),
          taskIdBN.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      const [vaultPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), taskPda.toBuffer()],
        program.programId
      );

      const [globalStatePda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("state")],
        program.programId
      );

      await program.methods
        .resolveTask(taskIdBN, completed)
        .accounts({
          owner: wallet.publicKey,
          task: taskPda,
          vault: vaultPda,
          charity: CHARITY_PUBKEY,
          globalState: globalStatePda,
          systemProgram: web3.SystemProgram.programId,
          clock: web3.SYSVAR_CLOCK_PUBKEY,
        })
        .rpc();

      if (completed) {
        toast.success("Task completed! SOL returned to your wallet");
      } else {
        toast.success("Task failed. Stake donated to charity");
      }
    } catch (err) {
      console.error("Error resolving task:", err);
      toast.error("Failed to resolve task");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Header />

        <div className="grid gap-8 md:gap-12">
          <StatsSection totalDonated={totalDonated} />

          <CreateTaskSection
            onCreateTask={createTask}
            isLoading={isLoading}
            connected={wallet.connected}
          />

          <ActiveTasksList
            tasks={tasks}
            onResolveTask={resolveTask}
            isLoading={isLoading}
            userPublicKey={wallet.publicKey?.toString()}
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Header } from "./Header";
import { CreateTaskSection } from "./CreateTaskSection";
import { ActiveTasksList } from "./ActiveTasksList";
import { StatsSection } from "./StatsSection";

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
  // 🔹 Local mock state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalDonated, setTotalDonated] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [connected, setConnected] = useState(true); // pretend wallet is always connected
  const [mockUser] = useState("mock-user-public-key");

  // load some fake tasks at startup
  useEffect(() => {
    const fakeTasks: Task[] = [
      {
        id: 1,
        description: "Go to gym",
        stakeAmount: 1,
        duration: 7,
        createdAt: Date.now(),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        status: "pending",
        owner: mockUser,
      },
      {
        id: 2,
        description: "Read a book",
        stakeAmount: 0.5,
        duration: 3,
        createdAt: Date.now(),
        expiresAt: Date.now() + 3 * 24 * 60 * 60 * 1000,
        status: "failed",
        owner: mockUser,
      },
    ];
    setTasks(fakeTasks);
    setTotalDonated(0.5);
  }, [mockUser]);

  // mock createTask
  const createTask = async (
    description: string,
    duration: number,
    stakeAmount: number
  ) => {
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const newTask: Task = {
        id: Date.now(),
        description,
        stakeAmount,
        duration,
        createdAt: Date.now(),
        expiresAt: Date.now() + duration * 24 * 60 * 60 * 1000,
        status: "pending",
        owner: mockUser,
      };
      setTasks((prev) => [...prev, newTask]);
      setIsLoading(false);
      toast.success(`Task created! ${stakeAmount} SOL staked (mock)`);
    }, 800);
  };

  // mock resolveTask
  const resolveTask = async (taskId: number, completed: boolean) => {
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: completed ? "completed" : "failed" }
            : t
        )
      );

      if (completed) {
        toast.success("Task completed! SOL returned (mock)");
      } else {
        setTotalDonated((prev) => prev + 1); // pretend we donate 1 SOL
        toast.success("Task failed. Stake donated to charity (mock)");
      }

      setIsLoading(false);
    }, 800);
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
            connected={connected}
          />

          <ActiveTasksList
            tasks={tasks}
            onResolveTask={resolveTask}
            isLoading={isLoading}
            userPublicKey={mockUser}
          />
        </div>
      </div>
    </div>
  );
}

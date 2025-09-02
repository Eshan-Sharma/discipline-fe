import { Task } from "@/types";

// Local storage keys
const TASKS_KEY = "discipline_tasks";
const CHARITY_DONATIONS_KEY = "discipline_charity_donations";

// Get all tasks for a wallet
export const getTasks = (walletAddress: string): Task[] => {
  if (typeof window === "undefined") return [];

  try {
    const storedTasks = localStorage.getItem(TASKS_KEY);
    if (!storedTasks) return [];

    const allTasks: Task[] = JSON.parse(storedTasks);
    return allTasks.filter((task) => task.owner === walletAddress);
  } catch (error) {
    console.error("Error loading tasks:", error);
    return [];
  }
};

// Save a task
export const saveTask = (task: Task): void => {
  if (typeof window === "undefined") return;

  try {
    const storedTasks = localStorage.getItem(TASKS_KEY);
    const allTasks: Task[] = storedTasks ? JSON.parse(storedTasks) : [];

    // Add or update task
    const existingIndex = allTasks.findIndex((t) => t.taskId === task.taskId);
    if (existingIndex >= 0) {
      allTasks[existingIndex] = task;
    } else {
      allTasks.push(task);
    }

    localStorage.setItem(TASKS_KEY, JSON.stringify(allTasks));
  } catch (error) {
    console.error("Error saving task:", error);
  }
};

// Update task status
export const updateTaskStatus = (
  taskId: string,
  status: Task["status"]
): void => {
  if (typeof window === "undefined") return;

  try {
    const storedTasks = localStorage.getItem(TASKS_KEY);
    if (!storedTasks) return;

    const allTasks: Task[] = JSON.parse(storedTasks);
    const taskIndex = allTasks.findIndex((t) => t.taskId === taskId);

    if (taskIndex >= 0) {
      allTasks[taskIndex].status = status;
      localStorage.setItem(TASKS_KEY, JSON.stringify(allTasks));
    }
  } catch (error) {
    console.error("Error updating task status:", error);
  }
};

// Get total charity donations
export const getTotalCharityDonations = (): number => {
  if (typeof window === "undefined") return 0;

  try {
    const stored = localStorage.getItem(CHARITY_DONATIONS_KEY);
    return stored ? parseFloat(stored) : 0;
  } catch (error) {
    console.error("Error getting charity donations:", error);
    return 0;
  }
};

// Add to charity donations
export const addCharityDonation = (amount: number): void => {
  if (typeof window === "undefined") return;

  try {
    const current = getTotalCharityDonations();
    const newTotal = current + amount;
    localStorage.setItem(CHARITY_DONATIONS_KEY, newTotal.toString());
  } catch (error) {
    console.error("Error adding charity donation:", error);
  }
};

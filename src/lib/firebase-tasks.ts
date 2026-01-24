import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { Task } from './types';

// Helper to ensure db is initialized
function getDb() {
  if (!db) {
    throw new Error('Firebase Firestore is not initialized. Please check your environment variables.');
  }
  return db;
}

const TASKS_COLLECTION = 'tasks';

// Convert Firestore Timestamp to Date
function timestampToDate(timestamp: Timestamp | Date | null | undefined): Date {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
}

// Convert Date to Firestore Timestamp
function dateToTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}

// Convert Firestore document to Task
function firestoreToTask(docData: any, id: string): Task {
  return {
    id,
    description: docData.description || '',
    deadline: timestampToDate(docData.deadline),
    priority: docData.priority || 'medium',
    completed: docData.completed || false,
    estimatedTime: docData.estimatedTime || 0,
  };
}

// Convert Task to Firestore document
function taskToFirestore(task: Task): any {
  return {
    description: task.description,
    deadline: dateToTimestamp(task.deadline),
    priority: task.priority,
    completed: task.completed,
    estimatedTime: task.estimatedTime,
    updatedAt: serverTimestamp(),
  };
}

/**
 * Get all tasks for a user
 */
export async function getTasks(userId?: string): Promise<Task[]> {
  try {
    const firestoreDb = getDb();
    const tasksRef = collection(firestoreDb, TASKS_COLLECTION);
    let q = query(tasksRef, orderBy('deadline', 'asc'));
    
    // If userId is provided, filter by userId
    if (userId) {
      q = query(tasksRef, where('userId', '==', userId), orderBy('deadline', 'asc'));
    }
    
    const querySnapshot = await getDocs(q);
    const tasks: Task[] = [];
    
    querySnapshot.forEach((doc) => {
      tasks.push(firestoreToTask(doc.data(), doc.id));
    });
    
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}

/**
 * Get a single task by ID
 */
export async function getTask(taskId: string): Promise<Task | null> {
  try {
    const firestoreDb = getDb();
    const taskRef = doc(firestoreDb, TASKS_COLLECTION, taskId);
    const taskSnap = await getDoc(taskRef);
    
    if (taskSnap.exists()) {
      return firestoreToTask(taskSnap.data(), taskSnap.id);
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching task:', error);
    throw error;
  }
}

/**
 * Create a new task
 */
export async function createTask(task: Omit<Task, 'id' | 'completed'>, userId?: string): Promise<Task> {
  try {
    const firestoreDb = getDb();
    const tasksRef = collection(firestoreDb, TASKS_COLLECTION);
    // Add completed: false by default
    const taskWithDefaults: Task = { ...task, id: '', completed: false };
    const taskData: any = taskToFirestore(taskWithDefaults);
    
    if (userId) {
      taskData.userId = userId;
    }
    taskData.createdAt = serverTimestamp();
    
    const docRef = await addDoc(tasksRef, taskData);
    const createdTask = await getTask(docRef.id);
    
    if (!createdTask) {
      throw new Error('Failed to retrieve created task');
    }
    
    return createdTask;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

/**
 * Update an existing task
 */
export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
  try {
    const firestoreDb = getDb();
    const taskRef = doc(firestoreDb, TASKS_COLLECTION, taskId);
    const updateData: any = {};
    
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.deadline !== undefined) updateData.deadline = dateToTimestamp(updates.deadline);
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.completed !== undefined) updateData.completed = updates.completed;
    if (updates.estimatedTime !== undefined) updateData.estimatedTime = updates.estimatedTime;
    
    updateData.updatedAt = serverTimestamp();
    
    await updateDoc(taskRef, updateData);
    const updatedTask = await getTask(taskId);
    
    if (!updatedTask) {
      throw new Error('Failed to retrieve updated task');
    }
    
    return updatedTask;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<void> {
  try {
    const firestoreDb = getDb();
    const taskRef = doc(firestoreDb, TASKS_COLLECTION, taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

/**
 * Update multiple tasks (for batch operations)
 */
export async function updateTasks(tasks: Task[]): Promise<Task[]> {
  try {
    const firestoreDb = getDb();
    const updatePromises = tasks.map((task) => {
      const taskRef = doc(firestoreDb, TASKS_COLLECTION, task.id);
      const updateData: any = {
        description: task.description,
        deadline: dateToTimestamp(task.deadline),
        priority: task.priority,
        completed: task.completed,
        estimatedTime: task.estimatedTime,
        updatedAt: serverTimestamp(),
      };
      return updateDoc(taskRef, updateData);
    });
    
    await Promise.all(updatePromises);
    
    // Fetch updated tasks
    const updatedTasks = await Promise.all(
      tasks.map((task) => getTask(task.id))
    );
    
    return updatedTasks.filter((task): task is Task => task !== null);
  } catch (error) {
    console.error('Error updating tasks:', error);
    throw error;
  }
}

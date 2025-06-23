import { Low, JSONFile } from 'lowdb';
import path from 'path';

type User = {
  id: number;
  balance: number;
  energy: number;
  invitedFriends: number;
  earnedFromFriends: number;
  completedTasks: number[];
  purchasedGifts: number[];
  lastEnergyUpdate: string;
};

type Database = {
  users: User[];
};

const file = path.join(__dirname, 'db.json');
const adapter = new JSONFile<Database>(file);
const db = new Low<Database>(adapter);

export const initializeDatabase = async () => {
  await db.read();
  
  db.data ||= { users: [] };
  await db.write();
};

export const getUser = async (userId: number): Promise<User> => {
  await db.read();
  
  const user = db.data?.users.find(u => u.id === userId);
  
  if (user) {
    // Check if energy needs to be reset (once per day)
    const now = new Date();
    const lastUpdate = new Date(user.lastEnergyUpdate);
    
    if (now.getDate() !== lastUpdate.getDate() || 
        now.getMonth() !== lastUpdate.getMonth() || 
        now.getFullYear() !== lastUpdate.getFullYear()) {
      user.energy = 100;
      user.lastEnergyUpdate = now.toISOString();
      await db.write();
    }
    
    return user;
  }
  
  // Create new user if not exists
  const newUser: User = {
    id: userId,
    balance: 100,
    energy: 100,
    invitedFriends: 0,
    earnedFromFriends: 0,
    completedTasks: [],
    purchasedGifts: [],
    lastEnergyUpdate: new Date().toISOString()
  };
  
  db.data?.users.push(newUser);
  await db.write();
  
  return newUser;
};

export const updateUser = async (userId: number, updates: Partial<User>) => {
  await db.read();
  
  const userIndex = db.data?.users.findIndex(u => u.id === userId) ?? -1;
  
  if (userIndex !== -1 && db.data) {
    db.data.users[userIndex] = {
      ...db.data.users[userIndex],
      ...updates,
      id: userId // Ensure ID doesn't change
    };
    
    await db.write();
  }
};

export const addReferral = async (userId: number, referrerId: number) => {
  await db.read();
  
  // Update referrer's stats
  const referrerIndex = db.data?.users.findIndex(u => u.id === referrerId) ?? -1;
  
  if (referrerIndex !== -1 && db.data) {
    db.data.users[referrerIndex].invitedFriends += 1;
    db.data.users[referrerIndex].earnedFromFriends += 100;
    db.data.users[referrerIndex].balance += 100;
    
    await db.write();
  }
  
  // Give bonus to new user
  const userIndex = db.data?.users.findIndex(u => u.id === userId) ?? -1;
  
  if (userIndex !== -1 && db.data) {
    db.data.users[userIndex].balance += 50;
    await db.write();
  }
};
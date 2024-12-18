import { WorkerService } from '../../workers';
import type { Worker } from '../../../types';

const CACHE_KEY = 'workers_map_cache';
const CACHE_EXPIRY_KEY = 'workers_map_cache_expiry';
const CACHE_DURATION = 5 * 60 * 1000;

export async function getWorkersMap(): Promise<Map<string, Worker>> {
  const now = Date.now();
  const cachedData = localStorage.getItem(CACHE_KEY);
  const cacheExpiry = Number(localStorage.getItem(CACHE_EXPIRY_KEY)) || 0;
  
  if (cachedData && now < cacheExpiry) {
    try {
      const parsed = JSON.parse(cachedData);
      return new Map(Object.entries(parsed));
    } catch (error) {
      console.warn('Error parsing workers cache:', error);
    }
  }

  try {
    const workers = await WorkerService.getWorkers();
    const workersMap = new Map(workers.map(w => [w.id, w]));
    
    // Actualizar caché
    localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(workersMap)));
    localStorage.setItem(CACHE_EXPIRY_KEY, String(now + CACHE_DURATION));
    
    return workersMap;
  } catch (error) {
    console.error('Error fetching workers:', error);
    throw error;
  }
}

export function clearWorkersCache(): void {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_EXPIRY_KEY);
}
import { log } from '@/lib/logger';

type Job<T> = () => Promise<T>;

type QueueState = {
  queued: number;
  running: number;
  errors: number;
};

const MAX_CONCURRENCY = 1;
const QUEUE_LIMIT = 3;

const pending: Array<() => void> = [];
let running = 0;
let erroredJobs = 0;

export function getQueueState(): QueueState {
  return { queued: pending.length, running, errors: erroredJobs };
}

export async function submitJob<T>(job: Job<T>): Promise<T> {
  if (running >= MAX_CONCURRENCY) {
    if (pending.length >= QUEUE_LIMIT) {
      throw new Error('Generation queue is full. Wait for the current job to finish and try again.');
    }
    log('warn', 'generation_queue', 'Job queued behind an in-progress generation', {
      queued: pending.length,
    });
    await new Promise<void>((resolve) => pending.push(resolve));
  }
  running++;
  try {
    return await job();
  } catch (error) {
    erroredJobs++;
    throw error;
  } finally {
    running--;
    const next = pending.shift();
    if (next) next();
  }
}
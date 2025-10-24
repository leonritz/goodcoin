import { kv } from '@vercel/kv';

/**
 * Database utilities using Vercel KV (Redis)
 * 
 * Data structure:
 * - users:{fid} -> User object
 * - posts:{postId} -> Post object
 * - posts:all -> Set of all post IDs
 * - posts:likes:{postId} -> Set of fids who liked
 * - comments:{commentId} -> Comment object
 * - comments:post:{postId} -> List of comment IDs
 * - transactions:{txId} -> Transaction object
 * - transactions:all -> Set of all transaction IDs
 */

// Check environment variables
console.log('KV Configuration:', {
  hasKV_URL: !!process.env.KV_REST_API_URL,
  hasKV_TOKEN: !!process.env.KV_REST_API_TOKEN,
  nodeEnv: process.env.NODE_ENV,
});

// Development fallback for local testing without KV
const isDevelopment = process.env.NODE_ENV === 'development' && !process.env.KV_REST_API_URL;

if (isDevelopment) {
  console.log('🔧 Using in-memory storage for development');
} else if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
  console.error('⚠️ WARNING: KV environment variables not set! Database operations will fail.');
} else {
  console.log('✅ KV client initialized with environment variables');
}

// In-memory store for development
const devStore = new Map<string, unknown>();

export const db = {
  async get(key: string) {
    if (isDevelopment) {
      return devStore.get(key) || null;
    }
    try {
      return await kv.get(key);
    } catch (error) {
      console.error('KV get error:', error);
      throw error;
    }
  },

  async set(key: string, value: unknown) {
    if (isDevelopment) {
      devStore.set(key, value);
      return 'OK';
    }
    try {
      return await kv.set(key, value);
    } catch (error) {
      console.error('KV set error:', error);
      throw error;
    }
  },

  async sadd(key: string, ...members: string[]) {
    if (isDevelopment) {
      const set = (devStore.get(key) as Set<string>) || new Set<string>();
      members.forEach(m => set.add(m));
      devStore.set(key, set);
      return members.length;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (kv.sadd as any)(key, ...members);
  },

  async srem(key: string, ...members: string[]) {
    if (isDevelopment) {
      const set = devStore.get(key) as Set<string> | undefined;
      if (!set) return 0;
      members.forEach(m => set.delete(m));
      return members.length;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (kv.srem as any)(key, ...members);
  },

  async smembers(key: string): Promise<string[]> {
    if (isDevelopment) {
      const set = devStore.get(key);
      return set ? Array.from(set as Set<string>) : [];
    }
    const result = await kv.smembers(key);
    return result as string[];
  },

  async sismember(key: string, member: string): Promise<boolean> {
    if (isDevelopment) {
      const set = devStore.get(key) as Set<string> | undefined;
      return set ? set.has(member) : false;
    }
    const result = await kv.sismember(key, member);
    return Boolean(result);
  },

  async lpush(key: string, ...values: string[]) {
    if (isDevelopment) {
      const list = (devStore.get(key) as string[]) || [];
      list.unshift(...values);
      devStore.set(key, list);
      return list.length;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (kv.lpush as any)(key, ...values);
  },

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    if (isDevelopment) {
      const list = (devStore.get(key) as string[]) || [];
      if (stop === -1) return list.slice(start);
      return list.slice(start, stop + 1);
    }
    const result = await kv.lrange(key, start, stop);
    return result as string[];
  },

  async del(key: string) {
    if (isDevelopment) {
      devStore.delete(key);
      return 1;
    }
    return await kv.del(key);
  },
};


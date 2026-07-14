// /api/fruits — shared fruit storage using Upstash Redis (via Vercel Marketplace)
// GET  -> { fruits: [...] }
// POST { action:'add', food, opinion } -> { fruits, added }
// POST { action:'delete', id }         -> { fruits }

import { Redis } from '@upstash/redis';

const KEY = 'shared-fruits';
const MAX_FRUITS = 20;

function getRedis() {
  // The Vercel + Upstash integration injects credentials as env vars.
  // Depending on integration version they may be named UPSTASH_* or KV_*.
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export default async function handler(req, res) {
  const redis = getRedis();
  if (!redis) {
    return res.status(500).json({
      error: 'Storage not configured. In Vercel: project → Storage → add Upstash Redis, then redeploy.',
    });
  }

  try {
    let fruits = (await redis.get(KEY)) || [];
    if (!Array.isArray(fruits)) fruits = [];

    if (req.method === 'GET') {
      return res.status(200).json({ fruits });
    }

    if (req.method === 'POST') {
      const body = req.body || {};

      if (body.action === 'add') {
        const food = String(body.food || '').trim().slice(0, 24);
        const opinion = String(body.opinion || '').trim().slice(0, 160);
        if (!food) return res.status(400).json({ error: 'Food name is required.' });
        if (fruits.length >= MAX_FRUITS) {
          return res.status(400).json({ error: 'The box is full of fruit! 🍇 Remove one first.' });
        }
        const added = {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          food,
          opinion,
        };
        fruits.push(added);
        await redis.set(KEY, fruits);
        return res.status(200).json({ fruits, added });
      }

      if (body.action === 'delete') {
        const id = String(body.id || '');
        fruits = fruits.filter((f) => f.id !== id);
        await redis.set(KEY, fruits);
        return res.status(200).json({ fruits });
      }

      return res.status(400).json({ error: 'Unknown action.' });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error.' });
  }
}

# Bone Drops Seeding Guide

## Quick Start - Seed Test Drops

### Option 1: SQL Script (Fastest)

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `seed_bone_drops.sql`
3. Click "Run"
4. You should see 6 shared drops created!

### Option 2: Using the Seeding Function (For Development)

Add this to your app during development to test:

```javascript
import { seedSharedDrops, seedPersonalDrop } from './utils/seedBoneDrops';
import { useAuth } from './context/AuthContext';

// In your component or dev tools:
const { user } = useAuth();

// Seed shared drops (available to everyone)
await seedSharedDrops();

// Seed a personal drop (just for you)
await seedPersonalDrop(user.id);
```

## Testing the Collection Mechanic

1. **Apply the schema** (if you haven't)
   - Run the SQL from `supabase_schema.sql` (bone_drops section)

2. **Seed the drops**
   - Run `seed_bone_drops.sql` in Supabase SQL Editor

3. **Open the map**
   - Navigate to the Map page in your app
   - You should see glowing bone markers! 🦴

4. **Test collection**
   - Get within 30 meters of a drop (you can fake your location in browser dev tools)
   - Collection modal should appear
   - Click "Collect Bones"
   - Check your wallet balance increased

## Daily Reset (Manual for Now)

To manually reset drops each day:

```sql
-- Clear expired drops
DELETE FROM public.bone_drops WHERE expires_at < NOW();

-- Re-run the seed script
-- (paste contents of seed_bone_drops.sql)
```

## Future: Automated Daily Reset

We can set up automated daily resets using:
- Supabase Edge Functions (serverless)
- pg_cron (PostgreSQL cron jobs)
- External cron service (Vercel Cron, etc.)

For now, manual seeding is perfect for testing!

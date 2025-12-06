-- SQL Script to Seed Bone Drops
-- Run this in Supabase SQL Editor to create test drops

-- Clear any existing drops (optional, for testing)
DELETE FROM public.bone_drops;

-- Generate 6 Shared Drops at various parks
INSERT INTO public.bone_drops (type, latitude, longitude, location_name, bone_value, expires_at)
VALUES
  -- Liberty State Park (Jersey City)
  ('shared', 40.7059, -74.0565, 'Liberty State Park', 45, (NOW() + INTERVAL '1 day')),
  
  -- Van Vorst Park (Jersey City)
  ('shared', 40.7198, -74.0463, 'Van Vorst Park', 32, (NOW() + INTERVAL '1 day')),
  
  -- Hamilton Park (Jersey City)
  ('shared', 40.7201, -74.0400, 'Hamilton Park', 67, (NOW() + INTERVAL '1 day')),
  
  -- Pier A Park (Hoboken)
  ('shared', 40.7353, -74.0297, 'Pier A Park', 89, (NOW() + INTERVAL '1 day')),
  
  -- Church Square Park (Hoboken)
  ('shared', 40.7422, -74.0307, 'Church Square Park', 54, (NOW() + INTERVAL '1 day')),
  
  -- Battery Park (NYC)
  ('shared', 40.7033, -74.0170, 'Battery Park', 76, (NOW() + INTERVAL '1 day'));

-- Generate 1 Personal Drop (replace 'YOUR_USER_ID' with actual user ID)
-- To find your user ID, run: SELECT id FROM auth.users LIMIT 1;
/*
INSERT INTO public.bone_drops (type, latitude, longitude, location_name, bone_value, expires_at, user_id)
VALUES
  ('personal', 40.7185, -74.0420, 'Near You', 15, (NOW() + INTERVAL '1 day'), 'YOUR_USER_ID');
*/

-- Verify the drops were created
SELECT 
  id,
  type,
  location_name,
  bone_value,
  latitude,
  longitude,
  expires_at
FROM public.bone_drops
ORDER BY type, bone_value DESC;

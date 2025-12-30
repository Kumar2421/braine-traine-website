-- Quick script to set admin user
-- Run this AFTER running supabase_admin_panel.sql

-- Set admin user
SELECT public.set_admin_user('senthil210520012421@gmail.com');

-- Verify admin user was set
SELECT 
    id,
    email,
    raw_user_meta_data->>'is_admin' as is_admin
FROM auth.users
WHERE email = 'senthil210520012421@gmail.com';


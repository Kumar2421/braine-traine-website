# How to Run Admin Panel SQL Migration

## Quick Steps

### Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Paste Migration**
   - Open `supabase_admin_panel.sql` file
   - Copy ALL contents
   - Paste into the SQL Editor

4. **Run Migration**
   - Click "Run" button (or press Ctrl+Enter)
   - Wait for success message

5. **Set Admin User**
   - In the same SQL Editor, run:
   ```sql
   SELECT public.set_admin_user('senthil210520012421@gmail.com');
   ```
   - Replace email with your admin email if different

6. **Verify**
   - Check Tables section - you should see:
     - `feature_flags` table
     - `admin_actions` table
   - Check that `licenses` table has `offline_enabled` column

### Option 2: Using Supabase CLI (If Installed)

```bash
# Install Supabase CLI first (if not installed)
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migration
supabase db push --file supabase_admin_panel.sql
```

### Option 3: Direct SQL Execution

If you have database access, you can execute the SQL file directly using psql or any PostgreSQL client:

```bash
psql -h YOUR_SUPABASE_HOST -U postgres -d postgres -f supabase_admin_panel.sql
```

## Verification Checklist

After running the migration, verify:

- [ ] `feature_flags` table exists with 9 rows
- [ ] `admin_actions` table exists
- [ ] `licenses` table has `offline_enabled` column
- [ ] `set_admin_user()` function exists
- [ ] Admin user is set (check `auth.users.raw_user_meta_data->>'is_admin'`)

## Troubleshooting

### Error: "relation already exists"
- This is OK - the migration uses `CREATE TABLE IF NOT EXISTS`
- Continue with the rest of the migration

### Error: "permission denied"
- Ensure you're using the SQL Editor with proper permissions
- Some operations require service role key

### Error: "function already exists"
- This is OK - the migration uses `CREATE OR REPLACE FUNCTION`
- Continue with the rest of the migration

## Next Steps

After successful migration:

1. Log in with admin email
2. Navigate to `/admin` in your app
3. Test admin panel functionality

## Need Help?

Check `ADMIN_PANEL_SETUP.md` for detailed setup instructions.


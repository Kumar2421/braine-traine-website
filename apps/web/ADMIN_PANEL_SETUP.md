# Admin Panel Setup Guide

## Overview
The admin panel provides comprehensive user management, license control, feature flags, usage overview, and audit logging capabilities.

## Setup Steps

### 1. Run Database Migration

Execute the SQL migration file in your Supabase SQL Editor:

```bash
# Run this file in Supabase Dashboard > SQL Editor
supabase_admin_panel.sql
```

This will create:
- `feature_flags` table
- `admin_actions` audit log table
- Add `offline_enabled` column to `licenses` table
- Insert default feature flags
- Create admin user function

### 2. Set Admin User

Run this SQL command in Supabase SQL Editor to grant admin access:

```sql
SELECT public.set_admin_user('senthil210520012421@gmail.com');
```

**Important:** Replace the email with your actual admin email address.

### 3. Verify Admin Access

1. Log in with the admin email account
2. Navigate to `/admin` in your browser
3. You should see the admin panel dashboard

## Admin Panel Features

### User Management (`/admin` → Users Tab)
- **View Users**: See all users with their license information
- **Activate/Deactivate**: Toggle user account status
- **Force Logout**: Invalidate all user sessions (logged only, requires edge function for full implementation)

### License Control (`/admin` → Licenses Tab)
- **Assign Plan**: Assign Free, Pro, or Enterprise licenses
- **Set Expiry**: Set license expiration dates
- **Enable Offline**: Toggle offline license capability
- **Regenerate Token**: Log token regeneration (requires edge function for full implementation)

### Feature Flags (`/admin` → Feature Flags Tab)
- **Toggle Features**: Enable/disable individual features
- **Emergency Disable**: Disable all features at once
- **9 Categories**:
  - Dataset Manager
  - Annotation Studio
  - Training Engine
  - Evaluation & Benchmarks
  - Export & Deployment
  - Governance & Observability
  - Team Collaboration
  - Advanced Models
  - Enterprise Features

### Usage Overview (`/admin` → Usage Overview Tab)
- **Per-User Stats**: Projects, datasets, downloads, exports, training runs
- **Platform Stats**: Total users, projects, downloads, exports

### Audit Log (`/admin` → Audit Log Tab)
- **Action History**: All admin actions are logged
- **Details**: See who did what, when, and to whom

## Database Schema

### Feature Flags Table
```sql
feature_flags (
    flag_id UUID PRIMARY KEY,
    flag_key TEXT UNIQUE,
    flag_name TEXT,
    category TEXT,
    enabled BOOLEAN,
    description TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
```

### Admin Actions Table
```sql
admin_actions (
    action_id UUID PRIMARY KEY,
    admin_user_id UUID REFERENCES auth.users(id),
    action_type TEXT,
    target_user_id UUID REFERENCES auth.users(id),
    details JSONB,
    created_at TIMESTAMPTZ
)
```

## Security

- **RLS Policies**: Row Level Security is enabled on all admin tables
- **Admin Check**: Only users with `is_admin: true` in `user_metadata` can access
- **Audit Trail**: All admin actions are logged for compliance

## API Functions

### Admin Users API
- `getAllUsers()` - Get all users with license info
- `toggleUserActive(userId, isActive)` - Activate/deactivate user
- `assignLicense(userId, licenseType, expiresAt)` - Assign license
- `updateLicenseExpiry(userId, expiresAt)` - Update expiry
- `toggleOfflineLicense(userId, enabled)` - Toggle offline
- `regenerateToken(userId)` - Regenerate token
- `forceLogout(userId)` - Force logout

### Feature Flags API
- `getAllFlags()` - Get all feature flags
- `toggleFlag(flagKey, enabled)` - Toggle feature
- `emergencyDisable()` - Disable all features

### Usage API
- `getUserUsage(userId)` - Get user usage stats
- `getPlatformStats()` - Get platform-wide stats

### Audit API
- `logAction(actionType, targetUserId, details)` - Log action
- `getActions(limit)` - Get audit log

## IDE Integration

The IDE can read feature flags to enable/disable features:

```javascript
// In IDE code
const { data: flags } = await supabase
    .from('feature_flags')
    .select('*')
    .eq('enabled', true)

// Check if feature is enabled
const isDatasetManagerEnabled = flags.find(f => f.flag_key === 'dataset_manager')?.enabled
```

## Troubleshooting

### "Access denied" error
- Verify admin user is set: Check `auth.users.raw_user_meta_data->>'is_admin'` = 'true'
- Ensure you're logged in with the admin email
- Check browser console for errors

### Users not showing
- Ensure licenses table has data
- Check RLS policies are correct
- Verify user IDs match between tables

### Feature flags not updating
- Check RLS policies allow admin updates
- Verify `updated_at` is being set
- Check browser console for errors

## Next Steps (Phase 2)

- [ ] Implement GPU usage tracking
- [ ] Add upgrade flow
- [ ] Implement team plans
- [ ] Add billing integration (Stripe)
- [ ] Enterprise contract management

## Support

For issues or questions, check:
1. Supabase logs in Dashboard
2. Browser console for client errors
3. Network tab for API errors
4. Database logs for RLS policy violations


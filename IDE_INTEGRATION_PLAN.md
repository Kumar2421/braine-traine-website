# 🌟 IDE Integration Plan - Phase-by-Phase Implementation

## 📋 Overview

This document outlines the complete phase-by-phase plan for integrating the IDE (desktop application) with the web application. The web-side infrastructure is complete, and this plan details how the IDE should connect to and utilize all the APIs, databases, and features we've built.

**Reference Models:**
- **Cursor IDE** → Cursor Dashboard (subscription tiers, usage analytics, feature limits)
- **Windsurf IDE** → Windsurf Dashboard (real-time sync, usage tracking, billing)
- **VS Code** → Azure DevOps (project management, collaboration)
- **Blender** → Blender Cloud (asset sync, subscription features)

---

## 🎯 Integration Architecture

### Web-Side Infrastructure (Already Complete)
- ✅ Database schema (`usage_limits`, `usage_tracking`, `models`, `training_runs`, `feature_access_log`, `ide_sync_events`)
- ✅ API Endpoints (5 Edge Functions: `ide-authenticate`, `ide-check-feature`, `ide-track-usage`, `ide-sync-project`, `ide-validate-export`)
- ✅ Feature gating system
- ✅ Usage limit enforcement
- ✅ Real-time sync infrastructure
- ✅ User & Admin dashboards

### IDE-Side Requirements (To Be Implemented)
- 🔄 Authentication & token management
- 🔄 Feature access checking
- 🔄 Usage tracking integration
- 🔄 Project/model synchronization
- 🔄 Export validation
- 🔄 Real-time subscription updates
- 🔄 Usage limit UI warnings

---

## 📦 Phase 1: Authentication & Token Management

### Objective
Implement secure authentication flow between IDE and web application, managing sync tokens and user sessions.

### Implementation Steps

#### 1.1 IDE Authentication Service
**File:** `ide/src/services/authService.ts` (or equivalent in your IDE language)

**Features:**
- Login with web credentials (email/password)
- Token generation and storage
- Token refresh mechanism
- Session persistence
- Auto-logout on token expiration

**API Integration:**
```typescript
// Endpoint: POST /functions/v1/ide-authenticate
// Request: { token: string, ide_version: string, platform: string }
// Response: { user, subscription, features, limits, usage, sync_token }
```

**Implementation Checklist:**
- [ ] Create `authService.ts` with login/logout functions
- [ ] Implement token storage (secure local storage/encrypted file)
- [ ] Add token validation on IDE startup
- [ ] Implement token refresh logic
- [ ] Add error handling for expired/invalid tokens
- [ ] Create login UI component
- [ ] Add "Login" button in IDE settings/account section
- [ ] Store user subscription info locally
- [ ] Display user email and plan tier in IDE UI

#### 1.2 Token Management
**Features:**
- Secure token storage
- Token expiration handling
- Automatic token refresh
- Token validation before API calls

**Implementation Checklist:**
- [ ] Create secure storage utility (encrypted file or OS keychain)
- [ ] Implement token expiration checking
- [ ] Add automatic re-authentication flow
- [ ] Handle network errors gracefully
- [ ] Add token refresh before expiration (e.g., refresh at 80% of TTL)

#### 1.3 User Info Display
**Features:**
- Display logged-in user email
- Show subscription tier
- Display plan features
- Show usage limits

**Implementation Checklist:**
- [ ] Create user info component/widget
- [ ] Display in IDE status bar or settings panel
- [ ] Show subscription tier badge
- [ ] Display current usage vs limits
- [ ] Add "Manage Subscription" link (opens web dashboard)

**API Response Structure:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "subscription": {
    "tier": "train_pro",
    "status": "active",
    "current_period_end": "2024-02-01T00:00:00Z",
    "billing_interval": "monthly"
  },
  "features": {
    "model_zoo_basic": true,
    "export_onnx": true,
    "export_tensorflow": true,
    ...
  },
  "limits": {
    "max_projects": 100,
    "max_exports_per_month": 100,
    "max_gpu_hours_per_month": 200.0,
    ...
  },
  "usage": {
    "projects_count": 5,
    "exports_count": 12,
    "gpu_hours_used": 45.5,
    "gpu_hours_remaining": 154.5,
    ...
  }
}
```

**Deliverables:**
- ✅ Authentication service module
- ✅ Token management utilities
- ✅ Login UI component
- ✅ User info display component
- ✅ Error handling for auth failures

---

## 🔒 Phase 2: Feature Access Checking

### Objective
Implement feature gating system that checks user's subscription tier before allowing access to premium features.

### Implementation Steps

#### 2.1 Feature Check Service
**File:** `ide/src/services/featureService.ts`

**Features:**
- Check feature access before enabling UI elements
- Cache feature access results
- Real-time feature updates
- Graceful degradation for denied features

**API Integration:**
```typescript
// Endpoint: POST /functions/v1/ide-check-feature
// Request: { feature_key: string, context?: object }
// Response: { has_access: boolean, reason?: string, upgrade_required?: boolean, required_tier?: string, current_tier?: string }
```

**Implementation Checklist:**
- [ ] Create `featureService.ts` with `checkFeature()` function
- [ ] Implement feature key constants (e.g., `FEATURE_EXPORT_TENSORRT`, `FEATURE_ADVANCED_TRAINING`)
- [ ] Add caching mechanism (cache for 5-10 minutes)
- [ ] Create feature check wrapper for UI components
- [ ] Add feature check before action execution
- [ ] Implement upgrade prompts for denied features
- [ ] Add feature badges/indicators in UI

#### 2.2 Feature Gating in UI
**Features:**
- Disable premium features for free users
- Show upgrade prompts
- Display feature tier requirements
- Lock/unlock features based on subscription

**Implementation Checklist:**
- [ ] Gate export formats (ONNX for all, TensorFlow for Data Pro+, PyTorch for Train Pro+, etc.)
- [ ] Gate advanced training features (auto-tuning, shared GPU, etc.)
- [ ] Gate model zoo access levels
- [ ] Gate annotation studio features
- [ ] Gate deployment features (edge, on-prem, offline)
- [ ] Add "Upgrade Required" tooltips
- [ ] Disable buttons/menu items for locked features
- [ ] Show feature tier badges in feature lists

**Feature Keys Reference:**
```typescript
// Model Zoo
'model_zoo_basic' // Free+
'model_zoo_premium' // Data Pro+
'model_zoo_all' // Deploy Pro+

// Export Formats
'export_onnx' // Free+
'export_tensorflow' // Data Pro+
'export_pytorch' // Train Pro+
'export_tensorrt' // Deploy Pro+
'export_coreml' // Deploy Pro+
'export_openvino' // Deploy Pro+

// Training
'training_small_medium' // Free+
'advanced_training_engine' // Train Pro+
'auto_tuning' // Train Pro+
'shared_gpu_access' // Train Pro+
'full_training_logs' // Train Pro+

// Deployment
'edge_deployment' // Deploy Pro+
'on_prem_deployment' // Deploy Pro+
'offline_deployment' // Deploy Pro+

// Other
'advanced_augmentations' // Data Pro+
'full_benchmarking' // Deploy Pro+
'priority_gpu_scheduling' // Deploy Pro+
```

#### 2.3 Upgrade Prompts
**Features:**
- Show upgrade prompts when feature is denied
- Link to web pricing page
- Display required tier information
- Show current tier vs required tier

**Implementation Checklist:**
- [ ] Create upgrade prompt dialog/modal
- [ ] Show when user tries to access locked feature
- [ ] Display feature name and required tier
- [ ] Add "View Plans" button (opens web pricing page)
- [ ] Add "Maybe Later" dismiss option
- [ ] Track upgrade prompt views for analytics

**Deliverables:**
- ✅ Feature check service
- ✅ Feature gating in UI components
- ✅ Upgrade prompt components
- ✅ Feature key constants
- ✅ Caching mechanism

---

## 📊 Phase 3: Usage Tracking Integration

### Objective
Track all usage metrics (GPU hours, exports, training runs, projects) in real-time and sync with web application.

### Implementation Steps

#### 3.1 Usage Tracking Service
**File:** `ide/src/services/usageTrackingService.ts`

**Features:**
- Track GPU hours used
- Track export operations
- Track training runs
- Track project creation
- Batch usage updates
- Offline usage queue

**API Integration:**
```typescript
// Endpoint: POST /functions/v1/ide-track-usage
// Request: { usage_type: string, amount: number, details?: object }
// Response: { success: boolean, usage_updated: object, remaining?: number, limit?: number, limit_reached?: boolean }
```

**Implementation Checklist:**
- [ ] Create `usageTrackingService.ts` with tracking functions
- [ ] Implement GPU hours tracking (start/stop training jobs)
- [ ] Implement export tracking (on export completion)
- [ ] Implement training run tracking (on training start)
- [ ] Implement project creation tracking
- [ ] Add batch update mechanism (queue and send every 30 seconds)
- [ ] Implement offline queue (store when offline, sync when online)
- [ ] Add error handling and retry logic
- [ ] Track usage context (project_id, model_id, etc.)

#### 3.2 GPU Hours Tracking
**Features:**
- Track training job start/stop times
- Calculate GPU hours used
- Track GPU type
- Handle concurrent training jobs

**Implementation Checklist:**
- [ ] Hook into training job lifecycle (start/stop events)
- [ ] Calculate GPU hours: `(end_time - start_time) * gpu_count`
- [ ] Track GPU type (A100, V100, T4, RTX3090, etc.)
- [ ] Handle multiple concurrent jobs
- [ ] Send usage update on job completion
- [ ] Include project_id and model_id in tracking

#### 3.3 Export Tracking
**Features:**
- Track export format
- Track model size
- Track export destination
- Validate before export (Phase 5)

**Implementation Checklist:**
- [ ] Hook into export completion event
- [ ] Track export format (onnx, tensorflow, pytorch, etc.)
- [ ] Track model size in MB
- [ ] Track project_id and model_id
- [ ] Send usage update after successful export
- [ ] Handle export failures (don't track failed exports)

#### 3.4 Training Run Tracking
**Features:**
- Track training run start
- Track training duration
- Track training configuration
- Track dataset size

**Implementation Checklist:**
- [ ] Hook into training start event
- [ ] Track training run metadata (epochs, batch size, etc.)
- [ ] Track dataset size
- [ ] Send usage update on training start
- [ ] Include training configuration in details

#### 3.5 Project Creation Tracking
**Features:**
- Track new project creation
- Track project type
- Track initial dataset count

**Implementation Checklist:**
- [ ] Hook into project creation event
- [ ] Track project type (yolo, classification, segmentation, etc.)
- [ ] Track initial dataset count
- [ ] Send usage update on project creation
- [ ] Sync project metadata (Phase 4)

**Usage Types:**
```typescript
'gpu_hours' // Amount: hours (decimal)
'export' // Amount: 1 (count)
'training_run' // Amount: 1 (count)
'project_created' // Amount: 1 (count)
'dataset_created' // Amount: 1 (count)
'model_created' // Amount: 1 (count)
```

**Deliverables:**
- ✅ Usage tracking service
- ✅ GPU hours tracking
- ✅ Export tracking
- ✅ Training run tracking
- ✅ Project creation tracking
- ✅ Batch update mechanism
- ✅ Offline queue

---

## 🔄 Phase 4: Project & Model Synchronization

### Objective
Sync project and model metadata from IDE to web application for dashboard display and analytics.

### Implementation Steps

#### 4.1 Project Sync Service
**File:** `ide/src/services/projectSyncService.ts`

**Features:**
- Sync project metadata on create/update
- Sync project status changes
- Sync dataset count updates
- Sync last trained timestamp
- Batch sync operations

**API Integration:**
```typescript
// Endpoint: POST /functions/v1/ide-sync-project
// Request: { ide_project_id: string, name: string, task_type: string, dataset_count: number, last_trained_at?: string, status: string, models?: array, ide_version: string, ide_platform: string }
// Response: { success: boolean, project: { project_id: string, ide_project_id: string, name: string, models_synced: number } }
```

**Implementation Checklist:**
- [ ] Create `projectSyncService.ts` with sync functions
- [ ] Implement project create sync
- [ ] Implement project update sync
- [ ] Implement project delete sync (mark as archived)
- [ ] Sync project metadata (name, task_type, dataset_count)
- [ ] Sync last_trained_at timestamp
- [ ] Sync project status (active, archived, deleted)
- [ ] Include IDE version and platform info
- [ ] Add sync on project save
- [ ] Add periodic sync (every 5 minutes)
- [ ] Handle sync conflicts (web vs IDE)

#### 4.2 Model Sync Service
**Features:**
- Sync model metadata on training completion
- Sync model metrics (accuracy, precision, recall, F1)
- Sync model size
- Sync training configuration
- Sync model status

**Implementation Checklist:**
- [ ] Hook into model training completion event
- [ ] Extract model metrics from training logs
- [ ] Calculate model size in MB
- [ ] Extract training configuration
- [ ] Sync model metadata with project sync
- [ ] Update model status (training → completed)
- [ ] Sync model version and architecture
- [ ] Include GPU type and hours used

**Model Data Structure:**
```typescript
{
  ide_model_id: string,
  name: string,
  status: 'training' | 'completed' | 'failed' | 'deployed' | 'archived',
  accuracy?: number,
  precision?: number,
  recall?: number,
  f1_score?: number,
  model_size_mb?: number,
  training_epochs?: number,
  training_duration_minutes?: number,
  gpu_hours_used?: number,
  dataset_size?: number,
  gpu_type?: string,
  architecture?: string,
  version?: string,
  config?: object,
  metrics?: object
}
```

#### 4.3 Training Run Sync
**Features:**
- Sync training run metadata
- Sync training run status
- Sync training run metrics
- Sync training run configuration

**Implementation Checklist:**
- [ ] Create training run sync on start
- [ ] Update training run on completion
- [ ] Sync training run status (running, completed, failed)
- [ ] Sync training run duration
- [ ] Sync training run GPU hours
- [ ] Sync training run configuration
- [ ] Link training runs to projects and models

**Training Run Data Structure:**
```typescript
{
  ide_training_run_id: string,
  project_id: string, // From project sync
  model_id?: string, // If model exists
  name: string,
  status: 'running' | 'completed' | 'failed' | 'cancelled',
  start_time: string,
  end_time?: string,
  duration_minutes?: number,
  gpu_hours_used?: number,
  epochs?: number,
  batch_size?: number,
  learning_rate?: number,
  dataset_size?: number,
  gpu_type?: string,
  config?: object,
  metrics?: object
}
```

#### 4.4 Sync Scheduling
**Features:**
- Automatic sync on changes
- Periodic sync (every 5 minutes)
- Manual sync trigger
- Sync status indicator

**Implementation Checklist:**
- [ ] Implement automatic sync on project/model changes
- [ ] Add periodic background sync (every 5 minutes)
- [ ] Add "Sync Now" button in settings
- [ ] Show sync status indicator (syncing, synced, error)
- [ ] Display last sync time
- [ ] Handle sync errors gracefully
- [ ] Queue sync operations when offline

**Deliverables:**
- ✅ Project sync service
- ✅ Model sync service
- ✅ Training run sync
- ✅ Sync scheduling
- ✅ Sync status UI
- ✅ Error handling

---

## ✅ Phase 5: Export Validation

### Objective
Validate export requests before processing to ensure user has access to format and hasn't exceeded limits.

### Implementation Steps

#### 5.1 Export Validation Service
**File:** `ide/src/services/exportValidationService.ts`

**Features:**
- Validate export format access
- Check export count limits
- Check model size limits
- Show validation errors
- Block invalid exports

**API Integration:**
```typescript
// Endpoint: POST /functions/v1/ide-validate-export
// Request: { export_format: string, model_size_mb?: number, project_id?: string }
// Response: { allowed: boolean, reason?: string, current_usage?: object, upgrade_required?: boolean, required_tier?: string, current_tier?: string, upgrade_prompt?: string }
```

**Implementation Checklist:**
- [ ] Create `exportValidationService.ts` with validation function
- [ ] Call validation API before export starts
- [ ] Check export format access
- [ ] Check export count limit
- [ ] Check model size limit
- [ ] Block export if validation fails
- [ ] Show validation error message
- [ ] Show upgrade prompt if upgrade required
- [ ] Cache validation result (5 minutes)

#### 5.2 Export Flow Integration
**Features:**
- Validate before export dialog
- Show validation errors in export UI
- Disable export button if validation fails
- Show upgrade prompts

**Implementation Checklist:**
- [ ] Integrate validation into export flow
- [ ] Call validation when export format is selected
- [ ] Show validation errors in export dialog
- [ ] Disable "Export" button if validation fails
- [ ] Show upgrade prompt for locked formats
- [ ] Show limit reached message
- [ ] Link to pricing page from upgrade prompt

#### 5.3 Export Limit Warnings
**Features:**
- Show warning when approaching export limit (80%)
- Show error when export limit reached (100%)
- Display current usage vs limit
- Show remaining exports

**Implementation Checklist:**
- [ ] Check usage before showing export dialog
- [ ] Show warning if approaching limit (80%)
- [ ] Show error if limit reached (100%)
- [ ] Display "X of Y exports used this month"
- [ ] Show "Upgrade for more exports" message
- [ ] Update usage display after export

**Validation Response Structure:**
```json
{
  "allowed": true,
  "current_usage": {
    "exports_count": 12,
    "exports_limit": 100,
    "exports_remaining": 88
  }
}
```

Or if denied:
```json
{
  "allowed": false,
  "reason": "Export format 'tensorrt' requires 'deploy_pro' plan. Current plan: 'train_pro'",
  "upgrade_required": true,
  "required_tier": "deploy_pro",
  "current_tier": "train_pro",
  "upgrade_prompt": "Upgrade to Deploy Pro to unlock tensorrt exports"
}
```

**Deliverables:**
- ✅ Export validation service
- ✅ Export flow integration
- ✅ Export limit warnings
- ✅ Upgrade prompts
- ✅ Error handling

---

## 🔔 Phase 6: Real-Time Subscription Updates

### Objective
Keep IDE in sync with subscription changes (upgrades, downgrades, cancellations) and usage limits in real-time.

### Implementation Steps

#### 6.1 Subscription Update Service
**File:** `ide/src/services/subscriptionService.ts`

**Features:**
- Poll subscription status periodically
- Handle subscription changes
- Update feature access
- Update usage limits
- Show subscription change notifications

**Implementation Checklist:**
- [ ] Create `subscriptionService.ts` with subscription check function
- [ ] Poll subscription status every 5 minutes
- [ ] Compare current subscription with cached subscription
- [ ] Detect subscription changes (upgrade, downgrade, cancellation)
- [ ] Update cached subscription info
- [ ] Refresh feature access cache
- [ ] Refresh usage limits
- [ ] Show notification on subscription change
- [ ] Handle subscription expiration
- [ ] Handle trial expiration

#### 6.2 Subscription Change Notifications
**Features:**
- Show upgrade success notification
- Show downgrade warning
- Show cancellation notice
- Show trial expiration warning
- Show payment failure notice

**Implementation Checklist:**
- [ ] Create notification system
- [ ] Show upgrade success toast/notification
- [ ] Show downgrade warning (features will be locked)
- [ ] Show cancellation notice (subscription ends on date)
- [ ] Show trial expiration warning (3 days, 1 day, expired)
- [ ] Show payment failure notice
- [ ] Add "Manage Subscription" link in notifications
- [ ] Dismissible notifications

#### 6.3 Feature Access Refresh
**Features:**
- Refresh feature access on subscription change
- Unlock/lock features dynamically
- Update UI based on new subscription
- Show feature change notifications

**Implementation Checklist:**
- [ ] Clear feature access cache on subscription change
- [ ] Re-check all features
- [ ] Update UI (enable/disable features)
- [ ] Show "New features unlocked" notification
- [ ] Show "Features locked" warning
- [ ] Update feature badges/indicators

#### 6.4 Usage Limits Refresh
**Features:**
- Refresh usage limits on subscription change
- Update usage display
- Show new limits notification
- Handle limit changes

**Implementation Checklist:**
- [ ] Refresh usage limits on subscription change
- [ ] Update usage display in UI
- [ ] Show "New limits applied" notification
- [ ] Handle limit increases (celebrate)
- [ ] Handle limit decreases (warn if current usage exceeds new limit)

#### 6.5 WebSocket/Realtime Integration (Optional)
**Features:**
- Connect to Supabase Realtime
- Receive subscription updates instantly
- Receive usage limit updates
- Handle connection errors

**Implementation Checklist:**
- [ ] Integrate Supabase Realtime client
- [ ] Subscribe to subscription changes
- [ ] Subscribe to usage_tracking changes
- [ ] Handle real-time updates
- [ ] Fallback to polling if WebSocket fails
- [ ] Handle connection errors gracefully

**Deliverables:**
- ✅ Subscription update service
- ✅ Subscription change notifications
- ✅ Feature access refresh
- ✅ Usage limits refresh
- ✅ Real-time integration (optional)

---

## ⚠️ Phase 7: Usage Limit UI Warnings

### Objective
Display usage limit warnings in IDE UI when users approach or reach limits, similar to web dashboard.

### Implementation Steps

#### 7.1 Usage Limit Service
**File:** `ide/src/services/usageLimitService.ts`

**Features:**
- Fetch current usage and limits
- Calculate usage percentages
- Detect soft limits (80%)
- Detect hard limits (100%)
- Cache usage data

**Implementation Checklist:**
- [ ] Create `usageLimitService.ts` with usage fetching
- [ ] Fetch usage from authentication response (Phase 1)
- [ ] Calculate usage percentages
- [ ] Detect soft limits (80% threshold)
- [ ] Detect hard limits (100% threshold)
- [ ] Cache usage data (refresh every 5 minutes)
- [ ] Handle usage data errors

#### 7.2 Usage Display Component
**Features:**
- Display current usage vs limits
- Show usage progress bars
- Color-code progress (green/yellow/red)
- Show usage percentages
- Display in IDE status bar or settings

**Implementation Checklist:**
- [ ] Create usage display component/widget
- [ ] Display projects: "5 / 100"
- [ ] Display exports: "12 / 100"
- [ ] Display GPU hours: "45.5 / 200.0"
- [ ] Display training runs: "8 / 200"
- [ ] Show progress bars with color coding
- [ ] Show usage percentages
- [ ] Add to IDE status bar or settings panel
- [ ] Make it clickable (opens detailed usage view)

#### 7.3 Limit Warning Components
**Features:**
- Show warning when approaching limit (80%)
- Show error when limit reached (100%)
- Display warning messages
- Show upgrade prompts
- Dismissible warnings

**Implementation Checklist:**
- [ ] Create warning banner component
- [ ] Show warning at 80% usage (yellow)
- [ ] Show error at 100% usage (red)
- [ ] Display specific limit message
- [ ] Show "Upgrade Plan" button
- [ ] Make warnings dismissible
- [ ] Show warnings in relevant contexts (e.g., export dialog, training dialog)

#### 7.4 Pre-Action Limit Checks
**Features:**
- Check limits before allowing actions
- Block actions if limit reached
- Show limit error messages
- Show upgrade prompts

**Implementation Checklist:**
- [ ] Check project limit before creating project
- [ ] Check export limit before exporting
- [ ] Check GPU hours limit before starting training
- [ ] Check training runs limit before starting training
- [ ] Block action if limit reached
- [ ] Show specific error message
- [ ] Show upgrade prompt
- [ ] Link to pricing page

#### 7.5 Usage Limit Notifications
**Features:**
- Show notification when approaching limit
- Show notification when limit reached
- Show notification when limit reset (new month)
- Dismissible notifications

**Implementation Checklist:**
- [ ] Create notification system
- [ ] Show notification at 80% usage
- [ ] Show notification at 100% usage
- [ ] Show notification when new month starts (limits reset)
- [ ] Make notifications dismissible
- [ ] Add "View Usage" link
- [ ] Add "Upgrade Plan" link

**Warning Messages:**
```
Soft Limit (80%):
"You're using 80% of your projects limit (80/100). Consider upgrading your plan."

Hard Limit (100%):
"You've reached your projects limit (100/100). Upgrade your plan to create more projects."

Limit Reset:
"Your usage limits have been reset for this month. You now have 100 projects available."
```

**Deliverables:**
- ✅ Usage limit service
- ✅ Usage display component
- ✅ Limit warning components
- ✅ Pre-action limit checks
- ✅ Usage limit notifications

---

## 🔧 Phase 8: Error Handling & Offline Support

### Objective
Implement robust error handling and offline support to ensure IDE works reliably even with network issues.

### Implementation Steps

#### 8.1 Error Handling
**Features:**
- Handle network errors
- Handle API errors
- Handle authentication errors
- Retry failed requests
- Show user-friendly error messages

**Implementation Checklist:**
- [ ] Create error handling utility
- [ ] Handle network timeouts
- [ ] Handle 401 (unauthorized) errors
- [ ] Handle 403 (forbidden) errors
- [ ] Handle 429 (rate limit) errors
- [ ] Handle 500 (server error) errors
- [ ] Implement retry logic with exponential backoff
- [ ] Show user-friendly error messages
- [ ] Log errors for debugging

#### 8.2 Offline Support
**Features:**
- Queue operations when offline
- Sync when back online
- Show offline indicator
- Handle offline gracefully

**Implementation Checklist:**
- [ ] Detect network connectivity
- [ ] Queue API calls when offline
- [ ] Store queued operations locally
- [ ] Sync queued operations when online
- [ ] Show offline indicator in UI
- [ ] Allow local operations when offline
- [ ] Sync on reconnect
- [ ] Handle sync conflicts

#### 8.3 Retry Logic
**Features:**
- Retry failed requests
- Exponential backoff
- Max retry attempts
- Retry queue management

**Implementation Checklist:**
- [ ] Implement retry utility
- [ ] Retry on network errors
- [ ] Retry on 5xx errors
- [ ] Don't retry on 4xx errors (except 429)
- [ ] Exponential backoff (1s, 2s, 4s, 8s)
- [ ] Max 3 retry attempts
- [ ] Queue retries when offline

**Deliverables:**
- ✅ Error handling system
- ✅ Offline support
- ✅ Retry logic
- ✅ Error messages
- ✅ Offline indicator

---

## 📝 Phase 9: Configuration & Settings

### Objective
Add IDE settings for web integration, allowing users to configure sync behavior and manage account.

### Implementation Steps

#### 9.1 Settings UI
**Features:**
- Account settings section
- Sync settings
- Usage display settings
- Notification settings

**Implementation Checklist:**
- [ ] Create settings UI panel
- [ ] Add "Account" section
- [ ] Add "Sync" section
- [ ] Add "Usage" section
- [ ] Add "Notifications" section
- [ ] Add "About" section with IDE version

#### 9.2 Account Settings
**Features:**
- Display logged-in user
- Display subscription tier
- Link to web dashboard
- Logout button
- Manage subscription link

**Implementation Checklist:**
- [ ] Show user email
- [ ] Show subscription tier badge
- [ ] Add "View Dashboard" button (opens web)
- [ ] Add "Manage Subscription" button (opens web)
- [ ] Add "Logout" button
- [ ] Show account status (active, trial, expired)

#### 9.3 Sync Settings
**Features:**
- Enable/disable auto-sync
- Sync frequency setting
- Manual sync trigger
- Sync status display

**Implementation Checklist:**
- [ ] Add "Enable Auto-Sync" toggle
- [ ] Add sync frequency selector (1min, 5min, 15min, manual)
- [ ] Add "Sync Now" button
- [ ] Show last sync time
- [ ] Show sync status (syncing, synced, error)
- [ ] Show sync statistics (projects synced, models synced)

#### 9.4 Usage Display Settings
**Features:**
- Show/hide usage in status bar
- Usage refresh frequency
- Usage warning thresholds

**Implementation Checklist:**
- [ ] Add "Show Usage in Status Bar" toggle
- [ ] Add usage refresh frequency setting
- [ ] Add warning threshold setting (default 80%)
- [ ] Add "View Detailed Usage" button (opens web)

#### 9.5 Notification Settings
**Features:**
- Enable/disable notifications
- Notification types
- Notification frequency

**Implementation Checklist:**
- [ ] Add "Enable Notifications" toggle
- [ ] Add notification type toggles (upgrades, limits, sync)
- [ ] Add notification frequency setting
- [ ] Test notification display

**Deliverables:**
- ✅ Settings UI
- ✅ Account settings
- ✅ Sync settings
- ✅ Usage display settings
- ✅ Notification settings

---

## 🧪 Phase 10: Testing & Quality Assurance

### Objective
Comprehensive testing of all IDE integration features to ensure reliability and user experience.

### Implementation Steps

#### 10.1 Unit Tests
**Features:**
- Test authentication service
- Test feature checking
- Test usage tracking
- Test project sync
- Test export validation

**Implementation Checklist:**
- [ ] Write unit tests for auth service
- [ ] Write unit tests for feature service
- [ ] Write unit tests for usage tracking
- [ ] Write unit tests for project sync
- [ ] Write unit tests for export validation
- [ ] Achieve 80%+ code coverage

#### 10.2 Integration Tests
**Features:**
- Test API integration
- Test error handling
- Test offline support
- Test sync operations

**Implementation Checklist:**
- [ ] Test authentication flow
- [ ] Test feature checking flow
- [ ] Test usage tracking flow
- [ ] Test project sync flow
- [ ] Test export validation flow
- [ ] Test error scenarios
- [ ] Test offline scenarios

#### 10.3 End-to-End Tests
**Features:**
- Test complete user flows
- Test subscription changes
- Test limit enforcement
- Test upgrade prompts

**Implementation Checklist:**
- [ ] Test login → create project → sync flow
- [ ] Test training → track usage → sync flow
- [ ] Test export → validate → track flow
- [ ] Test subscription upgrade flow
- [ ] Test limit reached flow
- [ ] Test offline → online sync flow

#### 10.4 Performance Tests
**Features:**
- Test API call performance
- Test sync performance
- Test UI responsiveness
- Test memory usage

**Implementation Checklist:**
- [ ] Measure API call latency
- [ ] Test sync performance with many projects
- [ ] Test UI responsiveness during sync
- [ ] Test memory usage over time
- [ ] Optimize slow operations

#### 10.5 User Acceptance Testing
**Features:**
- Test with real users
- Collect feedback
- Fix issues
- Iterate

**Implementation Checklist:**
- [ ] Create beta testing program
- [ ] Test with 10-20 beta users
- [ ] Collect feedback on UX
- [ ] Fix reported bugs
- [ ] Iterate based on feedback

**Deliverables:**
- ✅ Unit tests
- ✅ Integration tests
- ✅ End-to-end tests
- ✅ Performance tests
- ✅ User acceptance testing
- ✅ Bug fixes
- ✅ Documentation

---

## 📚 Complete API Reference

### Base URL
All API endpoints are hosted on Supabase Edge Functions:
```
https://{SUPABASE_PROJECT_ID}.supabase.co/functions/v1/{function-name}
```

### Authentication Headers
All endpoints (except `ide-authenticate`) require:
```
Authorization: Bearer {access_token}
apikey: {SUPABASE_ANON_KEY}
Content-Type: application/json
```

---

### 1. IDE Authenticate API

**Endpoint:** `POST /functions/v1/ide-authenticate`

**Authentication:** Token-based (sync token in request body)

**Rate Limit:** 20 requests per minute per user

**Request Body:**
```json
{
  "token": "string (required) - Sync token from ide_auth_tokens table",
  "ide_version": "string (optional) - IDE version, e.g., '1.0.0'",
  "platform": "string (optional) - Platform, e.g., 'windows', 'macos', 'linux'"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "subscription": {
    "tier": "train_pro",
    "status": "active",
    "current_period_end": "2024-02-01T00:00:00Z",
    "billing_interval": "monthly"
  },
  "features": {
    "model_zoo_basic": true,
    "model_zoo_premium": true,
    "export_onnx": true,
    "export_tensorflow": true,
    "export_pytorch": true,
    "advanced_training_engine": true,
    "auto_tuning": true,
    ...
  },
  "limits": {
    "max_projects": 100,
    "max_datasets_per_project": 500,
    "max_exports_per_month": 100,
    "max_gpu_hours_per_month": 200.0,
    "max_training_runs_per_month": 200,
    "max_model_size_mb": 2000,
    "max_concurrent_training_jobs": 5,
    "export_formats_allowed": ["onnx", "tensorflow", "pytorch"],
    "model_zoo_access_level": "premium",
    "annotation_tools_level": "full"
  },
  "usage": {
    "projects_count": 5,
    "exports_count": 12,
    "gpu_hours_used": 45.5,
    "gpu_hours_remaining": 154.5,
    "training_runs_count": 8,
    "period_start": "2024-01-01T00:00:00Z",
    "period_end": "2024-02-01T00:00:00Z"
  },
  "sync_token": "same_token_for_subsequent_syncs"
}
```

**Error Responses:**
- `400` - Missing token or invalid JSON
- `401` - Invalid or expired token
- `404` - User not found
- `429` - Rate limit exceeded
- `500` - Server error

**Database Operations:**
- Reads from: `ide_auth_tokens`, `auth.users`, `subscriptions`, `licenses`, `usage_limits`, `usage_tracking`
- Updates: `ide_auth_tokens` (last_sync_at, subscription_tier, features_enabled, usage_limits)
- Inserts into: `ide_sync_events` (event_type: 'ide_authenticate')

---

### 2. Feature Check API

**Endpoint:** `POST /functions/v1/ide-check-feature`

**Authentication:** Bearer token (Supabase JWT)

**Rate Limit:** 100 requests per minute per user

**Request Body:**
```json
{
  "feature_key": "string (required) - Feature key to check",
  "context": {
    "export_format": "string (optional)",
    "model_size_mb": "number (optional)",
    "project_id": "string (optional)"
  }
}
```

**Success Response (200):**
```json
{
  "has_access": true,
  "reason": null,
  "upgrade_required": false,
  "required_tier": null,
  "current_tier": "train_pro",
  "feature_key": "export_pytorch"
}
```

**Or if denied:**
```json
{
  "has_access": false,
  "reason": "Feature requires 'deploy_pro' plan. Current plan: 'train_pro'",
  "upgrade_required": true,
  "required_tier": "deploy_pro",
  "current_tier": "train_pro",
  "feature_key": "export_tensorrt"
}
```

**Error Responses:**
- `400` - Missing feature_key or invalid JSON
- `401` - Unauthorized (missing/invalid token)
- `429` - Rate limit exceeded
- `500` - Server error

**Database Operations:**
- Reads from: `subscriptions`, `licenses` (to determine tier)
- Inserts into: `feature_access_log` (logs every check attempt)
- Inserts into: `ide_sync_events` (event_type: 'feature_check')

**Feature Keys:**
- Model Zoo: `model_zoo_basic`, `model_zoo_premium`, `model_zoo_all`
- Export Formats: `export_onnx`, `export_tensorflow`, `export_pytorch`, `export_tensorrt`, `export_coreml`, `export_openvino`
- Training: `training_small_medium`, `advanced_training_engine`, `auto_tuning`, `shared_gpu_access`, `full_training_logs`
- Deployment: `edge_deployment`, `on_prem_deployment`, `offline_deployment`
- Other: `advanced_augmentations`, `full_benchmarking`, `priority_gpu_scheduling`, `team_collaboration`

---

### 3. Usage Tracking API

**Endpoint:** `POST /functions/v1/ide-track-usage`

**Authentication:** Bearer token (Supabase JWT)

**Rate Limit:** 200 requests per minute per user

**Request Body:**
```json
{
  "usage_type": "string (required) - One of: 'gpu_hours', 'export', 'training_run', 'project_created', 'dataset_created', 'model_created'",
  "amount": 1.0, // Required for gpu_hours (decimal), default 1.0 for counts
  "details": {
    "export_format": "string (optional) - For export type",
    "model_size_mb": "number (optional)",
    "project_id": "string (optional)",
    "model_id": "string (optional)",
    "gpu_type": "string (optional) - e.g., 'A100', 'V100', 'T4'",
    "gpu_count": "number (optional)"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "usage_updated": {
    "gpu_hours": 46.5, // or exports_count, training_runs_count, projects_count
    "remaining": 153.5, // null if unlimited
    "limit": 200.0, // null if unlimited
    "limit_reached": false
  }
}
```

**Error Responses:**
- `400` - Missing usage_type, invalid usage_type, or invalid JSON
- `401` - Unauthorized
- `429` - Rate limit exceeded
- `500` - Server error

**Database Operations:**
- Reads from: `usage_tracking`, `subscriptions`, `licenses`, `usage_limits`
- Updates: `usage_tracking` (increments counters, updates gpu_hours_used)
- Inserts into: `ide_sync_events` (event_type: 'usage_tracked')
- Uses SQL function: `increment_usage()` (if available)

**Usage Type Details:**
- `gpu_hours`: Amount is hours (decimal), updates `gpu_hours_used`
- `export`: Amount is 1, updates `exports_count`, tracks format in `export_formats_used[]`
- `training_run`: Amount is 1, updates `training_runs_count`
- `project_created`: Amount is 1, updates `projects_count`
- `dataset_created`: Amount is 1, updates `datasets_count`
- `model_created`: Amount is 1, logs but doesn't update counters (models tracked separately)

---

### 4. Project Sync API

**Endpoint:** `POST /functions/v1/ide-sync-project`

**Authentication:** Bearer token (Supabase JWT)

**Rate Limit:** 60 requests per minute per user

**Request Body:**
```json
{
  "ide_project_id": "string (required) - Unique project ID from IDE",
  "name": "string (required) - Project name",
  "task_type": "string (optional) - 'yolo', 'classification', 'segmentation', 'face_recognition', 'other'",
  "dataset_count": 0, // number (optional)
  "last_trained_at": "2024-01-15T10:30:00Z", // ISO string (optional)
  "status": "active", // 'active', 'archived', 'deleted' (optional, default: 'active')
  "models": [ // array (optional) - Models to sync with project
    {
      "ide_model_id": "string (required)",
      "name": "string (required)",
      "status": "completed", // 'training', 'completed', 'failed', 'deployed', 'archived'
      "accuracy": 0.95, // number (optional)
      "precision": 0.94, // number (optional)
      "recall": 0.96, // number (optional)
      "f1_score": 0.95, // number (optional)
      "model_size_mb": 125.5, // number (optional)
      "training_epochs": 100, // number (optional)
      "training_duration_minutes": 240, // number (optional)
      "gpu_hours_used": 2.5, // number (optional)
      "dataset_size": 10000, // number (optional)
      "gpu_type": "A100", // string (optional)
      "architecture": "yolov8", // string (optional)
      "version": "1.0.0", // string (optional)
      "config": {}, // object (optional) - Training configuration
      "metrics": {} // object (optional) - Additional metrics
    }
  ],
  "ide_version": "string (optional) - IDE version",
  "ide_platform": "string (optional) - Platform"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "project": {
    "project_id": "uuid - Web project ID",
    "ide_project_id": "string - IDE project ID",
    "name": "string",
    "models_synced": 3 // Number of models synced
  }
}
```

**Error Responses:**
- `400` - Missing required fields or invalid JSON
- `401` - Unauthorized
- `429` - Rate limit exceeded
- `500` - Server error

**Database Operations:**
- Reads from: `projects` (check if exists by ide_project_id)
- Inserts/Updates: `projects` (creates or updates project)
- Inserts/Updates: `models` (syncs models with project)
- Updates: `usage_tracking` (increments projects_count if new project)
- Uses SQL function: `increment_usage()` (for project count)
- Inserts into: `ide_sync_events` (event_type: 'project_created' or 'project_updated')

**Sync Behavior:**
- If project exists (by `ide_project_id`): Updates existing project
- If project doesn't exist: Creates new project and increments usage counter
- Models are synced based on `ide_model_id` (creates or updates)

---

### 5. Export Validation API

**Endpoint:** `POST /functions/v1/ide-validate-export`

**Authentication:** Bearer token (Supabase JWT)

**Rate Limit:** 50 requests per minute per user

**Request Body:**
```json
{
  "export_format": "string (required) - 'onnx', 'tensorflow', 'pytorch', 'tensorrt', 'coreml', 'openvino'",
  "model_size_mb": 125.5, // number (optional) - Model size in MB
  "project_id": "uuid (optional) - Project ID"
}
```

**Success Response (200) - Allowed:**
```json
{
  "allowed": true,
  "current_usage": {
    "exports_count": 12,
    "exports_limit": 100,
    "exports_remaining": 88
  }
}
```

**Success Response (200) - Denied (Format Locked):**
```json
{
  "allowed": false,
  "reason": "Export format 'tensorrt' requires 'deploy_pro' plan. Current plan: 'train_pro'",
  "upgrade_required": true,
  "required_tier": "deploy_pro",
  "current_tier": "train_pro",
  "current_usage": {
    "exports_count": 12,
    "exports_limit": 100
  },
  "upgrade_prompt": "Upgrade to Deploy Pro to unlock tensorrt exports"
}
```

**Success Response (200) - Denied (Limit Reached):**
```json
{
  "allowed": false,
  "reason": "Export limit reached. You have used 100 of 100 exports this month.",
  "upgrade_required": true,
  "current_usage": {
    "exports_count": 100,
    "exports_limit": 100
  },
  "upgrade_prompt": "Upgrade your plan to get more exports per month"
}
```

**Success Response (200) - Denied (Model Size Exceeded):**
```json
{
  "allowed": false,
  "reason": "Model size (2500MB) exceeds limit (2000MB) for your plan",
  "upgrade_required": true,
  "current_usage": {
    "model_size_mb": 2500,
    "model_size_limit": 2000
  }
}
```

**Error Responses:**
- `400` - Missing export_format or invalid JSON
- `401` - Unauthorized
- `429` - Rate limit exceeded
- `500` - Server error

**Database Operations:**
- Reads from: `subscriptions`, `licenses`, `usage_limits`, `usage_tracking`
- Inserts into: `feature_access_log` (logs denied access attempts)
- Does NOT update usage (usage is tracked after successful export)

**Export Format Tier Mapping:**
- `onnx`: Free, Data Pro, Train Pro, Deploy Pro, Enterprise
- `tensorflow`: Data Pro, Train Pro, Deploy Pro, Enterprise
- `pytorch`: Train Pro, Deploy Pro, Enterprise
- `tensorrt`: Deploy Pro, Enterprise
- `coreml`: Deploy Pro, Enterprise
- `openvino`: Deploy Pro, Enterprise

---

## 🗄️ Complete Database Schema Reference

### Database Tables Overview

The IDE integration uses the following database tables:

1. **`usage_limits`** - Plan-based usage limits
2. **`usage_tracking`** - Current monthly usage counters
3. **`models`** - Trained models from IDE
4. **`training_runs`** - Training job tracking
5. **`projects`** - IDE projects synced to web
6. **`feature_access_log`** - Feature access analytics
7. **`ide_sync_events`** - Sync event logging
8. **`ide_auth_tokens`** - IDE authentication tokens
9. **`subscriptions`** - User subscriptions (from web)
10. **`licenses`** - Legacy licenses (fallback)

---

### 1. `usage_limits` Table

**Purpose:** Stores plan-based usage limits for each subscription tier

**Schema:**
```sql
CREATE TABLE public.usage_limits (
    limit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_type TEXT NOT NULL UNIQUE CHECK (plan_type IN ('free', 'data_pro', 'train_pro', 'deploy_pro', 'enterprise')),
    
    -- Project & Dataset Limits
    max_projects INTEGER DEFAULT 10, -- -1 = unlimited
    max_datasets_per_project INTEGER DEFAULT 50,
    
    -- Export Limits
    max_exports_per_month INTEGER DEFAULT 20,
    export_formats_allowed TEXT[] DEFAULT ARRAY['onnx'],
    
    -- GPU & Training Limits
    max_gpu_hours_per_month DECIMAL(10, 2) DEFAULT 100.0, -- -1 = unlimited
    max_training_runs_per_month INTEGER DEFAULT 50,
    max_concurrent_training_jobs INTEGER DEFAULT 2,
    
    -- Model Limits
    max_model_size_mb INTEGER DEFAULT 500, -- -1 = unlimited
    
    -- Team & Storage Limits
    max_team_members INTEGER DEFAULT 5,
    max_storage_gb INTEGER DEFAULT 10, -- -1 = unlimited
    
    -- Feature Access Levels
    model_zoo_access_level TEXT DEFAULT 'basic' CHECK (model_zoo_access_level IN ('basic', 'premium', 'all')),
    annotation_tools_level TEXT DEFAULT 'basic' CHECK (annotation_tools_level IN ('basic', 'standard', 'full')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes:**
- `usage_limits_plan_type_idx` on `plan_type`

**Usage in IDE:**
- Read during authentication to get user's limits
- Used for limit checking before actions
- Used for displaying usage vs limits in UI

**Query Example:**
```sql
SELECT * FROM usage_limits WHERE plan_type = 'train_pro';
```

**Default Values by Plan:**
- **Free**: 5 projects, 5 exports/month, 10 GPU hours/month, 10 training runs/month
- **Data Pro**: 20 projects, 20 exports/month, 50 GPU hours/month, 50 training runs/month
- **Train Pro**: 100 projects, 100 exports/month, 200 GPU hours/month, 200 training runs/month
- **Deploy Pro**: Unlimited (-1 for all limits)
- **Enterprise**: Unlimited (-1 for all limits)

---

### 2. `usage_tracking` Table

**Purpose:** Tracks current monthly usage for each user (resets monthly)

**Schema:**
```sql
CREATE TABLE public.usage_tracking (
    usage_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID, -- Optional team reference
    
    -- Period tracking
    period_start TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', now()),
    period_end TIMESTAMPTZ NOT NULL DEFAULT (date_trunc('month', now()) + interval '1 month'),
    
    -- Usage counters
    projects_count INTEGER DEFAULT 0,
    datasets_count INTEGER DEFAULT 0,
    exports_count INTEGER DEFAULT 0,
    gpu_hours_used DECIMAL(10, 2) DEFAULT 0.0,
    training_runs_count INTEGER DEFAULT 0,
    storage_used_gb DECIMAL(10, 2) DEFAULT 0.0,
    concurrent_jobs_count INTEGER DEFAULT 0,
    
    -- Feature usage
    model_zoo_downloads INTEGER DEFAULT 0,
    annotation_sessions INTEGER DEFAULT 0,
    export_formats_used TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(user_id, period_start)
);
```

**Indexes:**
- `usage_tracking_user_id_idx` on `user_id`
- `usage_tracking_team_id_idx` on `team_id`
- `usage_tracking_period_start_idx` on `period_start`
- `usage_tracking_period_end_idx` on `period_end`

**RLS Policies:**
- Users can SELECT their own usage
- Admins can SELECT/UPDATE all usage

**Usage in IDE:**
- Updated via `ide-track-usage` API
- Read during authentication to show current usage
- Used for limit checking and warnings

**Query Example:**
```sql
-- Get current month's usage
SELECT * FROM usage_tracking 
WHERE user_id = $1 
  AND period_start = date_trunc('month', now())
LIMIT 1;
```

**Update Example:**
```sql
-- Increment GPU hours
UPDATE usage_tracking 
SET gpu_hours_used = gpu_hours_used + $1,
    updated_at = now()
WHERE user_id = $2 
  AND period_start = date_trunc('month', now());
```

---

### 3. `models` Table

**Purpose:** Stores trained model metadata synced from IDE

**Schema:**
```sql
CREATE TABLE public.models (
    model_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(project_id) ON DELETE CASCADE,
    team_id UUID, -- Optional team reference
    
    -- Model Info
    name TEXT NOT NULL,
    model_type TEXT NOT NULL CHECK (model_type IN ('yolo', 'classification', 'segmentation', 'face_recognition', 'other')),
    architecture TEXT, -- 'yolov8', 'resnet50', 'efficientnet', etc.
    version TEXT DEFAULT '1.0.0',
    
    -- Model Metrics
    accuracy DECIMAL(5, 4),
    precision DECIMAL(5, 4),
    recall DECIMAL(5, 4),
    f1_score DECIMAL(5, 4),
    model_size_mb DECIMAL(10, 2),
    
    -- Training Info
    training_epochs INTEGER,
    training_duration_minutes INTEGER,
    gpu_hours_used DECIMAL(10, 2) DEFAULT 0.0,
    dataset_size INTEGER,
    gpu_type TEXT, -- 'A100', 'V100', 'T4', 'RTX3090', etc.
    
    -- Status
    status TEXT NOT NULL DEFAULT 'training' CHECK (status IN ('training', 'completed', 'failed', 'deployed', 'archived')),
    
    -- Metadata
    ide_model_id TEXT, -- ID from IDE for sync
    ide_version TEXT, -- IDE version that created this model
    config JSONB DEFAULT '{}'::jsonb, -- Training configuration
    metrics JSONB DEFAULT '{}'::jsonb, -- Additional metrics
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    trained_at TIMESTAMPTZ
);
```

**Indexes:**
- `models_user_id_idx` on `user_id`
- `models_project_id_idx` on `project_id`
- `models_team_id_idx` on `team_id`
- `models_status_idx` on `status`
- `models_ide_model_id_idx` on `ide_model_id`
- `models_model_type_idx` on `model_type`

**RLS Policies:**
- Users can SELECT/INSERT/UPDATE their own models
- Admins can SELECT/UPDATE all models

**Usage in IDE:**
- Synced via `ide-sync-project` API (in models array)
- Used for dashboard display
- Used for analytics

**Query Example:**
```sql
-- Get user's models
SELECT * FROM models 
WHERE user_id = $1 
ORDER BY created_at DESC;
```

**Sync Example:**
```sql
-- Upsert model by ide_model_id
INSERT INTO models (user_id, project_id, ide_model_id, name, status, ...)
VALUES ($1, $2, $3, $4, $5, ...)
ON CONFLICT (ide_model_id, project_id) 
DO UPDATE SET 
    name = EXCLUDED.name,
    status = EXCLUDED.status,
    updated_at = now();
```

---

### 4. `training_runs` Table

**Purpose:** Tracks training job runs from IDE

**Schema:**
```sql
CREATE TABLE public.training_runs (
    run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(project_id) ON DELETE CASCADE,
    model_id UUID REFERENCES public.models(model_id) ON DELETE SET NULL,
    team_id UUID, -- Optional team reference
    
    -- Run Info
    run_name TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}'::jsonb, -- Training configuration
    
    -- Timing
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    
    -- GPU Usage
    gpu_hours_used DECIMAL(10, 2) DEFAULT 0.0,
    gpu_type TEXT, -- 'A100', 'V100', 'T4', 'RTX3090', etc.
    gpu_count INTEGER DEFAULT 1,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed', 'canceled')),
    error_message TEXT,
    progress_percentage INTEGER DEFAULT 0,
    
    -- Results
    final_metrics JSONB DEFAULT '{}'::jsonb, -- Loss, accuracy, etc.
    checkpoint_path TEXT,
    logs_url TEXT, -- URL to training logs
    
    -- IDE Metadata
    ide_run_id TEXT, -- ID from IDE
    ide_version TEXT, -- IDE version
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes:**
- `training_runs_user_id_idx` on `user_id`
- `training_runs_project_id_idx` on `project_id`
- `training_runs_model_id_idx` on `model_id`
- `training_runs_status_idx` on `status`
- `training_runs_start_time_idx` on `start_time DESC`
- `training_runs_ide_run_id_idx` on `ide_run_id`

**RLS Policies:**
- Users can SELECT/INSERT/UPDATE their own training runs
- Admins can SELECT/UPDATE all training runs

**Usage in IDE:**
- Created when training starts
- Updated when training completes
- Used for analytics and dashboard

**Query Example:**
```sql
-- Get recent training runs
SELECT * FROM training_runs 
WHERE user_id = $1 
ORDER BY start_time DESC 
LIMIT 20;
```

---

### 5. `projects` Table

**Purpose:** Stores project metadata synced from IDE

**Schema:**
```sql
CREATE TABLE public.projects (
    project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ide_project_id TEXT, -- Unique ID from IDE
    
    name TEXT NOT NULL,
    task_type TEXT CHECK (task_type IN ('yolo', 'classification', 'segmentation', 'face_recognition', 'other')),
    dataset_count INTEGER DEFAULT 0,
    last_trained_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    
    ide_version TEXT, -- IDE version
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes:**
- `projects_user_id_idx` on `user_id`
- `projects_ide_project_id_idx` on `ide_project_id`

**Usage in IDE:**
- Synced via `ide-sync-project` API
- Used for dashboard display
- Links models and training runs

**Query Example:**
```sql
-- Get project by IDE ID
SELECT * FROM projects 
WHERE user_id = $1 
  AND ide_project_id = $2;
```

---

### 6. `feature_access_log` Table

**Purpose:** Logs all feature access attempts for analytics

**Schema:**
```sql
CREATE TABLE public.feature_access_log (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL,
    access_granted BOOLEAN NOT NULL,
    reason TEXT, -- Why access was granted/denied
    subscription_tier TEXT,
    usage_context JSONB DEFAULT '{}'::jsonb, -- Additional context
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes:**
- `feature_access_log_user_id_idx` on `user_id`
- `feature_access_log_feature_key_idx` on `feature_key`
- `feature_access_log_access_granted_idx` on `access_granted`
- `feature_access_log_created_at_idx` on `created_at DESC`
- `feature_access_log_subscription_tier_idx` on `subscription_tier`

**RLS Policies:**
- Users can SELECT their own logs
- Admins can SELECT all logs

**Usage in IDE:**
- Automatically logged by `ide-check-feature` API
- Used for analytics and feature adoption tracking

**Query Example:**
```sql
-- Get feature access stats
SELECT 
    feature_key,
    COUNT(*) as total_checks,
    SUM(CASE WHEN access_granted THEN 1 ELSE 0 END) as granted_count,
    SUM(CASE WHEN NOT access_granted THEN 1 ELSE 0 END) as denied_count
FROM feature_access_log
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY feature_key;
```

---

### 7. `ide_sync_events` Table

**Purpose:** Logs all IDE sync events for debugging and analytics

**Schema:**
```sql
CREATE TABLE public.ide_sync_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT REFERENCES public.ide_auth_tokens(token),
    event_type TEXT NOT NULL, -- 'ide_authenticate', 'feature_check', 'usage_tracked', 'project_created', 'project_updated'
    event_data JSONB DEFAULT '{}'::jsonb, -- Event-specific data
    ide_version TEXT,
    ide_platform TEXT,
    sync_status TEXT DEFAULT 'success' CHECK (sync_status IN ('success', 'error', 'pending')),
    error_message TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes:**
- `ide_sync_events_user_id_idx` on `user_id`
- `ide_sync_events_token_idx` on `token`
- `ide_sync_events_event_type_idx` on `event_type`
- `ide_sync_events_created_at_idx` on `created_at DESC`
- `ide_sync_events_sync_status_idx` on `sync_status`

**RLS Policies:**
- Users can SELECT their own events
- Admins can SELECT all events

**Usage in IDE:**
- Automatically logged by all IDE APIs
- Used for debugging sync issues
- Used for analytics

**Query Example:**
```sql
-- Get recent sync events
SELECT * FROM ide_sync_events 
WHERE user_id = $1 
ORDER BY created_at DESC 
LIMIT 50;
```

---

### 8. `ide_auth_tokens` Table

**Purpose:** Stores IDE authentication tokens

**Schema:**
```sql
CREATE TABLE public.ide_auth_tokens (
    token TEXT PRIMARY KEY, -- Sync token
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    license_type TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    
    -- Enhanced fields for subscription info
    subscription_tier TEXT,
    features_enabled JSONB DEFAULT '{}'::jsonb,
    usage_limits JSONB DEFAULT '{}'::jsonb,
    last_sync_at TIMESTAMPTZ,
    sync_interval_seconds INTEGER DEFAULT 300, -- 5 minutes
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes:**
- `ide_auth_tokens_user_id_idx` on `user_id`
- `ide_auth_tokens_subscription_tier_idx` on `subscription_tier`
- `ide_auth_tokens_last_sync_at_idx` on `last_sync_at`

**Usage in IDE:**
- Used for IDE authentication
- Updated during authentication with subscription info
- Used for token validation

**Query Example:**
```sql
-- Validate token
SELECT user_id, expires_at, subscription_tier, features_enabled
FROM ide_auth_tokens
WHERE token = $1
  AND expires_at > now();
```

---

### 9. `subscriptions` Table

**Purpose:** User subscriptions (from web application)

**Schema:**
```sql
CREATE TABLE public.subscriptions (
    subscription_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'data_pro', 'train_pro', 'deploy_pro', 'enterprise')),
    status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'paused')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    billing_interval TEXT DEFAULT 'monthly',
    razorpay_subscription_id TEXT,
    razorpay_customer_id TEXT,
    ...
);
```

**Usage in IDE:**
- Read during authentication to determine subscription tier
- Used for feature access checking
- Used for limit determination

**Query Example:**
```sql
-- Get active subscription
SELECT plan_type, status, current_period_end, billing_interval
FROM subscriptions
WHERE user_id = $1
  AND status IN ('active', 'trialing')
ORDER BY created_at DESC
LIMIT 1;
```

---

### 10. `licenses` Table (Legacy)

**Purpose:** Legacy license system (fallback if no subscription)

**Schema:**
```sql
CREATE TABLE public.licenses (
    license_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    license_type TEXT, -- 'pro', 'enterprise', etc.
    is_active BOOLEAN DEFAULT true,
    issued_at TIMESTAMPTZ,
    ...
);
```

**Usage in IDE:**
- Fallback if user has no active subscription
- Used to determine tier (pro → train_pro, enterprise → enterprise)

---

## 🔧 SQL Helper Functions

### `get_or_create_usage_tracking(user_id)`

**Purpose:** Get or create usage tracking record for current month

**Returns:** Usage tracking record

**Usage:**
```sql
SELECT * FROM get_or_create_usage_tracking($1);
```

### `get_user_usage_limits(user_id)`

**Purpose:** Get user's usage limits based on subscription tier

**Returns:** Usage limits record

**Usage:**
```sql
SELECT * FROM get_user_usage_limits($1);
```

### `increment_usage(user_id, usage_type, amount)`

**Purpose:** Increment usage counter for specific type

**Parameters:**
- `user_id`: UUID
- `usage_type`: 'projects', 'exports', 'gpu_hours', 'training_runs'
- `amount`: DECIMAL (for gpu_hours) or INTEGER (for counts)

**Usage:**
```sql
SELECT increment_usage($1, 'projects', 1.0);
```

---

## 📊 Database Query Patterns for IDE

### Get User's Current Usage and Limits
```sql
-- Get usage and limits in one query
SELECT 
    ut.*,
    ul.*
FROM usage_tracking ut
CROSS JOIN LATERAL (
    SELECT ul.*
    FROM usage_limits ul
    WHERE ul.plan_type = (
        SELECT COALESCE(
            (SELECT plan_type FROM subscriptions 
             WHERE user_id = $1 AND status IN ('active', 'trialing') 
             ORDER BY created_at DESC LIMIT 1),
            (SELECT CASE 
                WHEN license_type = 'pro' THEN 'train_pro'
                WHEN license_type = 'enterprise' THEN 'enterprise'
                ELSE 'free'
             END FROM licenses 
             WHERE user_id = $1 AND is_active = true 
             ORDER BY issued_at DESC LIMIT 1),
            'free'
        )
    )
) ul
WHERE ut.user_id = $1
  AND ut.period_start = date_trunc('month', now());
```

### Check if User Can Perform Action
```sql
-- Check project limit
SELECT 
    ut.projects_count,
    ul.max_projects,
    CASE 
        WHEN ul.max_projects = -1 THEN true
        WHEN ut.projects_count < ul.max_projects THEN true
        ELSE false
    END as can_create_project
FROM usage_tracking ut
JOIN usage_limits ul ON ul.plan_type = $2 -- subscription tier
WHERE ut.user_id = $1
  AND ut.period_start = date_trunc('month', now());
```

### Get User's Models
```sql
-- Get all models with project info
SELECT 
    m.*,
    p.name as project_name,
    p.task_type as project_task_type
FROM models m
LEFT JOIN projects p ON p.project_id = m.project_id
WHERE m.user_id = $1
ORDER BY m.created_at DESC;
```

### Get Recent Training Runs
```sql
-- Get training runs with model and project info
SELECT 
    tr.*,
    m.name as model_name,
    p.name as project_name
FROM training_runs tr
LEFT JOIN models m ON m.model_id = tr.model_id
LEFT JOIN projects p ON p.project_id = tr.project_id
WHERE tr.user_id = $1
ORDER BY tr.start_time DESC
LIMIT 20;
```

---

## 🔐 Row Level Security (RLS) Policies

All tables have RLS enabled with the following patterns:

1. **User Access**: Users can SELECT/INSERT/UPDATE their own records
2. **Admin Access**: Admins can SELECT/UPDATE all records
3. **Team Access**: (If teams exist) Team members can access team records

**RLS Policy Pattern:**
```sql
-- User can access own records
CREATE POLICY {table}_select_own
    ON public.{table}
    FOR SELECT
    USING (auth.uid() = user_id);

-- Admin can access all records
CREATE POLICY {table}_admin_all
    ON public.{table}
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.raw_user_meta_data->>'is_admin')::boolean = true
        )
    );
```

---

## 📝 Database Best Practices for IDE

1. **Always use transactions** for multi-step operations
2. **Use UPSERT** (INSERT ... ON CONFLICT) for sync operations
3. **Check limits before actions** to prevent exceeding quotas
4. **Log all operations** to `ide_sync_events` for debugging
5. **Use indexes** for frequently queried columns
6. **Respect RLS policies** - don't bypass security
7. **Handle NULL values** gracefully (unlimited = -1 or NULL)
8. **Use prepared statements** to prevent SQL injection
9. **Batch operations** when possible (e.g., sync multiple models)
10. **Monitor query performance** and optimize slow queries

---

## 🎯 Success Criteria

### Phase 1: Authentication ✅
- [ ] User can log in to IDE with web credentials
- [ ] Token is stored securely
- [ ] User info is displayed in IDE
- [ ] Token refresh works automatically

### Phase 2: Feature Checking ✅
- [ ] Premium features are locked for free users
- [ ] Upgrade prompts show when needed
- [ ] Feature access is cached and refreshed

### Phase 3: Usage Tracking ✅
- [ ] GPU hours are tracked accurately
- [ ] Exports are tracked
- [ ] Training runs are tracked
- [ ] Projects are tracked

### Phase 4: Project Sync ✅
- [ ] Projects sync to web automatically
- [ ] Models sync with projects
- [ ] Training runs sync
- [ ] Sync status is visible

### Phase 5: Export Validation ✅
- [ ] Exports are validated before processing
- [ ] Invalid exports are blocked
- [ ] Upgrade prompts show for locked formats

### Phase 6: Real-Time Updates ✅
- [ ] Subscription changes are detected
- [ ] Feature access updates automatically
- [ ] Usage limits refresh

### Phase 7: Usage Warnings ✅
- [ ] Warnings show at 80% usage
- [ ] Errors show at 100% usage
- [ ] Actions are blocked at limits

### Phase 8: Error Handling ✅
- [ ] Network errors are handled gracefully
- [ ] Offline mode works
- [ ] Retry logic works

### Phase 9: Settings ✅
- [ ] Settings UI is complete
- [ ] Sync settings work
- [ ] Account management works

### Phase 10: Testing ✅
- [ ] All tests pass
- [ ] Performance is acceptable
- [ ] User feedback is positive

---

## 📋 Implementation Order

**Recommended Order:**
1. **Phase 1** - Authentication (Foundation)
2. **Phase 2** - Feature Checking (Core functionality)
3. **Phase 3** - Usage Tracking (Data collection)
4. **Phase 4** - Project Sync (Data sync)
5. **Phase 5** - Export Validation (User protection)
6. **Phase 6** - Real-Time Updates (User experience)
7. **Phase 7** - Usage Warnings (User awareness)
8. **Phase 8** - Error Handling (Reliability)
9. **Phase 9** - Settings (User control)
10. **Phase 10** - Testing (Quality assurance)

---

## 🔗 Web Application Integration Points

### Database Tables (Web-Side)
- `usage_limits` - Plan-based limits
- `usage_tracking` - Current usage
- `models` - Trained models
- `training_runs` - Training jobs
- `projects` - IDE projects
- `feature_access_log` - Feature access analytics
- `ide_sync_events` - Sync event logs
- `ide_auth_tokens` - IDE authentication tokens

### API Endpoints (Web-Side)
- `ide-authenticate` - Authentication
- `ide-check-feature` - Feature checking
- `ide-track-usage` - Usage tracking
- `ide-sync-project` - Project sync
- `ide-validate-export` - Export validation

### Web Dashboard Features
- Usage overview with progress bars
- Models and Training Runs tables
- Analytics charts
- Activity timeline
- Limit warnings
- Upgrade prompts

---

## 📝 Notes

- All API endpoints are rate-limited
- All API endpoints require authentication
- All API endpoints have CORS headers
- All API endpoints validate requests
- All API endpoints log events for analytics
- Usage data resets monthly
- Feature access is cached for performance
- Offline support is critical for reliability

---

---

## 🔗 Additional Web Application Tables

### `subscriptions` Table
**Purpose:** User subscription records from web application

**Key Columns:**
- `subscription_id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → auth.users)
- `plan_type` (TEXT) - 'free', 'data_pro', 'train_pro', 'deploy_pro', 'enterprise'
- `status` (TEXT) - 'active', 'trialing', 'past_due', 'canceled', 'unpaid', 'paused'
- `current_period_start` (TIMESTAMPTZ)
- `current_period_end` (TIMESTAMPTZ)
- `billing_interval` (TEXT) - 'monthly', 'yearly'
- `razorpay_subscription_id` (TEXT)
- `razorpay_customer_id` (TEXT)

**Usage in IDE:**
- Determines user's subscription tier
- Used for feature access checking
- Used for limit determination

**Query Pattern:**
```sql
-- Get active subscription
SELECT plan_type, status, current_period_end
FROM subscriptions
WHERE user_id = $1
  AND status IN ('active', 'trialing')
ORDER BY created_at DESC
LIMIT 1;
```

---

### `licenses` Table (Legacy)
**Purpose:** Legacy license system (fallback if no subscription)

**Key Columns:**
- `license_id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → auth.users)
- `license_type` (TEXT) - 'pro', 'enterprise', etc.
- `is_active` (BOOLEAN)
- `issued_at` (TIMESTAMPTZ)

**Usage in IDE:**
- Fallback tier determination
- Maps: 'pro' → 'train_pro', 'enterprise' → 'enterprise'

**Query Pattern:**
```sql
-- Get active license
SELECT license_type
FROM licenses
WHERE user_id = $1
  AND is_active = true
ORDER BY issued_at DESC
LIMIT 1;
```

---

### `projects` Table (Existing)
**Purpose:** IDE projects synced to web

**Key Columns:**
- `project_id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → auth.users)
- `ide_project_id` (TEXT) - Unique ID from IDE
- `name` (TEXT)
- `task_type` (TEXT) - 'yolo', 'classification', 'segmentation', etc.
- `dataset_count` (INTEGER)
- `last_trained_at` (TIMESTAMPTZ)
- `status` (TEXT) - 'active', 'archived', 'deleted'
- `ide_version` (TEXT)

**Usage in IDE:**
- Synced via `ide-sync-project` API
- Links models and training runs
- Displayed in dashboard

---

## 📊 Database Relationships

### Entity Relationship Diagram
```
auth.users
    ├── subscriptions (1:many)
    ├── licenses (1:many)
    ├── ide_auth_tokens (1:many)
    ├── usage_tracking (1:many, monthly)
    ├── projects (1:many)
    │   ├── models (1:many)
    │   └── training_runs (1:many)
    ├── models (1:many)
    ├── training_runs (1:many)
    ├── feature_access_log (1:many)
    └── ide_sync_events (1:many)

usage_limits (plan_type)
    └── Used by subscriptions (plan_type)

teams (if exists)
    ├── usage_tracking (team_id)
    ├── models (team_id)
    └── training_runs (team_id)
```

---

## 🔄 Data Flow Examples

### Example 1: User Authenticates IDE
```
1. IDE sends: POST /ide-authenticate { token, ide_version, platform }
2. API validates token from ide_auth_tokens
3. API queries subscriptions table for active subscription
4. API queries usage_limits table for plan limits
5. API queries usage_tracking for current usage
6. API updates ide_auth_tokens with subscription info
7. API inserts into ide_sync_events
8. API returns: user, subscription, features, limits, usage
```

### Example 2: User Tracks GPU Usage
```
1. IDE sends: POST /ide-track-usage { usage_type: 'gpu_hours', amount: 2.5, details: {...} }
2. API authenticates user via Bearer token
3. API queries usage_tracking for current period
4. API creates usage_tracking if doesn't exist (via get_or_create_usage_tracking)
5. API queries usage_limits for user's plan
6. API updates usage_tracking.gpu_hours_used += 2.5
7. API checks if limit reached
8. API inserts into ide_sync_events
9. API returns: updated usage, remaining, limit_reached
```

### Example 3: User Syncs Project
```
1. IDE sends: POST /ide-sync-project { ide_project_id, name, models: [...] }
2. API authenticates user
3. API queries projects table for existing project (by ide_project_id)
4. If exists: UPDATE projects SET name=..., updated_at=now()
5. If not exists: INSERT INTO projects, then increment_usage('projects', 1)
6. For each model in models array:
   - Query models table for existing (by ide_model_id)
   - If exists: UPDATE models
   - If not exists: INSERT INTO models
7. API inserts into ide_sync_events
8. API returns: project_id, models_synced count
```

### Example 4: User Validates Export
```
1. IDE sends: POST /ide-validate-export { export_format: 'tensorrt', model_size_mb: 500 }
2. API authenticates user
3. API queries subscriptions for tier
4. API queries usage_limits for export_formats_allowed
5. API checks if format is in allowed list
6. API queries usage_tracking for exports_count
7. API checks if exports_count < max_exports_per_month
8. API checks if model_size_mb < max_model_size_mb
9. API inserts into feature_access_log (granted or denied)
10. API returns: allowed, reason, upgrade_required
```

---

## 🛠️ IDE Implementation Helper Functions

### TypeScript/JavaScript Examples

#### Authentication Helper
```typescript
async function authenticateIDE(token: string, ideVersion: string, platform: string) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/ide-authenticate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ token, ide_version: ideVersion, platform }),
  });
  
  if (!response.ok) {
    throw new Error(`Authentication failed: ${response.statusText}`);
  }
  
  return await response.json();
}
```

#### Feature Check Helper
```typescript
async function checkFeature(featureKey: string, context: object = {}, accessToken: string) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/ide-check-feature`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ feature_key: featureKey, context }),
  });
  
  return await response.json();
}
```

#### Usage Tracking Helper
```typescript
async function trackUsage(
  usageType: 'gpu_hours' | 'export' | 'training_run' | 'project_created',
  amount: number = 1.0,
  details: object = {},
  accessToken: string
) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/ide-track-usage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ usage_type: usageType, amount, details }),
  });
  
  return await response.json();
}
```

#### Project Sync Helper
```typescript
async function syncProject(
  projectData: {
    ide_project_id: string;
    name: string;
    task_type?: string;
    dataset_count?: number;
    models?: Array<any>;
  },
  accessToken: string
) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/ide-sync-project`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      ...projectData,
      ide_version: IDE_VERSION,
      ide_platform: PLATFORM,
    }),
  });
  
  return await response.json();
}
```

#### Export Validation Helper
```typescript
async function validateExport(
  exportFormat: string,
  modelSizeMb?: number,
  projectId?: string,
  accessToken: string
) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/ide-validate-export`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      export_format: exportFormat,
      model_size_mb: modelSizeMb,
      project_id: projectId,
    }),
  });
  
  return await response.json();
}
```

---

## 🔐 Security Considerations

### API Security
- All endpoints use rate limiting
- All endpoints validate requests
- All endpoints sanitize input
- All endpoints require authentication (except ide-authenticate which uses token)
- All endpoints log events for audit

### Database Security
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Admins can access all data
- Team members can access team data (if teams exist)
- All queries use parameterized statements

### Token Security
- Tokens stored in `ide_auth_tokens` table
- Tokens have expiration dates
- Tokens validated on every authentication request
- Tokens updated with subscription info on sync

---

## 📈 Performance Optimization Tips

### API Calls
1. **Cache authentication results** - Don't authenticate on every request
2. **Cache feature checks** - Cache for 5-10 minutes
3. **Batch usage tracking** - Queue and send every 30 seconds
4. **Batch project sync** - Sync multiple projects/models in one call
5. **Use connection pooling** - Reuse HTTP connections

### Database Queries
1. **Use indexes** - All foreign keys and frequently queried columns are indexed
2. **Use prepared statements** - Prevents SQL injection and improves performance
3. **Limit result sets** - Use LIMIT clauses
4. **Use SELECT specific columns** - Don't SELECT *
5. **Use transactions** - For multi-step operations

### Sync Operations
1. **Sync on changes** - Don't sync everything periodically
2. **Incremental sync** - Only sync changed data
3. **Queue offline operations** - Don't block on network errors
4. **Retry with backoff** - Exponential backoff for retries

---

## 🐛 Error Handling Patterns

### Network Errors
```typescript
try {
  const response = await fetch(apiUrl, options);
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired, re-authenticate
      await reAuthenticate();
    } else if (response.status === 429) {
      // Rate limited, wait and retry
      await waitAndRetry();
    } else {
      throw new Error(`API error: ${response.statusText}`);
    }
  }
  return await response.json();
} catch (error) {
  if (error instanceof TypeError) {
    // Network error, queue for later
    queueForLater();
  }
  throw error;
}
```

### Database Errors
- Handle constraint violations (unique, foreign key)
- Handle RLS policy violations
- Handle NULL values gracefully
- Log errors for debugging

---

## 📝 Environment Variables

### Required for IDE
```env
SUPABASE_URL=https://{project_id}.supabase.co
SUPABASE_ANON_KEY={anon_key}
IDE_VERSION=1.0.0
PLATFORM=windows|macos|linux
```

### Optional
```env
SYNC_INTERVAL_SECONDS=300  # Default: 5 minutes
CACHE_TTL_SECONDS=600      # Default: 10 minutes
BATCH_SIZE=10              # Default: 10 items per batch
MAX_RETRIES=3              # Default: 3 retries
```

---

**Status**: 📋 **PLAN COMPLETE** | Ready for IDE Implementation

**Last Updated**: Current session

**Next Step**: Begin Phase 1 implementation in IDE codebase

**Total Sections**: 10 Phases + Complete API Reference + Complete Database Schema + Implementation Examples


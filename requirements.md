# Sofer (DreamLog/Seer) - Technical Requirements Document

## 1. Project Overview

**Application Name:** Sofer (DreamLog/Seer)  
**Framework:** Laravel 11+  
**Architecture:** Multitenant SaaS with Free & Premium Tiers  
**Key Features:** Dream Journal, Prayer Journal, Emotion Tracking, Praise Wall, Offline-First with Sync

---

## 2. System Architecture

### 2.1 Multitenancy Strategy
- **Approach:** Single Database with Tenant Isolation (using `tenant_id` foreign keys)
- **Tenant Identification:** Subdomain-based (`{tenant}.sofer.app`) or Path-based (`sofer.app/{tenant}`)
- **Package:** `stancl/tenancy` or custom implementation
- **Isolation:** All user data scoped by `tenant_id`

### 2.2 Subscription Tiers

| Feature | Free Tier | Premium Tier |
|---------|-----------|--------------|
| Dreams per month | 10 | Unlimited |
| Prayers per month | 10 | Unlimited |
| Audio recordings | ❌ | ✅ |
| Custom emotions | 3 | Unlimited |
| Data export | ❌ | ✅ |
| Advanced analytics | ❌ | ✅ |
| Offline sync | ❌ | ✅ |
| Priority support | ❌ | ✅ |
| Ad-free experience | ❌ | ✅ |

### 2.3 Offline & Sync Architecture
- **Client-Side:** IndexedDB for offline storage
- **Sync Strategy:** Conflict resolution with "last-write-wins" or version-based merging
- **Sync Queue:** Track pending changes with timestamps
- **API:** RESTful endpoints for bulk sync operations
- **Conflict Detection:** Use `updated_at` timestamps and version numbers

---

## 3. Database Schema

### 3.1 Core Tables

#### `tenants`
```sql
id                  BIGINT UNSIGNED PRIMARY KEY
name                VARCHAR(255) NOT NULL
domain              VARCHAR(255) UNIQUE NOT NULL
database            VARCHAR(255) NULLABLE
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

#### `users`
```sql
id                  BIGINT UNSIGNED PRIMARY KEY
tenant_id           BIGINT UNSIGNED FOREIGN KEY -> tenants.id
name                VARCHAR(255) NOT NULL
email               VARCHAR(255) UNIQUE NOT NULL
email_verified_at   TIMESTAMP NULLABLE
password            VARCHAR(255) NOT NULL
phone               VARCHAR(20) NULLABLE
avatar              VARCHAR(255) NULLABLE
timezone            VARCHAR(50) DEFAULT 'UTC'
language            VARCHAR(10) DEFAULT 'en'
two_factor_secret   TEXT NULLABLE
two_factor_recovery_codes TEXT NULLABLE
remember_token      VARCHAR(100) NULLABLE
last_login_at       TIMESTAMP NULLABLE
created_at          TIMESTAMP
updated_at          TIMESTAMP
deleted_at          TIMESTAMP NULLABLE

INDEX idx_tenant_id (tenant_id)
INDEX idx_email (email)
```

#### `subscriptions`
```sql
id                  BIGINT UNSIGNED PRIMARY KEY
user_id             BIGINT UNSIGNED FOREIGN KEY -> users.id
tenant_id           BIGINT UNSIGNED FOREIGN KEY -> tenants.id
plan_id             BIGINT UNSIGNED FOREIGN KEY -> plans.id
stripe_id           VARCHAR(255) NULLABLE
stripe_status       VARCHAR(255) NULLABLE
stripe_price        VARCHAR(255) NULLABLE
quantity            INTEGER DEFAULT 1
trial_ends_at       TIMESTAMP NULLABLE
ends_at             TIMESTAMP NULLABLE
created_at          TIMESTAMP
updated_at          TIMESTAMP

INDEX idx_user_id (user_id)
INDEX idx_tenant_id (tenant_id)
INDEX idx_stripe_id (stripe_id)
```

#### `plans`
```sql
id                  BIGINT UNSIGNED PRIMARY KEY
name                VARCHAR(255) NOT NULL (e.g., 'Free', 'Premium')
slug                VARCHAR(255) UNIQUE NOT NULL
description         TEXT NULLABLE
price_monthly       DECIMAL(10,2) DEFAULT 0.00
price_yearly        DECIMAL(10,2) DEFAULT 0.00
stripe_monthly_id   VARCHAR(255) NULLABLE
stripe_yearly_id    VARCHAR(255) NULLABLE
features            JSON (list of features)
limits              JSON (usage limits)
is_active           BOOLEAN DEFAULT TRUE
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

### 3.2 Dream Management

#### `dreams`
```sql
id                  BIGINT UNSIGNED PRIMARY KEY
user_id             BIGINT UNSIGNED FOREIGN KEY -> users.id
tenant_id           BIGINT UNSIGNED FOREIGN KEY -> tenants.id
uuid                CHAR(36) UNIQUE NOT NULL (for offline sync)
title               VARCHAR(255) NOT NULL
description         TEXT NULLABLE
dream_date          DATE NOT NULL
dream_time          TIME NULLABLE
sleep_duration      INTEGER NULLABLE (minutes)
lucidity_level      ENUM('none', 'low', 'medium', 'high') DEFAULT 'none'
audio_path          VARCHAR(255) NULLABLE
is_recurring        BOOLEAN DEFAULT FALSE
is_nightmare        BOOLEAN DEFAULT FALSE
is_shared           BOOLEAN DEFAULT FALSE
sync_status         ENUM('synced', 'pending', 'conflict') DEFAULT 'synced'
version             INTEGER DEFAULT 1
created_at          TIMESTAMP
updated_at          TIMESTAMP
deleted_at          TIMESTAMP NULLABLE

INDEX idx_user_id (user_id)
INDEX idx_tenant_id (tenant_id)
INDEX idx_uuid (uuid)
INDEX idx_dream_date (dream_date)
INDEX idx_sync_status (sync_status)
```

#### `dream_emotions`
```sql
id                  BIGINT UNSIGNED PRIMARY KEY
dream_id            BIGINT UNSIGNED FOREIGN KEY -> dreams.id
emotion_id          BIGINT UNSIGNED FOREIGN KEY -> emotions.id
intensity           INTEGER DEFAULT 5 (1-10 scale)
created_at          TIMESTAMP

INDEX idx_dream_id (dream_id)
INDEX idx_emotion_id (emotion_id)
```

#### `dream_tags`
```sql
id                  BIGINT UNSIGNED PRIMARY KEY
dream_id            BIGINT UNSIGNED FOREIGN KEY -> dreams.id
tag_id              BIGINT UNSIGNED FOREIGN KEY -> tags.id
created_at          TIMESTAMP

INDEX idx_dream_id (dream_id)
INDEX idx_tag_id (tag_id)
```

### 3.3 Prayer Management

#### `prayers`
```sql
id                  BIGINT UNSIGNED PRIMARY KEY
user_id             BIGINT UNSIGNED FOREIGN KEY -> users.id
tenant_id           BIGINT UNSIGNED FOREIGN KEY -> tenants.id
uuid                CHAR(36) UNIQUE NOT NULL
title               VARCHAR(255) NOT NULL
description         TEXT NULLABLE
category            VARCHAR(100) NULLABLE
priority            ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium'
status              ENUM('active', 'answered', 'archived') DEFAULT 'active'
is_private          BOOLEAN DEFAULT TRUE
audio_path          VARCHAR(255) NULLABLE
answered_at         TIMESTAMP NULLABLE
answered_note       TEXT NULLABLE
reminder_enabled    BOOLEAN DEFAULT FALSE
reminder_frequency  ENUM('daily', 'weekly', 'monthly') NULLABLE
next_reminder_at    TIMESTAMP NULLABLE
sync_status         ENUM('synced', 'pending', 'conflict') DEFAULT 'synced'
version             INTEGER DEFAULT 1
created_at          TIMESTAMP
updated_at          TIMESTAMP
deleted_at          TIMESTAMP NULLABLE

INDEX idx_user_id (user_id)
INDEX idx_tenant_id (tenant_id)
INDEX idx_uuid (uuid)
INDEX idx_status (status)
INDEX idx_sync_status (sync_status)
```

#### `prayer_updates`
```sql
id                  BIGINT UNSIGNED PRIMARY KEY
prayer_id           BIGINT UNSIGNED FOREIGN KEY -> prayers.id
user_id             BIGINT UNSIGNED FOREIGN KEY -> users.id
content             TEXT NOT NULL
created_at          TIMESTAMP
updated_at          TIMESTAMP

INDEX idx_prayer_id (prayer_id)
```

#### `prayer_tags`
```sql
id                  BIGINT UNSIGNED PRIMARY KEY
prayer_id           BIGINT UNSIGNED FOREIGN KEY -> prayers.id
tag_id              BIGINT UNSIGNED FOREIGN KEY -> tags.id
created_at          TIMESTAMP

INDEX idx_prayer_id (prayer_id)
INDEX idx_tag_id (tag_id)
```

### 3.4 Emotion Tracking

#### `emotions`
```sql
id                  BIGINT UNSIGNED PRIMARY KEY
user_id             BIGINT UNSIGNED FOREIGN KEY -> users.id (NULL for system emotions)
tenant_id           BIGINT UNSIGNED FOREIGN KEY -> tenants.id
name                VARCHAR(100) NOT NULL
emoji               VARCHAR(10) NULLABLE
color               VARCHAR(7) NULLABLE (hex color)
is_system           BOOLEAN DEFAULT FALSE
is_active           BOOLEAN DEFAULT TRUE
created_at          TIMESTAMP
updated_at          TIMESTAMP

INDEX idx_user_id (user_id)
INDEX idx_tenant_id (tenant_id)
INDEX idx_is_system (is_system)
```

#### `mood_logs`
```sql
id                  BIGINT UNSIGNED PRIMARY KEY
user_id             BIGINT UNSIGNED FOREIGN KEY -> users.id
tenant_id           BIGINT UNSIGNED FOREIGN KEY -> tenants.id
uuid                CHAR(36) UNIQUE NOT NULL
mood_score          INTEGER NOT NULL (1-10)
note                TEXT NULLABLE
logged_at           TIMESTAMP NOT NULL
sync_status         ENUM('synced', 'pending', 'conflict') DEFAULT 'synced'
version             INTEGER DEFAULT 1
created_at          TIMESTAMP
updated_at          TIMESTAMP

INDEX idx_user_id (user_id)
INDEX idx_tenant_id (tenant_id)
INDEX idx_logged_at (logged_at)
```

#### `mood_log_emotions`
```sql
id                  BIGINT UNSIGNED PRIMARY KEY
mood_log_id         BIGINT UNSIGNED FOREIGN KEY -> mood_logs.id
emotion_id          BIGINT UNSIGNED FOREIGN KEY -> emotions.id
created_at          TIMESTAMP

INDEX idx_mood_log_id (mood_log_id)
```

### 3.5 Praise Wall

#### `testimonies`
```sql
id                  BIGINT UNSIGNED PRIMARY KEY
user_id             BIGINT UNSIGNED FOREIGN KEY -> users.id
tenant_id           BIGINT UNSIGNED FOREIGN KEY -> tenants.id
prayer_id           BIGINT UNSIGNED FOREIGN KEY -> prayers.id NULLABLE
uuid                CHAR(36) UNIQUE NOT NULL
title               VARCHAR(255) NOT NULL
content             TEXT NOT NULL
is_public           BOOLEAN DEFAULT FALSE
likes_count         INTEGER DEFAULT 0
sync_status         ENUM('synced', 'pending', 'conflict') DEFAULT 'synced'
version             INTEGER DEFAULT 1
created_at          TIMESTAMP
updated_at          TIMESTAMP
deleted_at          TIMESTAMP NULLABLE

INDEX idx_user_id (user_id)
INDEX idx_tenant_id (tenant_id)
INDEX idx_is_public (is_public)
```

#### `testimony_likes`
```sql
id                  BIGINT UNSIGNED PRIMARY KEY
testimony_id        BIGINT UNSIGNED FOREIGN KEY -> testimonies.id
user_id             BIGINT UNSIGNED FOREIGN KEY -> users.id
created_at          TIMESTAMP

UNIQUE KEY unique_like (testimony_id, user_id)
INDEX idx_testimony_id (testimony_id)
```

### 3.6 Tags & Categories

#### `tags`
```sql
id                  BIGINT UNSIGNED PRIMARY KEY
user_id             BIGINT UNSIGNED FOREIGN KEY -> users.id (NULL for system tags)
tenant_id           BIGINT UNSIGNED FOREIGN KEY -> tenants.id
name                VARCHAR(100) NOT NULL
slug                VARCHAR(100) NOT NULL
color               VARCHAR(7) NULLABLE
is_system           BOOLEAN DEFAULT FALSE
usage_count         INTEGER DEFAULT 0
created_at          TIMESTAMP
updated_at          TIMESTAMP

INDEX idx_user_id (user_id)
INDEX idx_tenant_id (tenant_id)
INDEX idx_slug (slug)
```

### 3.7 Notifications

#### `notifications`
```sql
id                  CHAR(36) PRIMARY KEY
type                VARCHAR(255) NOT NULL
notifiable_type     VARCHAR(255) NOT NULL
notifiable_id       BIGINT UNSIGNED NOT NULL
data                JSON NOT NULL
read_at             TIMESTAMP NULLABLE
created_at          TIMESTAMP
updated_at          TIMESTAMP

INDEX idx_notifiable (notifiable_type, notifiable_id)
INDEX idx_read_at (read_at)
```

### 3.8 Activity Logs

#### `activities`
```sql
id                  BIGINT UNSIGNED PRIMARY KEY
user_id             BIGINT UNSIGNED FOREIGN KEY -> users.id
tenant_id           BIGINT UNSIGNED FOREIGN KEY -> tenants.id
type                VARCHAR(100) NOT NULL (e.g., 'dream_created', 'prayer_answered')
description         TEXT NULLABLE
subject_type        VARCHAR(255) NULLABLE
subject_id          BIGINT UNSIGNED NULLABLE
properties          JSON NULLABLE
ip_address          VARCHAR(45) NULLABLE
user_agent          TEXT NULLABLE
created_at          TIMESTAMP

INDEX idx_user_id (user_id)
INDEX idx_tenant_id (tenant_id)
INDEX idx_type (type)
INDEX idx_subject (subject_type, subject_id)
INDEX idx_created_at (created_at)
```

### 3.9 Sync Management

#### `sync_queue`
```sql
id                  BIGINT UNSIGNED PRIMARY KEY
user_id             BIGINT UNSIGNED FOREIGN KEY -> users.id
tenant_id           BIGINT UNSIGNED FOREIGN KEY -> tenants.id
device_id           VARCHAR(255) NOT NULL
entity_type         VARCHAR(100) NOT NULL (e.g., 'dream', 'prayer')
entity_uuid         CHAR(36) NOT NULL
action              ENUM('create', 'update', 'delete') NOT NULL
payload             JSON NOT NULL
status              ENUM('pending', 'synced', 'failed', 'conflict') DEFAULT 'pending'
attempted_at        TIMESTAMP NULLABLE
synced_at           TIMESTAMP NULLABLE
error_message       TEXT NULLABLE
created_at          TIMESTAMP
updated_at          TIMESTAMP

INDEX idx_user_id (user_id)
INDEX idx_device_id (device_id)
INDEX idx_status (status)
INDEX idx_entity (entity_type, entity_uuid)
```

#### `devices`
```sql
id                  BIGINT UNSIGNED PRIMARY KEY
user_id             BIGINT UNSIGNED FOREIGN KEY -> users.id
tenant_id           BIGINT UNSIGNED FOREIGN KEY -> tenants.id
device_id           VARCHAR(255) UNIQUE NOT NULL
device_name         VARCHAR(255) NULLABLE
device_type         VARCHAR(50) NULLABLE (e.g., 'web', 'ios', 'android')
last_sync_at        TIMESTAMP NULLABLE
is_active           BOOLEAN DEFAULT TRUE
created_at          TIMESTAMP
updated_at          TIMESTAMP

INDEX idx_user_id (user_id)
INDEX idx_device_id (device_id)
```

### 3.10 Payment Management

#### `payment_methods`
```sql
id                  BIGINT UNSIGNED PRIMARY KEY
user_id             BIGINT UNSIGNED FOREIGN KEY -> users.id
stripe_id           VARCHAR(255) NOT NULL
type                VARCHAR(50) NOT NULL (e.g., 'card', 'paypal')
brand               VARCHAR(50) NULLABLE
last_four           VARCHAR(4) NULLABLE
exp_month           INTEGER NULLABLE
exp_year            INTEGER NULLABLE
is_default          BOOLEAN DEFAULT FALSE
created_at          TIMESTAMP
updated_at          TIMESTAMP

INDEX idx_user_id (user_id)
INDEX idx_stripe_id (stripe_id)
```

#### `invoices`
```sql
id                  BIGINT UNSIGNED PRIMARY KEY
user_id             BIGINT UNSIGNED FOREIGN KEY -> users.id
subscription_id     BIGINT UNSIGNED FOREIGN KEY -> subscriptions.id
stripe_id           VARCHAR(255) UNIQUE NOT NULL
amount              DECIMAL(10,2) NOT NULL
currency            VARCHAR(3) DEFAULT 'USD'
status              VARCHAR(50) NOT NULL
invoice_pdf         VARCHAR(255) NULLABLE
billing_period_start DATE NOT NULL
billing_period_end  DATE NOT NULL
paid_at             TIMESTAMP NULLABLE
created_at          TIMESTAMP
updated_at          TIMESTAMP

INDEX idx_user_id (user_id)
INDEX idx_stripe_id (stripe_id)
INDEX idx_status (status)
```

### 3.11 Settings & Preferences

#### `user_settings`
```sql
id                  BIGINT UNSIGNED PRIMARY KEY
user_id             BIGINT UNSIGNED FOREIGN KEY -> users.id UNIQUE
tenant_id           BIGINT UNSIGNED FOREIGN KEY -> tenants.id
theme               ENUM('light', 'dark', 'auto') DEFAULT 'light'
notifications_enabled BOOLEAN DEFAULT TRUE
email_notifications BOOLEAN DEFAULT TRUE
push_notifications  BOOLEAN DEFAULT TRUE
reminder_time       TIME DEFAULT '09:00:00'
auto_sync           BOOLEAN DEFAULT TRUE
data_usage_wifi_only BOOLEAN DEFAULT FALSE
created_at          TIMESTAMP
updated_at          TIMESTAMP

INDEX idx_user_id (user_id)
```

---

## 4. Feature Requirements

### 4.1 Authentication & Authorization

**Features:**
- Email/Password registration and login
- Email verification (OTP-based)
- Two-factor authentication (2FA)
- Password reset flow
- Social login (Google, Apple) - Optional
- Remember me functionality
- Session management across devices

**Implementation:**
- Laravel Sanctum for API authentication
- Laravel Fortify for authentication scaffolding
- Rate limiting on login attempts
- Password strength validation

### 4.2 Dream Journal

**Features:**
- Create, read, update, delete dreams
- Rich text editor for descriptions
- Audio recording and playback
- Date and time selection
- Sleep duration tracking
- Lucidity level indicator
- Recurring dream marking
- Nightmare flag
- Emotion tagging (multiple)
- Custom tags
- Search and filter by date, emotions, tags
- Dream statistics and analytics
- Export dreams (Premium)

**Validation:**
- Title: required, max 255 characters
- Date: required, not future date
- Audio: max 10MB (Premium only)
- Free tier: max 10 dreams/month

### 4.3 Prayer Journal

**Features:**
- Create, read, update, delete prayers
- Prayer categories
- Priority levels
- Status tracking (active, answered, archived)
- Prayer updates/journal entries
- Audio notes (Premium)
- Reminder system with frequencies
- Mark as answered with testimony
- Private/public toggle
- Tag system
- Search and filter
- Prayer statistics
- Export prayers (Premium)

**Validation:**
- Title: required, max 255 characters
- Reminders: Premium feature
- Audio: Premium only
- Free tier: max 10 prayers/month

### 4.4 Emotion Tracking

**Features:**
- Log daily mood (1-10 scale)
- Select multiple emotions
- Add notes to mood logs
- Create custom emotions (limited on free tier)
- Emotion analytics and trends
- Weekly/monthly mood charts
- Emotion insights

**Validation:**
- Mood score: required, 1-10
- Custom emotions: max 3 on free tier
- System emotions: always available

### 4.5 Praise Wall

**Features:**
- Create testimonies from answered prayers
- Public/private testimonies
- Like testimonies
- View community testimonies
- Filter by date, popularity
- Share testimonies (Premium)

**Validation:**
- Title: required, max 255 characters
- Content: required
- Public sharing: requires user consent

### 4.6 Activities & Analytics

**Features:**
- Activity timeline (all user actions)
- Weekly activity chart
- Monthly statistics
- Streak tracking
- Entry counts by type
- Trend analysis (Premium)
- Data export (Premium)

### 4.7 Profile Management

**Features:**
- Update profile information
- Change avatar
- Update email (with verification)
- Change password
- Manage timezone and language
- View account statistics
- Delete account (with confirmation)

### 4.8 Settings

**Features:**
- Theme selection (light/dark/auto)
- Notification preferences
- Email notification settings
- Push notification settings
- Reminder time configuration
- Auto-sync toggle
- Data usage preferences (WiFi only)
- Custom emotion management
- Account security (2FA)
- Privacy settings
- Subscription management

### 4.9 Subscription & Billing

**Features:**
- View current plan
- Upgrade to Premium
- Downgrade to Free
- Change billing cycle (monthly/yearly)
- Update payment method
- View billing history
- Download invoices
- Cancel subscription
- Reactivate subscription
- Trial period (14 days)

**Payment Integration:**
- Stripe for payment processing
- Webhook handling for subscription events
- Automatic invoice generation
- Failed payment retry logic
- Proration on plan changes

### 4.10 Offline Sync

**Features:**
- Offline data creation/editing
- Automatic sync when online
- Conflict resolution UI
- Sync status indicators
- Manual sync trigger
- Sync history
- Device management

**Sync Logic:**
- UUID-based entity identification
- Version tracking for conflict detection
- Last-write-wins with user override option
- Bulk sync API endpoints
- Delta sync (only changed data)
- Background sync workers

### 4.11 Notifications

**Features:**
- Prayer reminders
- Streak notifications
- Answered prayer celebrations
- System announcements
- Subscription alerts
- Sync conflict alerts
- In-app notification drawer
- Email notifications
- Push notifications (PWA)

### 4.12 Help & Support

**Features:**
- FAQ section
- Feature guides
- Search help articles
- Contact support (email)
- Live chat (Premium) - Optional
- Video tutorials - Optional

---

## 5. API Endpoints

### 5.1 Authentication
```
POST   /api/register
POST   /api/login
POST   /api/logout
POST   /api/forgot-password
POST   /api/reset-password
POST   /api/verify-email
POST   /api/resend-verification
POST   /api/two-factor/enable
POST   /api/two-factor/disable
POST   /api/two-factor/verify
```

### 5.2 Dreams
```
GET    /api/dreams
POST   /api/dreams
GET    /api/dreams/{uuid}
PUT    /api/dreams/{uuid}
DELETE /api/dreams/{uuid}
POST   /api/dreams/{uuid}/audio
GET    /api/dreams/stats
POST   /api/dreams/export (Premium)
POST   /api/dreams/sync
```

### 5.3 Prayers
```
GET    /api/prayers
POST   /api/prayers
GET    /api/prayers/{uuid}
PUT    /api/prayers/{uuid}
DELETE /api/prayers/{uuid}
POST   /api/prayers/{uuid}/updates
POST   /api/prayers/{uuid}/answer
POST   /api/prayers/{uuid}/audio
GET    /api/prayers/stats
POST   /api/prayers/sync
```

### 5.4 Emotions & Moods
```
GET    /api/emotions
POST   /api/emotions (custom)
PUT    /api/emotions/{id}
DELETE /api/emotions/{id}
GET    /api/mood-logs
POST   /api/mood-logs
GET    /api/mood-logs/analytics
POST   /api/mood-logs/sync
```

### 5.5 Testimonies
```
GET    /api/testimonies
POST   /api/testimonies
GET    /api/testimonies/{uuid}
PUT    /api/testimonies/{uuid}
DELETE /api/testimonies/{uuid}
POST   /api/testimonies/{uuid}/like
DELETE /api/testimonies/{uuid}/like
POST   /api/testimonies/sync
```

### 5.6 Sync
```
POST   /api/sync/pull
POST   /api/sync/push
GET    /api/sync/status
POST   /api/sync/resolve-conflict
GET    /api/devices
POST   /api/devices/register
DELETE /api/devices/{id}
```

### 5.7 Subscriptions
```
GET    /api/subscription
POST   /api/subscription/subscribe
POST   /api/subscription/cancel
POST   /api/subscription/resume
PUT    /api/subscription/payment-method
GET    /api/invoices
GET    /api/invoices/{id}/download
```

---

## 6. Laravel Packages Required

### Core Packages
- `laravel/sanctum` - API authentication
- `laravel/cashier` - Stripe integration
- `spatie/laravel-permission` - Role & permission management
- `spatie/laravel-activitylog` - Activity logging
- `stancl/tenancy` - Multitenancy (or custom)

### Additional Packages
- `intervention/image` - Image processing for avatars
- `spatie/laravel-medialibrary` - Media management
- `spatie/laravel-backup` - Database backups
- `barryvdh/laravel-dompdf` - PDF generation for exports
- `pusher/pusher-php-server` - Real-time notifications (optional)
- `laravel/horizon` - Queue monitoring
- `laravel/telescope` - Debugging (development)

---

## 7. Infrastructure Requirements

### 7.1 Server Requirements
- PHP 8.2+
- MySQL 8.0+ or PostgreSQL 14+
- Redis for caching and queues
- Node.js for asset compilation
- Supervisor for queue workers

### 7.2 Storage
- S3-compatible storage for audio files
- Local storage for development
- CDN for static assets (optional)

### 7.3 Services
- Stripe for payments
- Email service (Mailgun, SendGrid, SES)
- Push notification service (FCM, OneSignal) - optional
- Analytics (Google Analytics, Mixpanel) - optional

### 7.4 Queues & Jobs
- Email sending
- Audio processing
- Data sync processing
- Subscription webhooks
- Activity logging
- Report generation

---

## 8. Security Requirements

- HTTPS only
- CSRF protection
- XSS prevention
- SQL injection prevention (Eloquent ORM)
- Rate limiting on all API endpoints
- Input validation and sanitization
- Encrypted sensitive data
- Regular security audits
- GDPR compliance for data export/deletion
- Two-factor authentication
- Session timeout
- Password hashing (bcrypt)

---

## 9. Performance Requirements

- API response time < 200ms (95th percentile)
- Database query optimization
- Eager loading to prevent N+1 queries
- Redis caching for frequently accessed data
- CDN for static assets
- Image optimization
- Lazy loading for lists
- Pagination for large datasets
- Database indexing on foreign keys and frequently queried columns

---

## 10. Testing Requirements

- Unit tests for models and services
- Feature tests for API endpoints
- Browser tests for critical flows (Dusk)
- Payment webhook testing
- Sync conflict testing
- Load testing for scalability
- Security testing
- Minimum 80% code coverage

---

## 11. Deployment Strategy

- Staging environment for testing
- Production environment
- CI/CD pipeline (GitHub Actions, GitLab CI)
- Zero-downtime deployments
- Database migrations with rollback capability
- Environment-based configuration
- Monitoring and alerting (Sentry, Bugsnag)
- Regular backups (daily)
- Disaster recovery plan

---

## 12. Future Enhancements

- Mobile apps (iOS/Android) using React Native or Flutter
- AI-powered dream interpretation
- Community features (groups, sharing)
- Integrations (Google Calendar, Apple Health)
- Advanced analytics with ML insights
- Voice-to-text for audio transcription
- Multi-language support
- White-label solution for churches/organizations
- API for third-party integrations
- Zapier integration

---

## 13. Development Phases

### Phase 1: Foundation (Weeks 1-3)
- Laravel setup with multitenancy
- Database schema implementation
- Authentication system
- Basic CRUD for dreams and prayers

### Phase 2: Core Features (Weeks 4-6)
- Emotion tracking
- Praise wall
- Tag system
- Search and filtering
- Activity logs

### Phase 3: Premium Features (Weeks 7-9)
- Subscription system
- Payment integration
- Audio recording/playback
- Advanced analytics
- Data export

### Phase 4: Offline & Sync (Weeks 10-12)
- Offline storage (IndexedDB)
- Sync API implementation
- Conflict resolution
- Device management

### Phase 5: Polish & Launch (Weeks 13-14)
- UI/UX refinements
- Performance optimization
- Security audit
- Testing
- Documentation
- Deployment

---

## 14. Success Metrics

- User registration rate
- Free to Premium conversion rate (target: 5-10%)
- Monthly recurring revenue (MRR)
- Churn rate (target: <5%)
- Daily active users (DAU)
- Average session duration
- Feature adoption rates
- Customer satisfaction score
- API response times
- System uptime (target: 99.9%)

# Tenant Portal — User Guide

**Application:** Tenant Portal (SSO App Launcher)  
**URL Pattern:** `{slug}.busmgr.com`  
**Required Tier:** All plans  
**Version:** 1.0  
**Last Updated:** February 2026

---

## Overview

The Tenant Portal is the central entry point for all staff. It provides a branded, SSO-enabled app launcher where users can access every application included in their subscription.

**URL:** `{slug}.busmgr.com` (e.g., `hood-family-farms.busmgr.com`)

---

## Logging In

1. Navigate to `{slug}.busmgr.com`
2. Enter your email and password
3. The portal dashboard loads, showing all available applications

Once authenticated, the SSO cookie is shared across all `busmgr.com` subdomains — you won't need to log in again when opening other apps.

---

## Dashboard

After login, you'll see:

- **Tenant Branding** — Your business name and logo displayed in the header
- **App Cards** — Each enabled application shown as a card, organized by category
- **User Info** — Your name and role in the sidebar/header
- **Logout Button** — Signs you out of all applications

### App Categories

| Category | Description | Apps |
|----------|-------------|------|
| **Core** | Essential business tools | Back Office |
| **Sales & Commerce** | Customer-facing sales channels | POS Terminal, Restaurant POS, Online Store |
| **Operations** | Internal operational tools | Kitchen Display, Herds & Flocks |

### Launching an App

1. Browse available apps by category
2. Click any app card
3. The app opens in a new browser tab
4. You're automatically authenticated via SSO

### Locked Apps

Apps that require a higher subscription tier than your current plan will appear as locked/unavailable. Contact your administrator or upgrade your plan to gain access.

---

## Access Tracking

The portal records each app launch in the `tenant_app_access` table. This data helps administrators understand which apps are used most frequently and informs subscription decisions.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't log in | Verify email/password. Try clearing browser cookies for `busmgr.com`. |
| No apps showing | Your administrator may not have completed onboarding. Contact support. |
| App opens but requires login | SSO cookie may have expired. Log into the Portal first, then re-launch. |
| App shows as locked | Your subscription tier doesn't include this app. Contact your administrator. |

---

*See also: `USER_GUIDE_TENANT_ADMIN.md` for complete platform documentation.*

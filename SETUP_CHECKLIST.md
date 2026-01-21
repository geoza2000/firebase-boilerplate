# Project Setup Checklist

## Step 1: Replace Variables

Replace all `$$VARIABLE_NAME$$` placeholders:

### Project Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `$$PROJECT_NAME$$` | Package name (lowercase) | `my-app` |
| `$$PROJECT_TITLE$$` | Display name | `My App` |
| `$$PROJECT_DESCRIPTION$$` | Short description | `A great app` |
| `$$THEME_COLOR$$` | PWA theme color | `#6366f1` |

### Firebase Hosting

| Variable | Description | Example |
|----------|-------------|---------|
| `$$FIREBASE_HOSTING_SITE_DASHBOARD$$` | Dashboard hosting site | `my-app-12345` |
| `$$FIREBASE_HOSTING_SITE_WEBSITE$$` | Website hosting site | `my-app-website` |

### Firebase Dashboard App Config

These go in `packages/dashboard/.env.production` (create a separate web app in Firebase Console for the dashboard):

| Variable | Where to Find |
|----------|---------------|
| `$$FIREBASE_DASHBOARD_API_KEY$$` | Firebase Console → Project Settings → Web App (Dashboard) |
| `$$FIREBASE_DASHBOARD_AUTH_DOMAIN$$` | Usually `{project-id}.firebaseapp.com` |
| `$$FIREBASE_DASHBOARD_PROJECT_ID$$` | Firebase project ID |
| `$$FIREBASE_DASHBOARD_STORAGE_BUCKET$$` | Usually `{project-id}.appspot.com` |
| `$$FIREBASE_DASHBOARD_MESSAGING_SENDER_ID$$` | Project Settings → Cloud Messaging |
| `$$FIREBASE_DASHBOARD_APP_ID$$` | Project Settings → Web App (Dashboard) |
| `$$FIREBASE_DASHBOARD_MEASUREMENT_ID$$` | Project Settings → Web App (optional) |
| `$$FIREBASE_DASHBOARD_VAPID_KEY$$` | Project Settings → Cloud Messaging → Web Push certificates |

### Firebase Website App Config

These go in `packages/website/.env.production` (create a separate web app in Firebase Console for the website):

| Variable | Where to Find |
|----------|---------------|
| `$$FIREBASE_WEBSITE_API_KEY$$` | Firebase Console → Project Settings → Web App (Website) |
| `$$FIREBASE_WEBSITE_AUTH_DOMAIN$$` | Usually `{project-id}.firebaseapp.com` |
| `$$FIREBASE_WEBSITE_PROJECT_ID$$` | Firebase project ID |
| `$$FIREBASE_WEBSITE_STORAGE_BUCKET$$` | Usually `{project-id}.appspot.com` |
| `$$FIREBASE_WEBSITE_MESSAGING_SENDER_ID$$` | Project Settings → Cloud Messaging |
| `$$FIREBASE_WEBSITE_APP_ID$$` | Project Settings → Web App (Website) |
| `$$FIREBASE_WEBSITE_MEASUREMENT_ID$$` | Project Settings → Web App (optional) |

---

## Step 2: Quick Replace

```bash
# Replace all at once (run from project root)

# Project variables
find . -type f \( -name "*.json" -o -name "*.ts" -o -name "*.tsx" -o -name "*.html" -o -name "*.md" \) \
  -exec sed -i '' 's/\$\$PROJECT_NAME\$\$/my-app/g' {} +

find . -type f \( -name "*.json" -o -name "*.ts" -o -name "*.tsx" -o -name "*.html" -o -name "*.md" \) \
  -exec sed -i '' 's/\$\$PROJECT_TITLE\$\$/My App/g' {} +

find . -type f \( -name "*.json" -o -name "*.ts" -o -name "*.tsx" -o -name "*.html" -o -name "*.md" \) \
  -exec sed -i '' 's/\$\$PROJECT_DESCRIPTION\$\$/Your description/g' {} +

find . -type f \( -name "*.html" -o -name "*.ts" \) \
  -exec sed -i '' 's/\$\$THEME_COLOR\$\$/#6366f1/g' {} +

# Firebase hosting sites
find . -type f -name "*.json" \
  -exec sed -i '' 's/\$\$FIREBASE_HOSTING_SITE_DASHBOARD\$\$/your-project-id/g' {} +

find . -type f -name "*.json" \
  -exec sed -i '' 's/\$\$FIREBASE_HOSTING_SITE_WEBSITE\$\$/your-website/g' {} +

# Dashboard Firebase config (in .env.production)
sed -i '' 's/\$\$FIREBASE_DASHBOARD_API_KEY\$\$/your-api-key/g' packages/dashboard/.env.production
sed -i '' 's/\$\$FIREBASE_DASHBOARD_AUTH_DOMAIN\$\$/your-project.firebaseapp.com/g' packages/dashboard/.env.production
sed -i '' 's/\$\$FIREBASE_DASHBOARD_PROJECT_ID\$\$/your-project-id/g' packages/dashboard/.env.production
sed -i '' 's/\$\$FIREBASE_DASHBOARD_STORAGE_BUCKET\$\$/your-project.appspot.com/g' packages/dashboard/.env.production
sed -i '' 's/\$\$FIREBASE_DASHBOARD_MESSAGING_SENDER_ID\$\$/your-sender-id/g' packages/dashboard/.env.production
sed -i '' 's/\$\$FIREBASE_DASHBOARD_APP_ID\$\$/your-app-id/g' packages/dashboard/.env.production
sed -i '' 's/\$\$FIREBASE_DASHBOARD_MEASUREMENT_ID\$\$/G-XXXXXXXXXX/g' packages/dashboard/.env.production
sed -i '' 's/\$\$FIREBASE_DASHBOARD_VAPID_KEY\$\$/your-vapid-key/g' packages/dashboard/.env.production

# Website Firebase config (in .env.production)
sed -i '' 's/\$\$FIREBASE_WEBSITE_API_KEY\$\$/your-api-key/g' packages/website/.env.production
sed -i '' 's/\$\$FIREBASE_WEBSITE_AUTH_DOMAIN\$\$/your-project.firebaseapp.com/g' packages/website/.env.production
sed -i '' 's/\$\$FIREBASE_WEBSITE_PROJECT_ID\$\$/your-project-id/g' packages/website/.env.production
sed -i '' 's/\$\$FIREBASE_WEBSITE_STORAGE_BUCKET\$\$/your-project.appspot.com/g' packages/website/.env.production
sed -i '' 's/\$\$FIREBASE_WEBSITE_MESSAGING_SENDER_ID\$\$/your-sender-id/g' packages/website/.env.production
sed -i '' 's/\$\$FIREBASE_WEBSITE_APP_ID\$\$/your-app-id/g' packages/website/.env.production
sed -i '' 's/\$\$FIREBASE_WEBSITE_MEASUREMENT_ID\$\$/G-XXXXXXXXXX/g' packages/website/.env.production
```

---

## Step 3: Firebase Setup

1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Google Sign-In
3. Enable **Cloud Firestore**
4. Enable **Cloud Functions** (requires Blaze plan)
5. Add a **Web App** and copy config

---

## Step 4: Environment Files

The `.env.production` files are already set up with placeholders. For local development:

```bash
# Dashboard - create .env.development from production template
cd packages/dashboard
cp .env.production .env.development
# Edit .env.development - set VITE_USE_EMULATORS=true for local dev

# Website - create .env.development from production template
cd packages/website
cp .env.production .env.development
# Edit .env.development - set VITE_USE_EMULATORS=true for local dev

# Functions (if needed)
cd packages/functions
# Create .env.local for any secrets (gitignored)
```

**Note:** Dashboard and Website use separate Firebase web apps for proper analytics separation.

---

## Step 5: Install & Run

```bash
npm install
npm run build:shared
npm run sync:functions
npm run dev
```

---

## Step 6: Deploy

```bash
npx firebase-tools login
npx firebase-tools use --add
npm run deploy
```

---

## Find Remaining Variables

```bash
grep -r '\$\$.*\$\$' --include="*.ts" --include="*.tsx" --include="*.json" --include="*.html" --include=".env*" .
```

# Project Setup Checklist

## Step 1: Replace Variables

Replace all `$$VARIABLE_NAME$$` placeholders:

| Variable | Description | Example |
|----------|-------------|---------|
| `$$PROJECT_NAME$$` | Package name (lowercase) | `my-app` |
| `$$PROJECT_TITLE$$` | Display name | `My App` |
| `$$PROJECT_DESCRIPTION$$` | Short description | `A great app` |
| `$$FIREBASE_PROJECT_ID$$` | Firebase project ID | `my-app-12345` |
| `$$FIREBASE_HOSTING_SITE_DASHBOARD$$` | Dashboard hosting site | `my-app-12345` |
| `$$FIREBASE_HOSTING_SITE_WEBSITE$$` | Website hosting site | `my-app-website` |
| `$$THEME_COLOR$$` | PWA theme color | `#6366f1` |

### Firebase Config (for .env files)

| Variable | Where to Find |
|----------|---------------|
| `$$FIREBASE_API_KEY$$` | Firebase Console → Project Settings |
| `$$FIREBASE_AUTH_DOMAIN$$` | Usually `{project-id}.firebaseapp.com` |
| `$$FIREBASE_STORAGE_BUCKET$$` | Usually `{project-id}.appspot.com` |
| `$$FIREBASE_MESSAGING_SENDER_ID$$` | Project Settings → Cloud Messaging |
| `$$FIREBASE_APP_ID$$` | Project Settings → Web App |
| `$$FIREBASE_MEASUREMENT_ID$$` | Project Settings (optional) |

---

## Step 2: Quick Replace

```bash
# Replace all at once (run from project root)
find . -type f \( -name "*.json" -o -name "*.ts" -o -name "*.tsx" -o -name "*.html" -o -name "*.md" \) \
  -exec sed -i '' 's/\$\$PROJECT_NAME\$\$/my-app/g' {} +

find . -type f \( -name "*.json" -o -name "*.ts" -o -name "*.tsx" -o -name "*.html" -o -name "*.md" \) \
  -exec sed -i '' 's/\$\$PROJECT_TITLE\$\$/My App/g' {} +

find . -type f \( -name "*.json" -o -name "*.ts" -o -name "*.tsx" -o -name "*.html" -o -name "*.md" \) \
  -exec sed -i '' 's/\$\$PROJECT_DESCRIPTION\$\$/Your description/g' {} +

find . -type f \( -name "*.json" -o -name "*.md" \) \
  -exec sed -i '' 's/\$\$FIREBASE_PROJECT_ID\$\$/your-project-id/g' {} +

find . -type f -name "*.json" \
  -exec sed -i '' 's/\$\$FIREBASE_HOSTING_SITE_DASHBOARD\$\$/your-project-id/g' {} +

find . -type f -name "*.json" \
  -exec sed -i '' 's/\$\$FIREBASE_HOSTING_SITE_WEBSITE\$\$/your-website/g' {} +

find . -type f \( -name "*.html" -o -name "*.ts" \) \
  -exec sed -i '' 's/\$\$THEME_COLOR\$\$/#6366f1/g' {} +
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

```bash
# Dashboard
cd packages/dashboard
cp .env.example .env.development
# Edit with your Firebase config

# Functions
cd packages/functions
cp .env.example .env
```

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
grep -r '\$\$.*\$\$' --include="*.ts" --include="*.tsx" --include="*.json" --include="*.html" .
```

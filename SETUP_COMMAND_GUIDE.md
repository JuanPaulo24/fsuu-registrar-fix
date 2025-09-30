# FSUU Registrar System Setup Command

## Overview
The `setup:system` command automates the entire system setup process in one command, eliminating the need to run multiple commands manually.

## Usage

### Full Fresh Setup (Recommended for new installations)
```bash
php artisan setup:system --fresh
```
This will:
- 🗄️ Drop all existing tables and run fresh migrations
- 🌱 Seed the database with initial data
- 🔐 Generate Passport encryption keys (forced overwrite)
- 👤 Create a personal access client automatically
- 🧹 Clean storage/app/public directory (preserving keys/)

### Regular Setup (For existing installations)
```bash
php artisan setup:system
```
This will:
- 🗄️ Run regular migrations (without dropping tables)
- 🌱 Seed the database with initial data
- 🔐 Generate Passport encryption keys (forced overwrite)
- 👤 Create a personal access client automatically
- 🧹 Clean storage/app/public directory (preserving keys/)

## What This Command Replaces

### Before (Manual Process):
```bash
# Step 1: Migrate and seed
php artisan migrate:fresh --seed
# or
php artisan migrate --seed

# Step 2: Generate Passport keys
php artisan passport:keys --force

# Step 3: Create personal client (interactive)
php artisan passport:client --personal
# Then manually press Enter when prompted for client name

# Step 4: Manually clean storage directories
# rm -rf storage/app/public/profiles/
# rm -rf storage/app/public/documents/
# rm -rf storage/app/public/email_templates/
# rm -rf storage/app/public/default_banners/
# (Keep storage/app/public/keys/)
```

### After (Automated Process):
```bash
# Everything in one command
php artisan setup:system --fresh
```

## Features

### ✅ **Automated Client Creation**
- No more manual interaction required
- Automatically uses "FSUU Personal Access Client" as the default name
- Displays the generated Client ID and Secret

### ✅ **Smart Storage Cleanup**
- Automatically cleans all directories in `storage/app/public/`
- **Preserves** the `keys/` directory (important for document encryption)
- Creates a `.gitignore` file if missing
- Provides detailed cleanup summary

### ✅ **Comprehensive Verification**
- Verifies database tables were created
- Checks Passport keys exist and are accessible
- Confirms personal access client was created
- Validates storage directory structure
- Reports any issues found

### ✅ **Detailed Progress Reporting**
- 🚀 Clear step-by-step progress indicators
- ✅ Success confirmations for each step
- 📊 Summary statistics (tables created, items deleted, etc.)
- ⚠️ Important notes and warnings

## Security Considerations

- The command preserves the `storage/app/public/keys/` directory which contains encryption keys for document verification
- Passport keys are regenerated with `--force` flag for security
- Old storage files are completely removed to prevent data leaks

## Error Handling

If any step fails:
- The command will display the specific error
- It will show the stack trace for debugging
- Returns exit code 1 for integration with scripts

## Use Cases

### 🆕 **New Development Setup**
```bash
git clone your-repo
composer install
cp .env.example .env
# Configure your .env file
php artisan setup:system --fresh
```

### 🔄 **Development Reset**
```bash
php artisan setup:system --fresh
```

### 📈 **Production Deployment**
```bash
php artisan setup:system
```

### 🧪 **Testing Environment**
```bash
php artisan setup:system --fresh
```

## Output Example

```
🚀 Starting FSUU Registrar System Setup...

📦 Step 1: Running migrations with seeding...
   Running fresh migration (this will drop all tables)...
✅ Migrations and seeding completed successfully!

🔐 Step 2: Generating Passport encryption keys...
✅ Passport keys generated successfully!

👤 Step 3: Creating Passport personal access client...
✅ Personal access client created successfully!

🧹 Step 4: Cleaning storage/app/public directory...
   🗑️  Deleted directory: profiles/
   🗑️  Deleted directory: documents/
   📁 Preserving: keys/
   📊 Cleanup summary: 4 items deleted, 1 items preserved
✅ Storage cleanup completed successfully!

🔍 Step 5: Verifying setup...
   ✅ Database tables: 44 tables found
   ✅ Passport keys: Found and accessible
   ✅ Personal access client: Created successfully
   ✅ All verification checks passed

🎉 System setup completed successfully!
```

## Tips

- Run this command in a fresh terminal session
- Make sure your database connection is working before running
- The command is safe to run multiple times
- Use `--fresh` flag only when you want to completely reset the database
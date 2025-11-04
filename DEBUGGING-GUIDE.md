# 🐛 Debugging Guide for Company User Default Profile Creation

## 🎯 Issue Found

The default company user profile was NOT being created when a dealer registers because:

1. **Missing Database Fields**: The entity was missing `phone` and `is_default` columns
2. **Wrong Dealer Object**: The `createDefaultProfile` was called without the `user` relation loaded
3. **No Debugging**: Errors were silently caught without proper logging

---

## ✅ Fixes Applied

### 1. **Created Migration**
**File**: `1762212000000-AddPhoneAndIsDefaultToCompanyUser.ts`

**Adds**:
- `phone` column (varchar, nullable)
- `is_default` column (boolean, default false)
- Composite unique constraint on `(email, dealer_id)`
- Drops old unique constraint on email only

**Run Migration**:
```bash
cd apps/backend
npm run migration:run
```

---

### 2. **Updated Entity**
**File**: `company-user.entity.ts`

**Added fields**:
```typescript
@Column({ type: 'varchar', length: 50, nullable: true })
phone!: string | null;

@Column({ type: 'boolean', default: false })
is_default!: boolean;
```

**Added constraints**:
- `@Unique('UQ_company_users_email_dealer', ['email', 'dealer_id'])`
- `@Index('IDX_company_users_dealer_id', ['dealer_id'])`
- Proper TypeScript types with `Dealer` entity

---

### 3. **Enhanced CompanyUserService with Debugging**

**Added**:
- ✅ NestJS Logger instance
- ✅ Comprehensive logging in `createDefaultProfile()`
- ✅ Better error handling with stack traces
- ✅ Fixed `findByDealerId()` to use correct dealer_id
- ✅ Debug counters and data dumps

**Key Logs to Watch**:
```
📝 createDefaultProfile called for dealer ID: X
💾 Saving default profile to database...
✅ Default profile created successfully! ID: X
```

**Error Logs**:
```
❌ Error creating default profile for dealer X
❌ No dealer found for user ID: X
❌ No company users found for dealer X
```

---

### 4. **Enhanced DealerService with Debugging**

**Critical Fix**:
```typescript
// OLD (WRONG) - savedDealer doesn't have user relation
await this.companyUserService.createDefaultProfile(savedDealer);

// NEW (CORRECT) - Fetch dealer with user relation first
const dealerWithUser = await this.dealerRepository.findOne({
  where: { id: savedDealer.id },
  relations: ['user'],
});
await this.companyUserService.createDefaultProfile(dealerWithUser);
```

**Added**:
- ✅ NestJS Logger instance
- ✅ Log dealer save success
- ✅ Fetch dealer with user relation before profile creation
- ✅ Detailed error logging with stack traces
- ✅ Warning if profile creation fails but dealer creation continues

---

## 🧪 Testing Steps

### Step 1: Run Migration
```bash
cd apps/backend
npm run migration:run
```

**Expected Output**:
```
query: ALTER TABLE company_users ADD phone varchar NULL
query: ALTER TABLE company_users ADD is_default boolean NOT NULL DEFAULT false
✅ Migration successful
```

### Step 2: Verify Database Schema
```sql
\d company_users

-- Should show:
-- id, name, email, phone, position, is_default, dealer_id, created_at, updated_at
```

### Step 3: Create a New Dealer (via API or Postman)
```http
POST {{baseURL}}/dealers
Content-Type: multipart/form-data

{
  "name": "Test Company",
  "owner": "John Doe",
  "email": "john@test.com",
  "username": "johndoe",
  "password": "password123",
  "location": "New York",
  "contactEmail": "contact@test.com",
  "website": "https://test.com",
  "tierId": 1
}
```

### Step 4: Check Backend Logs

**Success Logs Should Show**:
```
✅ Dealer saved successfully with ID: X
🔄 Attempting to create default company user profile for dealer X...
📝 createDefaultProfile called for dealer ID: X
Creating default profile with data: {...}
💾 Saving default profile to database...
✅ Default profile created successfully! ID: Y
```

**If Errors**:
```
❌ Failed to create default company profile for dealer X
Error message: [specific error]
Error stack: [stack trace]
⚠️ Continuing dealer creation despite profile creation failure
```

### Step 5: Verify Profile Created
```http
GET {{baseURL}}/company-users
Authorization: Bearer {{dealer_jwt_token}}
```

**Expected Response**:
```json
[
  {
    "id": 1,
    "name": "Test Company",
    "email": "contact@test.com",
    "phone": null,
    "position": "Owner",
    "is_default": true,
    "dealer_id": 1,
    "created_at": "2025-11-04T...",
    "updated_at": "2025-11-04T..."
  }
]
```

**NOT This**:
```json
{
  "message": "No company users found for this dealer",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## 🔍 Debugging Checklist

If profile still not created, check logs for:

### ✅ Migration Ran Successfully
```bash
npm run migration:run
# Check for: Migration ... has been executed successfully
```

### ✅ Dealer Service Logs
Look for:
- [ ] "Dealer saved successfully with ID: X"
- [ ] "Attempting to create default company user profile"
- [ ] "Dealer with user relation: {...}"

### ✅ CompanyUser Service Logs
Look for:
- [ ] "createDefaultProfile called for dealer ID: X"
- [ ] "Creating default profile with data: {...}"
- [ ] "Saving default profile to database..."
- [ ] "Default profile created successfully! ID: Y"

### ✅ Database Check
```sql
-- Check if company_users table has new columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'company_users';

-- Should include: phone, is_default

-- Check for any company users
SELECT * FROM company_users;

-- Check dealers
SELECT id, name, contact_email FROM dealer;
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Migration Fails
**Error**: `column "phone" already exists`
**Solution**: Migration already ran, skip to testing

### Issue 2: "dealer.user is undefined"
**Error**: `Cannot read property 'email' of undefined`
**Solution**: Check dealerService - ensure dealer fetched with user relation

### Issue 3: Profile Created but findByDealerId Returns 404
**Error**: `No company users found for this dealer`
**Solution**: 
- Check logs for dealer_id mismatch
- Verify `findByDealerId` uses `dealer.id` not `user.id`

### Issue 4: Unique Constraint Violation
**Error**: `duplicate key value violates unique constraint`
**Solution**: 
- Old unique constraint on email still exists
- Run migration to replace with composite unique

### Issue 5: CompanyUserService Not Injected
**Error**: `Cannot read property 'createDefaultProfile' of undefined`
**Solution**: 
- Verify `CompanyUserModule` exports `CompanyUserService`
- Verify `DealerModule` imports `CompanyUserModule`

---

## 📊 Debugging Commands

### Check Migration Status
```bash
cd apps/backend
npm run migration:show
```

### View All Logs
```bash
# Start backend in development mode
npm run start:dev

# Watch for these patterns:
# ✅, ❌, 🔄, 📝, 💾, 🔍
```

### Database Inspection
```sql
-- Count company users
SELECT COUNT(*) FROM company_users;

-- Show all with dealer info
SELECT cu.*, d.name as dealer_name 
FROM company_users cu
JOIN dealer d ON d.id = cu.dealer_id;

-- Find orphaned profiles
SELECT * FROM company_users 
WHERE dealer_id NOT IN (SELECT id FROM dealer);
```

---

## 📋 Verification Checklist

Before testing:
- [ ] Migration file created
- [ ] Migration executed successfully
- [ ] Entity updated with phone and is_default
- [ ] CompanyUserService has Logger
- [ ] DealerService has Logger
- [ ] DealerService fetches dealer with user relation
- [ ] CompanyUserModule exports service
- [ ] DealerModule imports CompanyUserModule

After dealer creation:
- [ ] Check backend logs for success messages
- [ ] Query company_users table
- [ ] Test GET /company-users endpoint
- [ ] Verify is_default = true
- [ ] Verify dealer_id matches

---

## 🎯 Expected Behavior After Fixes

```
User Creates Dealer
       ↓
DealerService.createDealer()
       ↓
Save Dealer to DB (dealer.id = X)
       ↓
Fetch Dealer with User Relation
       ↓
Call CompanyUserService.createDefaultProfile(dealerWithUser)
       ↓
Check if default profile exists
       ↓
Create CompanyUser:
  - name: dealer.name
  - email: dealer.contactEmail || dealer.user.email
  - position: "Owner"
  - is_default: true
  - dealer_id: dealer.id
       ↓
Save to Database
       ↓
✅ Default Profile Created!
       ↓
GET /company-users returns the profile
```

---

## 🔧 Manual Profile Creation (Fallback)

If automatic creation still fails, create manually:

```http
POST {{baseURL}}/company-users
Authorization: Bearer {{dealer_jwt_token}}
Content-Type: application/json

{
  "name": "Company Name",
  "email": "contact@company.com",
  "position": "Owner",
  "phone": "+1234567890"
}
```

Then update to set as default:
```sql
UPDATE company_users 
SET is_default = true 
WHERE dealer_id = X AND id = Y;
```

---

## 📝 Summary

All debugging information is now in place:
1. ✅ Comprehensive logging in both services
2. ✅ Error stack traces captured
3. ✅ Database schema validated
4. ✅ Proper relation loading
5. ✅ Migration created and ready

**Next Step**: Run `npm run migration:run` and test dealer creation!

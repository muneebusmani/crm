# Company-User Module Implementation Review & Next Steps

## 📊 Current Status Assessment

### ✅ What's Been Done
1. **Database Schema**: `company_users` table created via migration
2. **Entity**: `CompanyUser` entity with basic fields
3. **Module Structure**: Module, Service, Controller created
4. **Basic CRUD**: Endpoints for create, read, update, delete

### ❌ Critical Issues Identified

#### 1. **Architectural Misalignment**
Your current implementation **blocks multiple profiles per dealer**:

```typescript
// ❌ WRONG: This prevents the Chrome-profile behavior you want
const existing = await this.companyUserRepo.findOne({ 
  where: { dealer_id: dealerId } 
});
if (existing) throw new BadRequestException('Dealer already has a company user');
```

**Required**: Allow multiple profiles per dealer (like Chrome profiles)

#### 2. **Missing Fields**
- ❌ No `phone` field in entity (schema has it)
- ❌ No `is_default` flag to mark default profile
- ❌ Email should not be globally unique (same email can exist across different dealers)

#### 3. **No Profile Selection Mechanism**
- ❌ No endpoint to "select" a profile
- ❌ No way to track which profile is active in session
- ❌ JWT token doesn't include profile context

#### 4. **No Default Profile Creation**
- ❌ Default profile not created during dealer registration
- ❌ No seeder for existing dealers

#### 5. **Security Issues**
- ❌ Update/Delete endpoints don't verify ownership (any authenticated user can modify any profile)
- ❌ FindAll returns all profiles across all dealers

---

## 🔧 Required Backend Fixes

### Phase 1: Fix Core Logic (Priority: CRITICAL)

#### 1.1 Update Entity
**File**: `apps/backend/src/company-user/entities/company-user.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Dealer } from 'src/user/entities';

@Entity('company_users')
@Unique(['email', 'dealer_id']) // ✅ Same email allowed across dealers
export class CompanyUser {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column({ nullable: true })
  phone!: string; // ✅ Add phone field

  @Column({ nullable: true })
  position!: string;

  @Column({ default: false })
  is_default!: boolean; // ✅ Mark default profile

  @ManyToOne(() => Dealer, (dealer) => dealer.companyUsers, { 
    onDelete: 'CASCADE' 
  })
  @JoinColumn({ name: 'dealer_id' })
  dealer!: Dealer;

  @Column()
  dealer_id!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
```

#### 1.2 Update Service Logic
**File**: `apps/backend/src/company-user/company-user.service.ts`

Key changes needed:
- ✅ Remove "one profile per dealer" restriction
- ✅ Add `createDefaultProfile()` method
- ✅ Add `selectProfile()` method with ownership verification
- ✅ Add ownership checks to update/delete
- ✅ Fix `findByDealerId()` query

#### 1.3 Update Controller
**File**: `apps/backend/src/company-user/company-user.controller.ts`

Key changes:
- ✅ Add `GET /select/:id` endpoint for profile selection
- ✅ Change `findAll()` to return only dealer's profiles
- ✅ Add ownership verification to update/delete

#### 1.4 Create Database Migration
**File**: Create new migration for schema updates

```typescript
// Add:
// - phone column
// - is_default column
// - Drop unique constraint on email
// - Add composite unique on (email, dealer_id)
```

### Phase 2: Integrate with Dealer Registration

#### 2.1 Export CompanyUserService
**File**: `apps/backend/src/company-user/company-user.module.ts`

```typescript
@Module({
  // ...
  exports: [CompanyUserService], // ✅ Export for use in DealerModule
})
```

#### 2.2 Import in DealerModule
**File**: `apps/backend/src/user/dealer/dealer.module.ts`

```typescript
imports: [
  // ... existing imports
  CompanyUserModule, // ✅ Add this
],
```

#### 2.3 Update DealerService
**File**: `apps/backend/src/user/dealer/dealer.service.ts`

Inject and use CompanyUserService to create default profile:

```typescript
constructor(
  // ... existing injections
  private readonly companyUserService: CompanyUserService,
) {}

async createDealer(...) {
  // ... existing dealer creation logic
  const savedDealer = await this.dealerRepository.save(dealer);
  
  // ✅ Create default profile
  await this.companyUserService.createDefaultProfile(savedDealer);
  
  // ... rest of the logic
}
```

---

## 🎯 Frontend Implementation Plan

### Phase 3: Profile Selection Flow

#### 3.1 Auth Flow Modification

**Current Flow**:
```
Login → JWT Token → Redirect to /dealer
```

**New Flow**:
```
Login → JWT Token → Profile Selection Screen → Selected Profile → Dealer Portal
```

#### 3.2 Profile Selection Page
**Location**: `apps/frontend/src/app/(dealer)/select-profile/page.tsx`

**Features**:
- Fetch dealer's profiles via `GET /company-users`
- Display as cards (similar to Chrome profile selection)
- On selection, call `GET /company-users/select/:id`
- Store selected profile in cookie/session storage
- Redirect to dealer dashboard

#### 3.3 Profile Context Provider
**Location**: `apps/frontend/src/contexts/ProfileContext.tsx`

```typescript
interface ProfileContextType {
  currentProfile: CompanyUser | null;
  profiles: CompanyUser[];
  selectProfile: (id: number) => Promise<void>;
  refreshProfiles: () => Promise<void>;
}
```

#### 3.4 Update Middleware
**File**: `apps/frontend/src/middleware.ts`

Add profile selection check:
```typescript
if (userType === 'dealer' && !selectedProfile) {
  return NextResponse.redirect(new URL('/dealer/select-profile', req.url));
}
```

#### 3.5 Profile Management UI
**Location**: `apps/frontend/src/app/(dealer)/dealer/profiles/page.tsx`

**Features**:
- List all profiles
- Create new profile
- Edit existing profiles
- Delete profiles (except default)
- Switch active profile

#### 3.6 Update API Calls
All dealer portal API calls should include profile context:
- Option 1: Send `profile_id` in headers
- Option 2: Store in session and backend retrieves from JWT + session
- Option 3: Create new JWT with profile info after selection

---

## 📋 Implementation Checklist

### Backend (Must complete first)
- [ ] Update `CompanyUser` entity (add phone, is_default, fix unique constraint)
- [ ] Create migration for entity changes
- [ ] Update `CompanyUserService` (remove single-profile restriction)
- [ ] Add `createDefaultProfile()` method
- [ ] Add `selectProfile()` method with ownership verification
- [ ] Fix `findByDealerId()` query
- [ ] Add ownership checks to update/delete
- [ ] Update controller endpoints
- [ ] Export `CompanyUserService` from module
- [ ] Import `CompanyUserModule` in `DealerModule`
- [ ] Inject and use in `DealerService.createDealer()`
- [ ] Create seeder for existing dealers (optional but recommended)
- [ ] Test all endpoints with Postman/curl

### Frontend (After backend is complete)
- [ ] Create profile selection page
- [ ] Create profile context provider
- [ ] Update middleware for profile checks
- [ ] Update login flow to redirect to profile selection
- [ ] Create profile management UI
- [ ] Add profile switcher component
- [ ] Update all dealer API calls to include profile context
- [ ] Add profile indicator in UI (show active profile)

---

## 🚀 Next Immediate Steps

1. **Run the corrected backend implementation** (I'll provide the exact code)
2. **Create and run migration** for schema updates
3. **Test backend endpoints** thoroughly
4. **Create seeder** for existing dealers (if any)
5. **Start frontend implementation** with profile selection page

---

## 💡 Recommendations

### Session Management
Use cookies to store selected profile:
```typescript
// After profile selection
cookieStore.set('selected_profile_id', profileId, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 // Same as dealer session
});
```

### Profile Switching
Allow easy profile switching without re-login:
- Add profile switcher dropdown in dealer portal header
- Show current profile name/email
- Quick switch between profiles

### Default Profile Rules
- Cannot delete default profile
- Cannot remove is_default flag if it's the only profile
- Auto-select default profile if only one exists

### Future Enhancements (Not needed now)
- Profile permissions (what each profile can access)
- Profile activity logs (who did what under which profile)
- Profile avatars
- Profile color themes

---

Would you like me to provide the exact corrected code for all the backend files?

# Admin Panel Design Documentation

## Overview

The Admin Panel has been designed following the existing ZotRide design system with clean, minimalist styling consistent with the rest of the application.

## Access Levels

### 1. **Owner** (`isOwner = true`)

The organization owner has full control:

- ✅ Promote members to admin
- ✅ Remove admin status from members
- ✅ Remove members from organization
- ✅ Authorize drivers
- ✅ Revoke driver status
- ✅ Get access code

### 2. **Admin** (`isAdmin = true`, `isOwner = false`)

Regular admins have limited control:

- ✅ Remove members from organization
- ✅ Authorize drivers
- ✅ Revoke driver status
- ✅ Get access code
- ❌ Cannot promote/demote admins (owner only)

## Features

### 1. Access Code Section

- Displays the organization access code in a prominent monospace font
- "Copy Code" button to copy access code to clipboard
- Visual feedback on copy action

### 2. Manage Members Section

- Toggleable section (Show/Hide Members button)
- Lists all organization members
- Shows member badges:
  - **Admin** badge (black background)
  - **Driver** badge (gray background)
- **Owner Controls:**
  - Green "Promote" button - Promote member to admin
  - Orange "Demote" button - Remove admin status
- **Admin/Owner Controls:**
  - Red "Remove" button - Remove member from organization

### 3. Authorize Drivers Section

- Toggleable section (Show/Hide Drivers button)
- Lists all members with driver authorization status
- Shows status badges:
  - **Authorized Driver** (green)
  - **Not a Driver** (gray)
- Action buttons:
  - Green "Authorize" button - Grant driver privileges
  - Red "Revoke" button - Remove driver privileges

## Design Patterns Used

### Styling Consistency

All styles match the existing ZotRide design system:

- **Buttons:** `rounded-full` with `border-2 border-black`
- **Cards:** `border-2 border-black rounded-lg` with `bg-white`
- **Container:** `bg-gray-100 border-2 border-black rounded-lg`
- **Hover effects:** Black background on hover (`hover:bg-black hover:text-white`)
- **Toggle states:** Active state shows black background
- **Spacing:** Consistent padding/margins (`px-[2rem]`, `py-[4rem]`, etc.)
- **Typography:** Bold headers at `text-3xl` and `text-xl`

### Color Scheme

- **Primary actions:** Black border/text
- **Success/Positive:** Green (`green-600`)
- **Warning:** Orange (`orange-500`)
- **Danger/Remove:** Red (`red-500`)
- **Info/Secondary:** Gray (`gray-700`)

### Interactive Elements

- All buttons have hover states
- Toggle buttons show active/inactive states
- Smooth transitions on all interactive elements
- Clear visual hierarchy

## Mock Data Structure

```typescript
{
  id: number,
  name: string,
  isAdmin: boolean,
  isDriver: boolean
}
```

## Props Interface

```typescript
interface AdminPanelProps {
  isOwner: boolean;
}
```

## State Management

Uses React `useState` hooks for:

- `showMembers` - Toggle members list visibility
- `showDrivers` - Toggle drivers list visibility
- `accessCode` - Store organization access code

## Backend Integration Points

All handler functions are ready for backend integration:

- `handlePromoteToAdmin(memberId)`
- `handleRemoveAdmin(memberId)`
- `handleRemoveMember(memberId)`
- `handleAuthorizeDriver(memberId)`
- `handleRevokeDriver(memberId)`
- `handleCopyAccessCode()`

## Future Enhancements

1. Real-time member data from backend
2. Confirmation modals for destructive actions
3. Success/error notifications
4. Search/filter functionality for large member lists
5. Pagination for organizations with many members
6. Activity logs for admin actions
7. Bulk actions (select multiple members)

# Password Recovery Implementation

## Overview
This implements a secure token-based password recovery system that replaces the previous temporary password approach.

## Database Setup

### 1. Create the password_resets table
Run the migration script to create the required table:

```sql
-- See migrations/create_password_resets_table.sql
```

If using Supabase, you can run this in the SQL Editor:
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `migrations/create_password_resets_table.sql`
4. Execute the query

### Table Structure
```
password_resets
├── id (SERIAL PRIMARY KEY)
├── userid (INTEGER, FK to users.id)
├── email (VARCHAR 255)
├── token (VARCHAR 255, UNIQUE)
├── expired_at (TIMESTAMP)
└── created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
```

## API Endpoints

### 1. Request Password Reset
**POST** `/Users/RecoverPassword`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Password recovery email sent successfully",
  "data": {
    "message": "Password reset link sent to email"
  }
}
```

**What it does:**
- Validates the email exists in the database
- Generates a secure random token (64 characters hex)
- Deletes any existing reset tokens for this user
- Saves the token to `password_resets` table with 1-hour expiration
- Sends an email with a reset link to the frontend

### 2. Verify Reset Token (Optional)
**GET** `/Users/VerifyResetToken?token=<token>`

**Query Parameters:**
- `token`: The reset token from the email link

**Response:**
```json
{
  "status": "success",
  "data": {
    "valid": true,
    "email": "user@example.com"
  }
}
```

**What it does:**
- Checks if the token exists and hasn't expired
- Returns the associated email (useful for displaying on the reset page)

### 3. Reset Password
**POST** `/Users/ResetPassword`

**Request Body:**
```json
{
  "token": "abc123...",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Password reset successfully",
  "data": {
    "message": "Password successfully reset"
  }
}
```

**What it does:**
- Validates the token and checks expiration
- Hashes the new password
- Updates the user's password in the database
- Deletes the used token
- User can now login with the new password

## Frontend Integration

### Environment Variables
Make sure your backend has the `FRONT_URL` environment variable set:
```env
FRONT_URL=http://localhost:3000
# or
FRONT_URL=https://yourdomain.com
```

### Reset Password Page Flow

1. **User requests password reset:**
   - User enters email on `/recover-password` page
   - Frontend calls `POST /Users/RecoverPassword`
   - User receives email with link to `/reset-password?token=abc123...`

2. **User clicks link in email:**
   - Frontend receives token from URL query parameter
   - (Optional) Call `GET /Users/VerifyResetToken?token=abc123...` to validate
   - Show reset password form

3. **User submits new password:**
   - Frontend calls `POST /Users/ResetPassword` with token and newPassword
   - On success, redirect to `/Login` page
   - Show success message

### Example Frontend Pages Needed

#### `/recover-password` or `/forgot-password`
- Email input form
- Calls `POST /Users/RecoverPassword`
- Shows success message to check email

#### `/reset-password`
- Reads `token` from URL query parameter
- Password input form (new password + confirm password)
- Calls `POST /Users/ResetPassword`
- Redirects to `/Login` on success

## Email Template
The recovery email includes:
- User's name for personalization
- Large "Reset Password" button with the reset link
- Plain text link as fallback
- 1-hour expiration notice
- Security warning if user didn't request the reset

## Security Features

1. **Secure Token Generation:** Uses Node.js crypto.randomBytes(32) for cryptographically secure tokens
2. **Token Expiration:** Tokens expire after 1 hour
3. **Single Use:** Tokens are deleted after successful password reset
4. **User Cleanup:** All existing tokens for a user are deleted when a new reset is requested
5. **No Password in Email:** Only sends a link, never sends passwords via email
6. **Hashed Passwords:** All passwords are hashed with bcrypt before storage

## Testing the Flow

1. **Request a reset:**
```bash
curl -X POST http://localhost:8080/Users/RecoverPassword \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

2. **Check your email** for the reset link

3. **Extract the token** from the link (e.g., `?token=abc123...`)

4. **Verify the token (optional):**
```bash
curl http://localhost:8080/Users/VerifyResetToken?token=abc123...
```

5. **Reset the password:**
```bash
curl -X POST http://localhost:8080/Users/ResetPassword \
  -H "Content-Type: application/json" \
  -d '{"token": "abc123...", "newPassword": "newPassword123"}'
```

6. **Login with new password**

## Maintenance

### Cleanup Expired Tokens
While tokens are automatically checked and cleaned when used, you may want to periodically clean up expired tokens:

```sql
DELETE FROM password_resets WHERE expired_at < NOW();
```

Or call the repository method (if you add a scheduled job):
```javascript
await passwordResetsRepositoryInstance.cleanExpiredTokens();
```

## Migration from Old System
The old `recoverPassword` function has been replaced. The old `sendPasswordRecoveryEmail` function still exists but is marked as deprecated. The new system uses `sendPasswordResetLinkEmail`.

## Files Changed
1. ✅ `src/utils/password.js` - Added `generateResetToken()`
2. ✅ `src/repositories/password-resets.repository.js` - New repository
3. ✅ `src/config/email.config.js` - Added `sendPasswordResetLinkEmail()`
4. ✅ `src/services/users.service.js` - Updated `recoverPassword()`, added `resetPassword()` and `verifyResetToken()`
5. ✅ `src/controllers/users.controller.js` - Added `resetPassword()` and `verifyResetToken()`
6. ✅ `src/routes/users.routes.js` - Added new routes
7. ✅ `migrations/create_password_resets_table.sql` - Database migration

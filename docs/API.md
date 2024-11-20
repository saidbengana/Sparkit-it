# API Documentation

## Authentication

### POST /api/auth/login
Login with email and password.

```typescript
{
  "email": string,
  "password": string
}
```

### POST /api/auth/register
Register a new user.

```typescript
{
  "email": string,
  "password": string,
  "name": string
}
```

### POST /api/auth/forgot-password
Request password reset.

```typescript
{
  "email": string
}
```

## Resumes

### GET /api/resumes
Get all resumes for authenticated user.

### GET /api/resumes/:id
Get specific resume by ID.

### POST /api/resumes
Create a new resume.

```typescript
{
  "name": string,
  "template": string,
  "data": {
    // Resume data structure
  }
}
```

### PUT /api/resumes/:id
Update existing resume.

### DELETE /api/resumes/:id
Delete a resume.

## Templates

### GET /api/templates
Get all available templates.

### GET /api/templates/:id
Get specific template by ID.

## User

### GET /api/user/profile
Get authenticated user's profile.

### PUT /api/user/profile
Update user profile.

```typescript
{
  "name": string,
  "email": string,
  "avatar": string
}
```

### PUT /api/user/password
Change user password.

```typescript
{
  "currentPassword": string,
  "newPassword": string
}
```

## Export

### POST /api/export/pdf
Export resume as PDF.

```typescript
{
  "resumeId": string,
  "format": "A4" | "Letter"
}
```

### POST /api/export/json
Export resume as JSON.

```typescript
{
  "resumeId": string
}
```

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
Invalid input data.

### 401 Unauthorized
Authentication required.

### 403 Forbidden
Insufficient permissions.

### 404 Not Found
Resource not found.

### 429 Too Many Requests
Rate limit exceeded.

### 500 Internal Server Error
Server error.

## Rate Limiting

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Authentication Headers

```http
Authorization: Bearer <token>
```

## Response Format

Success Response:
```json
{
  "data": {
    // Response data
  },
  "message": "Success message"
}
```

Error Response:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

## WebSocket Events

### resume:update
Real-time resume updates.

### user:status
User status changes.

## Development Guidelines

1. All endpoints should be versioned
2. Use proper HTTP methods
3. Implement proper validation
4. Include appropriate error messages
5. Document all changes

# Fixwise API Documentation

Complete REST API documentation for the Fixwise automated code fixing system with user management, team collaboration, and enterprise features.

## 🔐 Authentication

All API endpoints require authentication via JWT tokens. Tokens are automatically set as HTTP-only cookies upon login/registration.

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "apiKey": "abc123..."
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "apiKey": "abc123..."
  }
}
```

#### Logout User
```http
POST /api/auth/logout
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "subscriptionPlan": "free"
  }
}
```

## 📊 Dashboard APIs

### User Dashboard
```http
GET /api/dashboard/user
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "dashboard": {
    "stats": {
      "total_projects": 5,
      "total_snippets": 12,
      "total_analyses": 8,
      "total_fixes": 15,
      "total_issues": 23,
      "avg_execution_time": 1250
    },
    "recentActivity": [
      {
        "type": "project",
        "title": "My React App",
        "date": "2024-01-15T10:30:00Z",
        "item_id": 1
      }
    ],
    "projects": [
      {
        "id": 1,
        "name": "My React App",
        "file_count": 15,
        "analysis_count": 3,
        "fix_count": 2,
        "created_at": "2024-01-10T09:00:00Z"
      }
    ],
    "teams": [
      {
        "id": 1,
        "name": "Frontend Team",
        "user_role": "member"
      }
    ],
    "organizations": [
      {
        "id": 1,
        "name": "Acme Corp",
        "user_role": "member"
      }
    ]
  }
}
```

### Team Dashboard
```http
GET /api/dashboard/team/:teamId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "dashboard": {
    "stats": {
      "member_count": 5,
      "total_projects": 8,
      "total_analyses": 12,
      "total_fixes": 20,
      "total_issues": 35
    },
    "members": [
      {
        "id": 1,
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "role": "owner",
        "joined_at": "2024-01-01T00:00:00Z"
      }
    ],
    "recentActivity": [
      {
        "type": "analysis",
        "title": "Code Analysis",
        "date": "2024-01-15T10:30:00Z",
        "item_id": 1
      }
    ]
  }
}
```

### Enterprise Dashboard
```http
GET /api/dashboard/enterprise/:orgId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "dashboard": {
    "stats": {
      "member_count": 25,
      "total_projects": 45,
      "total_analyses": 120,
      "total_fixes": 200,
      "total_issues": 350
    },
    "members": [
      {
        "id": 1,
        "email": "admin@acme.com",
        "first_name": "Admin",
        "last_name": "User",
        "role": "admin",
        "joined_at": "2024-01-01T00:00:00Z"
      }
    ],
    "teams": [
      {
        "id": 1,
        "name": "Frontend Team",
        "owner_name": "John Doe",
        "member_count": 8
      }
    ]
  }
}
```

### Admin Dashboard
```http
GET /api/dashboard/admin
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "dashboard": {
    "stats": {
      "total_users": 150,
      "total_teams": 25,
      "total_organizations": 10,
      "total_projects": 500,
      "total_analyses": 1200,
      "total_fixes": 2000,
      "total_issues": 3500
    },
    "users": [
      {
        "id": 1,
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "role": "user",
        "status": "active",
        "created_at": "2024-01-01T00:00:00Z",
        "last_login": "2024-01-15T10:30:00Z",
        "subscription_plan": "free"
      }
    ],
    "teams": [
      {
        "id": 1,
        "name": "Frontend Team",
        "description": "Frontend development team",
        "owner_name": "John Doe",
        "member_count": 5,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "organizations": [
      {
        "id": 1,
        "name": "Acme Corp",
        "domain": "acme.com",
        "plan": "enterprise",
        "member_count": 25,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

## 👥 Team Management APIs

### Create Team
```http
POST /api/teams
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Frontend Team",
  "description": "Frontend development team"
}
```

### Add Team Member
```http
POST /api/teams/:teamId/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": 2,
  "role": "member"
}
```

### Get Team Members
```http
GET /api/teams/:teamId/members
Authorization: Bearer <token>
```

## 🏢 Organization Management APIs

### Create Organization (Admin Only)
```http
POST /api/organizations
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Acme Corp",
  "domain": "acme.com",
  "plan": "enterprise",
  "maxUsers": 100
}
```

### Add Organization Member
```http
POST /api/organizations/:orgId/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": 2,
  "role": "member"
}
```

### Get Organization Members
```http
GET /api/organizations/:orgId/members
Authorization: Bearer <token>
```

## 🔧 Admin CRUD APIs

### User Management

#### Get All Users
```http
GET /api/admin/users
Authorization: Bearer <token>
```

#### Create User
```http
POST /api/admin/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securepassword",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "user",
  "subscriptionPlan": "free"
}
```

#### Update User
```http
PUT /api/admin/users/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "admin",
  "status": "active",
  "subscriptionPlan": "pro"
}
```

#### Delete User
```http
DELETE /api/admin/users/:userId
Authorization: Bearer <token>
```

### Team Management

#### Get All Teams
```http
GET /api/admin/teams
Authorization: Bearer <token>
```

#### Create Team
```http
POST /api/admin/teams
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Backend Team",
  "description": "Backend development team",
  "ownerId": 1
}
```

#### Update Team
```http
PUT /api/admin/teams/:teamId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Full Stack Team",
  "description": "Full stack development team",
  "ownerId": 2
}
```

#### Delete Team
```http
DELETE /api/admin/teams/:teamId
Authorization: Bearer <token>
```

### Organization Management

#### Get All Organizations
```http
GET /api/admin/organizations
Authorization: Bearer <token>
```

#### Create Organization
```http
POST /api/admin/organizations
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Tech Corp",
  "domain": "techcorp.com",
  "plan": "enterprise",
  "maxUsers": 200
}
```

#### Update Organization
```http
PUT /api/admin/organizations/:orgId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Tech Solutions Corp",
  "domain": "techsolutions.com",
  "plan": "enterprise",
  "maxUsers": 500
}
```

#### Delete Organization
```http
DELETE /api/admin/organizations/:orgId
Authorization: Bearer <token>
```

## 🔐 Environment Variables Management (Admin Only)

### Get Environment Variables
```http
GET /api/admin/env
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "envVars": {
    "PORT": "3000",
    "JWT_SECRET": "your-secret-key",
    "DATABASE_URL": "sqlite:./fixwise.db",
    "NODE_ENV": "development"
  }
}
```

### Update Environment Variables
```http
PUT /api/admin/env
Authorization: Bearer <token>
Content-Type: application/json

{
  "envVars": {
    "PORT": "3000",
    "JWT_SECRET": "new-secret-key",
    "DATABASE_URL": "sqlite:./fixwise.db",
    "NODE_ENV": "production"
  }
}
```

### Add Environment Variable
```http
POST /api/admin/env
Authorization: Bearer <token>
Content-Type: application/json

{
  "key": "NEW_VARIABLE",
  "value": "new_value"
}
```

### Delete Environment Variable
```http
DELETE /api/admin/env/:key
Authorization: Bearer <token>
```

## 🔧 Fixwise Core APIs

### Analyze Code
```http
POST /api/analyze
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "console.log('Hello World');",
  "files": ["app.js", "index.html"]
}
```

### Run Fixes
```http
POST /api/fix
Authorization: Bearer <token>
Content-Type: application/json

{
  "layers": ["1", "2", "3"],
  "dryRun": false,
  "code": "console.log('Hello World');"
}
```

### Upload Files
```http
POST /api/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

files: [file1, file2, ...]
```

### Get Session History
```http
GET /api/history/:sessionId?type=all&limit=10
Authorization: Bearer <token>
```

### Get Statistics
```http
GET /api/statistics?days=30
Authorization: Bearer <token>
```

## 🚀 Fixwise CLI APIs

### Run CLI Command
```http
POST /api/fixwise/run
Authorization: Bearer <token>
Content-Type: application/json

{
  "command": "fix-all",
  "args": ["--verbose"]
}
```

### Run Specific Layer
```http
POST /api/fixwise/layer
Authorization: Bearer <token>
Content-Type: application/json

{
  "layer": 3,
  "verbose": true
}
```

### Analyze Codebase
```http
POST /api/fixwise/analyze
Authorization: Bearer <token>
Content-Type: application/json

{
  "json": true
}
```

### Get Project Status
```http
GET /api/fixwise/status?json=true
Authorization: Bearer <token>
```

### Create Backup
```http
POST /api/fixwise/backup
Authorization: Bearer <token>
```

### Get CLI Version
```http
GET /api/fixwise/version
Authorization: Bearer <token>
```

## 📋 Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## 🔒 Authentication & Authorization

### JWT Token Format
```json
{
  "userId": 1,
  "iat": 1642234567,
  "exp": 1642839367
}
```

### Role-Based Access
- **User**: Access to own dashboard, teams, organizations
- **Admin**: Full system access including user/team/org management and .env variables

### Token Management
- Tokens are automatically set as HTTP-only cookies
- Tokens expire after 7 days
- Tokens are automatically refreshed on API calls
- Logout clears the token cookie

## 📝 Usage Examples

### JavaScript/Node.js
```javascript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
});

// Get user dashboard
const dashboardResponse = await fetch('/api/dashboard/user', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Create team
const teamResponse = await fetch('/api/teams', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'My Team',
    description: 'Team description'
  })
});
```

### cURL Examples
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get dashboard
curl -X GET http://localhost:3000/api/dashboard/user \
  -H "Authorization: Bearer <token>"

# Create user (admin only)
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{"email":"new@example.com","password":"pass","firstName":"John","lastName":"Doe"}'
```

## 🔧 Configuration

### Environment Variables
- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - JWT signing secret
- `NODE_ENV` - Environment (development/production)
- `DATABASE_URL` - Database connection string

### Rate Limiting
- API calls are limited to prevent abuse
- Authentication endpoints have stricter limits
- Admin endpoints have additional rate limiting

### CORS
- CORS is enabled for development
- Production should configure specific origins
- Credentials are included for cookie-based auth

---

**For more information, see the main [README.md](./README.md) and [CLI_README.md](./CLI_README.md).** 
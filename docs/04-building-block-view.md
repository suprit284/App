# 4. Building Block View

## 4.1 Overview

### 4.1.1 Whitebox View of the System
The application follows a **layered architecture** with clear separation between presentation, business logic, and data layers. Each building block has well-defined responsibilities and interfaces.

**System Decomposition** (see diagram: `/docs/diagrams/building-blocks.png`):
1. **Presentation Layer:** React components and pages (Next.js App Router)
2. **Application Layer:** API routes, authentication logic, business services
3. **Data Layer:** MongoDB database with Mongoose models
4. **Infrastructure Layer:** Deployment platforms and external services

*Diagram: This illustrates the hierarchical decomposition of the system into major building blocks and their relationships.*


## 4.2 Level 1 Building Blocks

### 4.2.1 Presentation Layer Blocks

#### **Pages (`/app/`)** 
- **Responsibility:** Route handling, page-level logic, data fetching
- **Interface:** Next.js App Router conventions, React Server Components
- **Dependencies:** API routes, authentication context
- **Key Components:**
  - `app/login/page.tsx` - Authentication page
  - `app/profile/page.tsx` - Protected user dashboard
  - `app/profile/page.tsx` - User profile management
  - `app/profile/search/page.tsx` - User search interface

#### **Components (`/components/`)**
- **Responsibility:** Reusable UI elements, presentational logic
- **Interface:** Props-based, TypeScript interfaces
- **Dependencies:** Tailwind CSS, React hooks
- **Key Components:**
  - `app/login/page.tsx && app/signup/page.tsx` - Login/signup forms with validation
  - `UserCard.tsx` - User profile display component

#### **Layouts (`/app/layout.tsx`)**
- **Responsibility:** Global structure, navigation, theming
- **Interface:** Next.js Layout component
- **Dependencies:** Authentication context, routing
- **Features:**
  - Navigation menu with auth state
  - Responsive design adapters
  - Global error boundary
  - Toast notification system

### 4.2.2 Application Layer Blocks

#### **API Routes (`/app/api/`)**
- **Responsibility:** HTTP endpoint handling, request/response management
- **Interface:** RESTful endpoints, standardized error responses
- **Dependencies:** Authentication middleware, database models
- **Key Routes:**
  - `POST /api/auth/login` - User authentication
  - `POST /api/auth/signup` - User registration
  - `GET /api/users` - User search and retrieval
  - `PUT /api/users/:email` - User profile updates

#### **Authentication Logic (`/lib/auth/`)**
- **Responsibility:** JWT management, session handling, security
- **Interface:** Utility functions, middleware, hooks
- **Dependencies:** bcrypt, jsonwebtoken, HTTP headers
- **Key Functions:**
  - `verifyToken()` - JWT validation
  - `hashPassword()` - Password hashing with bcrypt
  - `createSession()` - Session creation and management
  - `authMiddleware()` - Route protection middleware

#### **Validators (`/lib/validators/`)**
- **Responsibility:** Input validation, data sanitization, type safety
- **Interface:** Zod schemas, validation functions
- **Dependencies:** Zod library, custom validation rules
- **Key Schemas:**
  - `userSchema` - User registration/validation
  - `loginSchema` - Login credentials validation
  - `updateUserSchema` - Profile update validation
  - `searchSchema` - Search query validation

### 4.2.3 Data Layer Blocks

#### **Database Models (`/models/`)**
- **Responsibility:** Data structure definition, business rules
- **Interface:** Mongoose schemas, TypeScript interfaces
- **Dependencies:** MongoDB Atlas, Mongoose ODM
- **Key Models:**
  - `User` - User account data with authentication fields

#### **Database Connection (`/lib/db/`)**
- **Responsibility:** MongoDB connection management, pooling
- **Interface:** Singleton connection instance, helper functions
- **Dependencies:** MongoDB Atlas URI, environment variables
- **Features:**
  - Connection pooling optimization
  - Error handling and reconnection logic
  - Production vs development configurations
  - Query timeout management

#### **Query Helpers (`/lib/db/queries/`)**
- **Responsibility:** Complex query abstraction, optimization
- **Interface:** Parameterized query functions
- **Dependencies:** Mongoose models, MongoDB indexes
- **Key Helpers:**
  - `findUserByEmail()` - Efficient email-based lookup
  - `searchUsers()` - Full-text search across multiple fields
  - `updateUserProfile()` - Atomic profile updates

### 4.2.4 Infrastructure Layer Blocks

#### **Deployment Configuration**
- **Responsibility:** Platform-specific deployment settings
- **Interface:** Configuration files, environment variables
- **Dependencies:** Vercel, Railway, MongoDB Atlas
- **Key Configurations:**
  - `vercel.json` - Vercel deployment settings
  - `Dockerfile` - Railway container configuration
  - `.env.example` - Environment variable template
  - `next.config.js` - Next.js build configuration

#### **External Services Integration**
- **Responsibility:** Third-party service communication
- **Interface:** API clients, webhook handlers
- **Dependencies:** Service APIs, authentication tokens
- **Integrated Services:**
  - MongoDB Atlas - Database as a service
  - Vercel Analytics - Performance monitoring
  - GitHub Actions - CI/CD automation

#### **DevOps Tooling**
- **Responsibility:** Development workflow, automation
- **Interface:** Scripts, configuration files
- **Dependencies:** Git, npm/yarn, CI/CD platforms
- **Key Tools:**
  - ESLint/Prettier - Code quality enforcement
  - Husky - Git hooks for pre-commit checks
  - GitHub Actions - Automated testing and deployment
  - Monitoring scripts - Health checks and alerts

## 4.3 Level 2 Building Blocks (Selected Details)

### 4.3.1 Authentication System Components

#### **JWT Token Manager**


**Implementation Details:**
- Uses HS246 signing algorithm
- Short-lived access tokens (14 minutes)
- Longer-lived refresh tokens (7 days)
- HTTP-only cookie storage for security
- Automatic token refresh before expiry

#### **Password Security Module**


**Implementation Details:**
- Salt generation per user
- Adaptive work factor for security
- Common password rejection
- Rate limiting on failed attempts

### 4.3.2 User Management Components

#### **User Service Layer**


**Features:**
- Transaction support for multi-operation updates
- Input validation before processing
- Audit logging for all operations
- Pagination support for large result sets

#### **Search Engine Component**


**Implementation:**
- MongoDB text indexes on name, username, email
- Query normalization and sanitization
- Performance optimization with projection
- Caching for frequent search patterns

## 4.4 Interfaces and Dependencies

### 4.4.1 Critical Interfaces

#### **Authentication API Interface**
```typescript
interface AuthenticationAPI {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  register(userData: UserRegistration): Promise<AuthResponse>;
  logout(): Promise<void>;
  refreshToken(): Promise<TokenRefreshResponse>;
  getCurrentUser(): Promise<User | null>;
}
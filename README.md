# JWT Authentication Service
A backend-only authentication service built to deeply understand
JWT-based auth flows, refresh token rotation, and session security.

## Purpose
This project was built as a focused exercise to understand
authentication flows in isolation before integrating them
into larger systems.

## Tech Stack
- Node.js
- Express
- PostgreSQL
- JWT

## Security Considerations
- Password hashing
- Token rotation to reduce replay risk
- Centralized error handling

## Authentication Flows
- User registration
- Login with access + refresh tokens
- Access token renewal via refresh token
- Secure logout with refresh token invalidation

## Token Strategy
- Short-lived access tokens
- Long-lived refresh tokens
- Token rotation on refresh
- Refresh token invalidation on logout


## API Endpoints

| Method | Endpoint        | Description              |
|------|-----------------|--------------------------|
| POST | /auth/register  | Register a new user      |
| POST | /auth/login     | Authenticate user        |
| POST | /auth/refresh   | Refresh access token     |
| POST | /auth/logout    | Invalidate session       |


## Related Projects
- **CitySync** – A full-stack meetup platform using a similar
  JWT-based authentication model integrated into a modular backend.

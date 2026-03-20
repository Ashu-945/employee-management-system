# Employee Management System

Full-stack employee management application with:
- `frontend/` - React + Vite
- `backend/` - Spring Boot
- `PostgreSQL` - recommended via Neon for production

## Recommended Production Stack
- Frontend: Vercel
- Backend: Render Web Service
- Database: Neon PostgreSQL

## Project Structure
- `frontend/`
- `backend/`
- `docker-compose.yml`
- `render.yaml`

## Frontend Deployment on Vercel
1. Import the GitHub repo into Vercel.
2. Set Root Directory to `frontend`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable:
   - `VITE_API_BASE_URL=https://your-render-backend.onrender.com/api`

## Backend Deployment on Render
1. Create a new Web Service from GitHub.
2. Use Root Directory `backend`.
3. Runtime: Docker.
4. Render will use `backend/Dockerfile`.
5. Add these environment variables:
   - `SPRING_DATASOURCE_URL`
   - `SPRING_DATASOURCE_USERNAME`
   - `SPRING_DATASOURCE_PASSWORD`
   - `SPRING_DATASOURCE_DRIVER=org.postgresql.Driver`
   - `SPRING_JPA_HIBERNATE_DDL_AUTO=update`
   - `APP_CORS_FRONT_END_URL=https://your-vercel-app.vercel.app`
   - `APP_AUTH_FRONTEND_SUCCESS_REDIRECT=https://your-vercel-app.vercel.app/oauth2/redirect`
   - `APP_AUTH_FRONTEND_ERROR_REDIRECT=https://your-vercel-app.vercel.app/login?error=true`
   - `SECURITY_JWT_SECRET=your-long-random-secret`
   - `SECURITY_JWT_COOKIE_SECURE=true`
   - `SECURITY_JWT_COOKIE_DOMAIN=`

## Neon Database Setup
1. Create a Neon project.
2. Create a database.
3. Copy the PostgreSQL connection details.
4. Use the Neon connection values in Render backend environment variables.
5. Recommended JDBC URL format:
   - `jdbc:postgresql://<host>/<db>?sslmode=require`

## Local Development
Frontend:
```bash
cd frontend
npm install
npm run dev
```

Backend:
```bash
cd backend
mvn spring-boot:run
```

## Environment Examples
- Frontend example: `frontend/.env.example`
- Backend example: `backend/.env.example`

## Important Notes
- Do not edit `backend/target/classes/application.properties`.
- Use `backend/src/main/resources/application.properties`.
- For production, update the admin bootstrap credentials and JWT secrets.

# MediFlow — Smart Clinic Operations Platform

MediFlow is a modern, scalable, and secure clinic operations platform designed to streamline healthcare delivery across multiple clinics.

## Project Status

### Completed
- **Phase 1**: Project Foundation, CI/CD, React + Express setup, MongoDB connection.
- **Phase 2A**: Authentication (JWT, Access/Refresh tokens).
- **Phase 2B**: Multi-Tenancy & RBAC (clinicId isolation, robust roles).
- **Phase 3**: Core Clinic Operations (Patients, Doctors, Appointments, Scheduling).
- **Phase 4**: Consultations, Prescriptions, Billing & Payments.
- **Phase 5**: Notifications, Real-Time updates (Socket.IO), Background Jobs (Redis, BullMQ), and Automated Reminders.
- **Phase 6**: Security Hardening (Helmet, Rate Limiting), Centralized Audit Logging, Operational Dashboard (Role-based metrics).
- **Phase 7**: Docker Containerization, Nginx reverse proxy, local `docker-compose` production-like environment, and GitHub Actions (CI & AWS ECR/ECS Deployment preparation).

### Next Steps
- Infrastructure & Deployment Observability (Phase 8)

## Architecture
- **Backend**: Node.js, Express, MongoDB, Redis, BullMQ, Socket.IO.
- **Frontend**: React, Vite, Tailwind CSS.
- **Infrastructure**: Docker, Nginx, GitHub Actions (CI/CD).

## Getting Started

### Local Development
1. Backend: \`cd backend && npm run dev\`
2. Workers: \`cd backend && node src/worker.js\`
3. Frontend: \`cd frontend && npm run dev\`

### Local Production-Like Environment (Docker)
Ensure you have Docker and Docker Compose installed.
Set up a `.env` file at the root with required variables (e.g., `MONGODB_URI`, `JWT_ACCESS_SECRET`).
Run:
\`\`\`bash
docker-compose up --build -d
\`\`\`
This starts:
- Frontend (Nginx, Port 80)
- Backend (Port 5000)
- Worker (Background processing)
- Redis (Internal only)

Access the app at `http://localhost`.

## CI/CD and Cloud Configuration
### GitHub Actions
- `.github/workflows/ci.yml`: Runs on PRs to `main` to verify frontend and backend build success and validates Docker image compilation.
- `.github/workflows/deploy.yml`: Pre-configured to use GitHub OIDC to securely authenticate to AWS, build images, and push them to Amazon ECR. 

### AWS Preparation (Requires manual setup)
- **ECR**: Needs the `mediflow` repository initialized.
- **ECS**: Setup ECS cluster `mediflow-cluster` and task definitions for Backend and Worker.
- **S3 / CloudWatch**: Standard output streams are used, making it instantly compatible with ECS CloudWatch logs. S3 integration is conceptually ready for storage needs but awaits specific use-cases (e.g. file uploads).

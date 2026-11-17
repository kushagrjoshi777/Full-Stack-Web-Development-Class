# Online Student Management System

A basic React frontend and Spring Boot REST API for adding, viewing, updating, and deleting students.

## Assignment document

- [Submission PDF](docs/Student-Management-Assignment.pdf)
- [Editable document](docs/assignment.md)

The document contains all seven answers, the architecture diagram, service responsibilities, REST API implementation with sample outputs, and screenshots.

The Student Service is implemented. The gateway, Course, Fee, Examination services, and their databases are proposed design components. Students are stored in memory and cleared when the backend restarts.

## Run

Requires Java 17 or later with JAVA_HOME set, and Node.js 22.12 or later. Maven Wrapper is included.

Start the backend from the project folder:

```powershell
cd student-service
.\mvnw.cmd spring-boot:run
```

In a second terminal, from the project folder:

```powershell
cd frontend
npm ci
npm run dev
```

Open http://localhost:5173. The API is at http://localhost:8081/api/students. Keep both terminals running.

On macOS/Linux, use `./mvnw spring-boot:run` for the backend.

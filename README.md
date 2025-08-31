
# VarsEL

## Live Demo
VarsEL can be seen at: [https://varsel.pages.dev/](https://varsel.pages.dev/)

> ⚠️ **Note**  
> If the backend is **not running**, you can manually start it by accessing the server, and giving it a jump start😊:  
> 👉 [https://varsel-hari.onrender.com/api/prices/](https://varsel-hari.onrender.com/api/prices/)




VarsEL is a private project designed to fetch and display electricity prices from an API. It consists of a backend service built with Spring Boot and a frontend application developed using Quasar Framework.

## Features
- Fetch electricity prices for different regions and cities.
- Display prices in a user-friendly table format.
- Filter prices by date and time range.

## Prerequisites
- Node.js and npm installed for the frontend.
- Java and Maven installed for the backend.
- Docker and Docker Compose installed (for Docker alternative).

## Start Application

### Option 1: Quick Start (Recommended)
From the project root directory, you can start both frontend and backend with a single command:

```bash
npm install
npm run dev
```

This will start both services simultaneously:
- Backend server at `http://localhost:8080`
- Frontend development server at `http://localhost:9000`

#### Available npm scripts:
- `npm run dev` or `npm start` - Start both frontend and backend
- `npm run frontend` - Start only the frontend
- `npm run backend` - Start only the backend
- `npm run build` - Build both frontend and backend
- `npm run install:all` - Install dependencies for both projects
- `npm run test` - Run tests for both projects
- `npm run clean` - Clean build artifacts for both projects

### Option 2: Manual Setup
#### Start Frontend
Navigate to the `varsel-frontend` directory and run the following command:

````bash
npm install
````

```bash
quasar dev
```

This will start the frontend development server at `http://localhost:9000`.

#### Start Backend
Navigate to the `varsel` directory and run the following command:


```bash
mvn clean install
```

```bash
mvn spring-boot:run
```

This will start the backend server at `http://localhost:8080`.

### Option 3: Using Docker
Navigate to the project root directory and run the following command:

```bash
docker-compose up --build
```

This will build and start both the backend and frontend services. The backend will be accessible at `http://localhost:8080`, and the frontend will be accessible at `http://localhost:80`.

## API Endpoints
- `/prices/{region}/{date}`: Fetch electricity prices for a specific region and date.
- Optional query parameters:
  - `startHour`: Filter prices starting from this hour.
  - `endHour`: Filter prices up to this hour.

## Project Structure
- **Backend**: Located in the `varsel` directory.
- **Frontend**: Located in the `varsel-frontend` directory.

## Technologies Used
- **Backend**: Java, Spring Boot
- **Frontend**: Vue.js, Quasar Framework
- **Other**: Docker, Maven, Axios

## License
This is a private project and not licensed for public use.

<h1 align="center">VarsEL</h1>

<p align="center"><strong>Electricity prices, clear at a glance.</strong><br />
Fetch and browse electricity prices by region, date and hour range.</p>

<p align="center">
  <a href="https://varsel.pages.dev/">Live demo</a> ·
  <a href="docs/notifications.md">Notifications</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-Java-6DB33F?logo=springboot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/Quasar-Vue-1976D2?logo=quasar&logoColor=white" alt="Quasar and Vue" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white" alt="Docker Compose" />
</p>

> **Heads up:** the demo backend sleeps when idle. If prices don't load, wake it by opening [varsel-hari.onrender.com/api/prices/](https://varsel-hari.onrender.com/api/prices/) and try again.

## What it does

- Fetches electricity prices for different regions and cities.
- Shows prices in a clean, readable table.
- Filters by date and by start and end hour.

## Run it

Needs Node.js and npm for the frontend, Java and Maven for the backend, and Docker if you prefer containers.

**Quick start** (both services from the project root):

```bash
npm install
npm run dev
```

The backend runs on `http://localhost:8080` and the frontend on `http://localhost:9000`.

| Script | What it does |
| --- | --- |
| `npm run dev` / `npm start` | Start frontend and backend |
| `npm run frontend` / `npm run backend` | Start just one of them |
| `npm run build` | Build both |
| `npm run install:all` | Install dependencies for both projects |
| `npm run test` | Run tests for both |
| `npm run clean` | Clean build artifacts |

**Docker:**

```bash
docker-compose up --build
```

The backend is at `http://localhost:8080` and the frontend at `http://localhost:80`.

**Manually:** run `npm install` then `quasar dev` in `varsel-frontend/`, and `mvn clean install` then `mvn spring-boot:run` in `varsel/`.

## API

`GET /prices/{region}/{date}` returns prices for a region and date. Optional query parameters: `startHour` and `endHour`.

## Built with

Java · Spring Boot · Vue.js · Quasar · Axios · Maven · Docker

```text
varsel/            Spring Boot backend
varsel-frontend/   Quasar frontend
docs/              Project documentation
```

## License

This is a private project and not licensed for public use.

---

Created by [Emil Berglund](https://github.com/EmilB04)

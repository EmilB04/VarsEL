# ⚡ VarsEL

> Fetch and display electricity prices, fast and simple.

**[Live Demo →](https://varsel.pages.dev/)**

VarsEL is a private project that fetches and displays electricity prices from an external API. It's built as a two-part app: a **Spring Boot** backend and a **Quasar (Vue.js)** frontend.

![Java](https://img.shields.io/badge/Java-Backend-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-Backend-6DB33F?logo=springboot&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js-Frontend-4FC08D?logo=vuedotjs&logoColor=white)
![Quasar](https://img.shields.io/badge/Quasar-Framework-1976D2?logo=quasar&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Supported-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/license-private-lightgrey)

---

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Option 1: Quick Start](#option-1-quick-start-recommended)
  - [Option 2: Manual Setup](#option-2-manual-setup)
  - [Option 3: Docker](#option-3-using-docker)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [License](#license)

---

## Features

- 📍 Fetch electricity prices for different regions and cities
- 📊 Display prices in a clean, user-friendly table
- 🕒 Filter prices by date and time range

## Prerequisites

| Requirement | Needed for |
|---|---|
| Node.js & npm | Frontend |
| Java & Maven | Backend |
| Docker & Docker Compose | Docker option (optional) |

## Getting Started

### Option 1: Quick Start (Recommended)

Run both services from the project root with a single command:

```bash
npm install
npm run dev
```

| Service | URL |
|---|---|
| Backend | `http://localhost:8080` |
| Frontend | `http://localhost:9000` |

**Available scripts:**

| Command | Description |
|---|---|
| `npm run dev` / `npm start` | Start both frontend and backend |
| `npm run frontend` | Start only the frontend |
| `npm run backend` | Start only the backend |
| `npm run build` | Build both frontend and backend |
| `npm run install:all` | Install dependencies for both projects |
| `npm run test` | Run tests for both projects |
| `npm run clean` | Clean build artifacts for both projects |

### Option 2: Manual Setup

**Frontend** — from `varsel-frontend`:

```bash
npm install
quasar dev
```

Runs at `http://localhost:9000`.

**Backend** — from `varsel`:

```bash
mvn clean install
mvn spring-boot:run
```

Runs at `http://localhost:8080`.

### Option 3: Using Docker

From the project root:

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Backend | `http://localhost:8080` |
| Frontend | `http://localhost:80` |

## API Reference

```
GET /prices/{region}/{date}
```

Fetch electricity prices for a specific region and date.

**Optional query parameters:**

| Parameter | Description |
|---|---|
| `startHour` | Filter prices starting from this hour |
| `endHour` | Filter prices up to this hour |

**Example:**

```bash
curl "http://localhost:8080/prices/oslo/2026-07-25?startHour=6&endHour=18"
```

## Project Structure

```
VarsEL/
├── varsel/            # Backend (Spring Boot)
└── varsel-frontend/   # Frontend (Quasar / Vue.js)
```

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java, Spring Boot |
| Frontend | Vue.js, Quasar Framework |
| Infra / Tooling | Docker, Maven, Axios |

## License

This is a private project and not licensed for public use.

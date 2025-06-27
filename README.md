# varsEL

varsEL is a private project designed to fetch and display electricity prices from an API. It consists of a backend service built with Spring Boot and a frontend application developed using Quasar Framework.

## Features
- Fetch electricity prices for different regions and cities.
- Display prices in a user-friendly table format.
- Filter prices by date and time range.

## Prerequisites
- Node.js and npm installed for the frontend.
- Java and Maven installed for the backend.

## Start Frontend
Navigate to the `varsel-frontend` directory and run the following command:

```bash
quasar dev
```

This will start the frontend development server.

## Start Backend
Navigate to the `varsel` directory and run the following command:

```bash
mvn spring-boot:run
```

This will start the backend server.

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
- **Other**: Maven, Axios

## License
This is a private project and not licensed for public use.
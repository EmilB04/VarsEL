# Backend Dockerfile
FROM maven:3.9.4-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn package -DskipTests -Dfile.encoding=UTF-8

# Use Maven image in the final stage to ensure Maven is available
FROM maven:3.9.4-eclipse-temurin-21 AS runtime
WORKDIR /app
COPY --from=build /app .
EXPOSE 8080
CMD ["mvn", "spring-boot:run"]

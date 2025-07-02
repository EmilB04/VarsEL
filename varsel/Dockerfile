# Backend Dockerfile
FROM maven:3.9.4-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn package -DskipTests -Dfile.encoding=UTF-8

FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY . .
EXPOSE 8080
CMD ["mvn", "spring-boot:run"]

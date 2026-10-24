FROM maven:3.9.9-eclipse-temurin-24 AS build
WORKDIR /app

COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN chmod +x mvnw

RUN ./mvnw -B -q dependency:resolve dependency:resolve-plugins

COPY src ./src
RUN ./mvnw -B -DskipTests package \
    && jar=$(ls target/*.jar | grep -v '\.original$' | head -n 1) \
    && cp "$jar" /app/app.jar

FROM eclipse-temurin:24-jre-noble
WORKDIR /app

RUN groupadd --system spring && useradd --system --gid spring spring
USER spring:spring

COPY --from=build /app/app.jar ./app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

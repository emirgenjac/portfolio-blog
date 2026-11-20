# CVE-2026-114938 is fixed in 25.0.5.1. The floating 25 tag can still track 25.0.5.
FROM eclipse-temurin:25.0.5.1_2-jdk-noble AS build
WORKDIR /app

COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN chmod +x mvnw

RUN ./mvnw -B -q dependency:resolve dependency:resolve-plugins

COPY src ./src
RUN ./mvnw -B -DskipTests package \
    && jar=$(ls target/*.jar | grep -v '\.original$' | head -n 1) \
    && cp "$jar" /app/app.jar

FROM eclipse-temurin:25.0.5.1_2-jre-noble
WORKDIR /app

RUN groupadd --system spring && useradd --system --gid spring spring
USER spring:spring

COPY --from=build /app/app.jar ./app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

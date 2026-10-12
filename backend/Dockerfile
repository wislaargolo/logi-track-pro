FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace

COPY .mvn/wrapper/maven-wrapper.properties .mvn/wrapper/maven-wrapper.properties
COPY mvnw pom.xml ./
COPY backend/pom.xml backend/pom.xml
RUN chmod +x mvnw
COPY backend/src/main backend/src/main
RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw -B -ntp -pl backend -am package

FROM eclipse-temurin:21-jre-alpine AS runtime
RUN apk add --no-cache curl \
    && addgroup -S -g 10001 app \
    && adduser -S -u 10001 -G app app
WORKDIR /app
COPY --from=build --chown=app:app /workspace/backend/target/backend-0.0.1-SNAPSHOT.jar app.jar
USER app:app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

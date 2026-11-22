FROM eclipse-temurin:25-jdk-alpine AS builder
WORKDIR /app
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN ./mvnw -q -Pdevelopment dependency:go-offline
COPY src src
RUN ./mvnw -q package -DskipTests

FROM builder AS development
RUN apk add --no-cache inotify-tools
CMD ["./docker-entrypoint-dev.sh"]

FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder /app/target/*.jar app.jar
USER app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY target/dark-web-deanonymizer-backend-1.0.0-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
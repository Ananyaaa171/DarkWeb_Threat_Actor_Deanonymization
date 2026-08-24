FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN apt-get update && apt-get install -y maven && \
    mvn clean package -DskipTests && \
    rm -rf /var/lib/apt/lists/*

EXPOSE 8080

CMD ["sh", "-c", "java -jar target/dark-web-deanonymizer-backend-1.0.0-SNAPSHOT.jar --server.port=${PORT:-8080}"]
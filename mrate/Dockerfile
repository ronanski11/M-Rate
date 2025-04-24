# Use a base image with Java 21 installed
FROM openjdk:21-jdk

# Set the working directory in the container
WORKDIR /app

# Copy the packaged JAR file from your target directory to the container
COPY mrate/target/mrate-0.0.1-SNAPSHOT.jar app.jar

# Expose the port that your Spring Boot application will run on
EXPOSE 8080

# Set the command to run your Spring Boot application
CMD ["java", "-jar", "app.jar"]

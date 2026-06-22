# syntax=docker/dockerfile:1.4

### --- Build Stage ---
FROM --platform=$BUILDPLATFORM maven:3.8.5-eclipse-temurin-17 AS builder
WORKDIR /workdir/server

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn clean install -DskipTests

### --- Extract JAR Dependencies ---
FROM builder AS prepare-production
WORKDIR /workdir/server/target/dependency
RUN jar -xf ../*.jar

### --- Runtime Stage ---
FROM eclipse-temurin:17-jre-alpine

ENV APP_HOME=/app \
    JAVA_OPTS="-Xms128m -Xmx256m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+UseContainerSupport"

WORKDIR $APP_HOME

COPY --from=prepare-production /workdir/server/target/dependency/BOOT-INF/lib ./lib
COPY --from=prepare-production /workdir/server/target/dependency/META-INF ./META-INF
COPY --from=prepare-production /workdir/server/target/dependency/BOOT-INF/classes ./

EXPOSE 8085

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -cp .:lib/* tn.esprit.servicemeet.ServiceMeetApplication"]

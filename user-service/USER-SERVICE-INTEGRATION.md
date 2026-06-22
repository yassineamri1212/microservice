# User Service Microservice Integration

## Overview
Updated user-service to be fully integrated with the microservice architecture, including:
- Eureka service discovery
- Internal Kubernetes cluster communication
- API Gateway routing
- Helm deployment charts

## Changes Made

### 1. Updated pom.xml
- Added Spring Cloud version: `2023.0.0`
- Added Eureka client dependency: `spring-cloud-starter-netflix-eureka-client`
- Added Actuator for health checks: `spring-boot-starter-actuator`
- Added dependency management for Spring Cloud

### 2. Updated application.yml
- Set service port: `8089`
- Added Spring application name: `user-service`
- Configured Keycloak internal URL: `http://keycloak:9090/auth`
- Added Eureka client configuration pointing to cluster: `http://eureka-0.eureka.default.svc.cluster.local:8761/eureka/`
- Added management endpoints for health checks

### 3. Updated Main Application Class
- Added `@EnableEurekaClient` annotation to `UserServiceApplication.java`

### 4. Updated Keycloak Configuration
- Made Keycloak server URL configurable via `@Value` annotation
- Updated default URL to use internal service name: `http://keycloak:9090/auth`
- Added proper Spring `@Configuration` and `@Bean` annotations
- Maintained backward compatibility with static `getInstance()` method

### 5. Updated API Gateway
- Added user-service route configuration:
  ```yaml
  - id: user-service
    uri: lb://USER-SERVICE
    predicates:
      - Path=/api/user/**
    filters:
      - StripPrefix=1
  ```

### 6. Created Helm Charts
Created complete Helm deployment structure in `helm-deployment/user-service/`:

#### Chart.yaml
- Chart name: `user-service`
- Version: `0.1.1`
- App version: `1.0`

#### values.yaml
- Replica count: `1`
- Image: `theoldisback/user-service:stb`
- Service type: `ClusterIP`
- Service port: `8089`

#### Templates
- **deployment.yaml**: Kubernetes deployment with proper environment variables
- **service.yaml**: Kubernetes service configuration
- **_helpers.tpl**: Helm template helpers

## Service Communication

### Internal Communication
- **Keycloak**: `http://keycloak:9090/auth` (internal cluster communication)
- **Eureka**: `http://eureka-0.eureka.default.svc.cluster.local:8761/eureka/`

### External Access
- **API Gateway Route**: `/api/user/**` → `USER-SERVICE` (with StripPrefix filter)
- **Frontend Access**: Via API Gateway at `https://stb-stages.com/api/user/`

## Deployment Instructions

1. **Build Docker Image**:
   ```bash
   cd user-service
   docker build -t theoldisback/user-service:stb .
   docker push theoldisback/user-service:stb
   ```

2. **Deploy with Helm**:
   ```bash
   cd helm-deployment
   helm install user-service ./user-service/
   ```

3. **Verify Deployment**:
   ```bash
   kubectl get pods -l app=user-service
   kubectl get svc user-service
   ```

## Environment Variables in Deployment
- `EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE`: Points to Eureka server
- `KEYCLOAK_AUTH_SERVER_URL`: Points to internal Keycloak service

## Integration Points
- ✅ Eureka service discovery registration
- ✅ API Gateway routing with load balancing
- ✅ Internal Keycloak communication
- ✅ Health check endpoints
- ✅ Kubernetes-ready Helm charts
- ✅ Docker containerization

## Testing
After deployment, the service will be available at:
- Internal: `http://user-service:8089`
- External: `https://stb-stages.com/api/user/`

The service will automatically register with Eureka and be discoverable by other services.

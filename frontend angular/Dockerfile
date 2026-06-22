# Multi-stage build for Angular application
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Angular CLI globally first
RUN npm install -g @angular/cli@17

# Install dependencies (use legacy peer deps to resolve version conflicts)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the Angular application for production
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy built application from build stage
COPY --from=build /app/dist/fuse /usr/share/nginx/html

# Create nginx configuration for Angular routing
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80 (will be mapped to 4200 externally via LoadBalancer)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

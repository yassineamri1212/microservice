-- Create a separate user for Keycloak
CREATE USER keycloakuser WITH PASSWORD 'keycloakpass';

-- Create a database for Keycloak
CREATE DATABASE keycloak OWNER keycloakuser;

-- Grant all privileges on the new DB to Keycloak user
GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloakuser;
#!/bin/bash

# Script per configurare Keycloak con realm, client e ruoli

KEYCLOAK_URL="http://localhost:8080"
ADMIN_USER="admin"
ADMIN_PASSWORD="admin_password"
REALM_NAME="registro-realm"

# Attendi che Keycloak sia pronto
echo "Attendendo Keycloak..."
sleep 10

# Ottieni token admin
echo "Autenticazione come admin..."
TOKEN=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$ADMIN_USER" \
  -d "password=$ADMIN_PASSWORD" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r '.access_token')

echo "Token: $TOKEN"

# Crea il realm
echo "Creazione realm $REALM_NAME..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "realm": "'$REALM_NAME'",
    "enabled": true,
    "accountTheme": "keycloak",
    "loginTheme": "keycloak"
  }'

# Crea i client
echo "Creazione client per frontend..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "registro-frontend",
    "name": "Registro Frontend",
    "enabled": true,
    "publicClient": true,
    "redirectUris": ["http://localhost:4200/*"],
    "webOrigins": ["http://localhost:4200"],
    "protocol": "openid-connect",
    "standardFlowEnabled": true,
    "implicitFlowEnabled": true
  }'

echo "Creazione client per backend..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "registro-backend",
    "name": "Registro Backend",
    "enabled": true,
    "publicClient": false,
    "secret": "your-client-secret",
    "protocol": "openid-connect",
    "standardFlowEnabled": true,
    "serviceAccountsEnabled": true
  }'

# Crea i ruoli
echo "Creazione ruoli..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/roles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "docente",
    "description": "Ruolo Docente"
  }'

curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/roles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "studente",
    "description": "Ruolo Studente"
  }'

# Crea utente docente di test
echo "Creazione utente docente test..."
DOCENTE=$(curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "docente1",
    "email": "docente1@example.com",
    "firstName": "Mario",
    "lastName": "Rossi",
    "enabled": true,
    "credentials": [{
      "type": "password",
      "value": "password123",
      "temporary": false
    }]
  }' \
  -w '%{http_code}')

# Crea utente studente di test
echo "Creazione utente studente test..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "studente1",
    "email": "studente1@example.com",
    "firstName": "Giovanni",
    "lastName": "Bianchi",
    "enabled": true,
    "credentials": [{
      "type": "password",
      "value": "password123",
      "temporary": false
    }]
  }'

echo "Setup completato!"

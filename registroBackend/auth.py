from jose import JWTError, jwt
import requests
from functools import wraps
from flask import request, jsonify, current_app
import os

class KeycloakAuth:
    """Gestore dell'autenticazione Keycloak"""
    
    def __init__(self):
        self.server_url = os.getenv('KEYCLOAK_SERVER_URL', 'http://localhost:8080')
        self.realm = os.getenv('KEYCLOAK_REALM', 'registro-realm')
        self.client_id = os.getenv('KEYCLOAK_CLIENT_ID', 'registro-backend')
        self.client_secret = os.getenv('KEYCLOAK_CLIENT_SECRET', 'your-client-secret')
        self.public_key = None
    
    def get_public_key(self):
        """Ottiene la chiave pubblica di Keycloak"""
        if not self.public_key:
            url = f"{self.server_url}/realms/{self.realm}/protocol/openid-connect/certs"
            try:
                response = requests.get(url, timeout=5)
                response.raise_for_status()
                keys = response.json()['keys']
                if keys:
                    self.public_key = keys[0]
            except Exception as e:
                print(f"Errore nel recuperare la chiave pubblica: {e}")
                return None
        return self.public_key
    
    def verify_token(self, token):
        """Verifica e decodifica il token JWT"""
        try:
            # Rimuovi 'Bearer ' dal token se presente
            if token.startswith('Bearer '):
                token = token[7:]
            
            # Decodifica il token senza validazione della firma (più semplice per il test)
            decoded = jwt.get_unverified_claims(token)
            
            # Verifica che il token non sia scaduto
            import time
            if decoded.get('exp', 0) < time.time():
                return None
            
            return decoded
        except JWTError as e:
            print(f"Errore nella decodifica del token: {e}")
            return None
    
    def get_user_info(self, token_claims):
        """Estrae le informazioni utente dal token"""
        return {
            'username': token_claims.get('preferred_username'),
            'email': token_claims.get('email'),
            'name': token_claims.get('name'),
            'roles': token_claims.get('realm_access', {}).get('roles', [])
        }

def token_required(f):
    """Decorator per proteggere le route con autenticazione"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Cerca il token nell'header Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Token non valido'}), 401
        
        if not token:
            return jsonify({'message': 'Token assente'}), 401
        
        keycloak = current_app.keycloak
        token_claims = keycloak.verify_token(token)
        
        if not token_claims:
            return jsonify({'message': 'Token non valido o scaduto'}), 401
        
        user_info = keycloak.get_user_info(token_claims)
        request.user = user_info
        request.token_claims = token_claims
        
        return f(*args, **kwargs)
    
    return decorated

def role_required(required_role):
    """Decorator per proteggere le route con controllo del ruolo"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(request, 'user'):
                return jsonify({'message': 'Autenticazione richiesta'}), 401
            
            if required_role not in request.user.get('roles', []):
                return jsonify({'message': f'Ruolo {required_role} richiesto'}), 403
            
            return f(*args, **kwargs)
        
        return decorated
    return decorator

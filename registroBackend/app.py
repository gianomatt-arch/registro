import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from database import DatabaseWrapper
from auth import KeycloakAuth, token_required, role_required

# Inizializza l'app Flask
app = Flask(__name__)
CORS(app)

# Configura il database
db = DatabaseWrapper(
    host=os.getenv('DB_HOST', 'localhost'),
    user=os.getenv('DB_USER', 'registro_user'),
    password=os.getenv('DB_PASSWORD', 'registro_password'),
    database=os.getenv('DB_NAME', 'registro_db')
)

# Configura Keycloak
keycloak = KeycloakAuth()
app.keycloak = keycloak

# Inizializza il database
try:
    db.init_database()
except Exception as e:
    print(f"Errore nell'inizializzazione del database: {e}")

# ==================== ROUTE PUBBLICHE ====================

@app.route('/', methods=['GET'])
def welcome():
    """Endpoint di benvenuto - informazioni sull'API"""
    return jsonify({
        'message': '👋 Benvenuto nel Backend Registro Elettronico',
        'version': '1.0.0',
        'endpoints': {
            'salute': 'GET /health',
            'autenticazione': {
                'ottieni_utente': 'GET /auth/user (richiede token)'
            },
            'docente': {
                'voti': 'GET /docente/voti',
                'inserisci_voto': 'POST /docente/voto',
                'studenti': 'GET /docente/studenti'
            },
            'studente': {
                'miei_voti': 'GET /studente/voti',
                'mio_profilo': 'GET /studente/profile'
            },
            'admin': {
                'sincronizza_studenti': 'POST /admin/studenti/sync',
                'sincronizza_docenti': 'POST /admin/docenti/sync'
            }
        },
        'status': 'online',
        'database': 'connected' if check_db_connection() else 'disconnected'
    }), 200

@app.route('/health', methods=['GET'])
def health():
    """Verifica la salute dell'API"""
    return jsonify({'status': 'ok'}), 200

# ==================== ROUTE DI AUTENTICAZIONE ====================

@app.route('/auth/user', methods=['GET'])
@token_required
def get_user():
    """Restituisce le informazioni dell'utente autenticato"""
    return jsonify(request.user), 200

# ==================== ROUTE DOCENTE ====================

@app.route('/docente/voti', methods=['GET'])
@token_required
@role_required('docente')
def get_all_voti():
    """Docente: visualizza tutti i voti"""
    try:
        voti = db.get_tutti_voti()
        return jsonify(voti), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/docente/voto', methods=['POST'])
@token_required
@role_required('docente')
def insert_voto():
    """Docente: inserisce un nuovo voto"""
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ['nome_studente', 'materia', 'voto']):
            return jsonify({'error': 'Dati non completi'}), 400
        
        # Cerca lo studente per nome e cognome
        studente = db.get_studente_by_username(data.get('nome_studente'))
        
        if not studente:
            # Se non trovato per username, crea un record di test
            # In produzione, useresti un endpoint separato
            return jsonify({'error': 'Studente non trovato'}), 404
        
        # Inserted the voto
        docente = db.get_docente_by_username(request.user['username'])
        docente_id = docente['id'] if docente else None
        
        voto_id = db.insert_voto(
            id_studente=studente['id'],
            materia=data['materia'],
            voto=float(data['voto']),
            id_docente=docente_id
        )
        
        return jsonify({
            'id': voto_id,
            'message': 'Voto inserito con successo'
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/docente/studenti', methods=['GET'])
@token_required
@role_required('docente')
def get_studenti():
    """Docente: visualizza tutti gli studenti"""
    try:
        studenti = db.get_studenti()
        return jsonify(studenti), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== ROUTE STUDENTE ====================

@app.route('/studente/voti', methods=['GET'])
@token_required
@role_required('studente')
def get_my_voti():
    """Studente: visualizza i propri voti"""
    try:
        # Cerca lo studente per username
        studente = db.get_studente_by_username(request.user['username'])
        
        if not studente:
            return jsonify({'error': 'Profilo studente non trovato'}), 404
        
        voti = db.get_voti_studente(studente['id'])
        return jsonify(voti), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/studente/profile', methods=['GET'])
@token_required
@role_required('studente')
def get_my_profile():
    """Studente: visualizza il proprio profilo"""
    try:
        studente = db.get_studente_by_username(request.user['username'])
        
        if not studente:
            return jsonify({'error': 'Profilo studente non trovato'}), 404
        
        return jsonify(studente), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== ADMIN (per setup) ====================

@app.route('/admin/studenti/sync', methods=['POST'])
@token_required
def sync_studenti():
    """Sincronizza gli studenti da Keycloak (endpoint di setup)"""
    try:
        # Questo è un endpoint semplificato per il setup
        # In produzione userai un webhook di Keycloak
        data = request.get_json()
        
        if not data or not all(k in data for k in ['username', 'nome', 'cognome', 'email']):
            return jsonify({'error': 'Dati non completi'}), 400
        
        # Verifica se lo studente esiste già
        existing = db.get_studente_by_username(data['username'])
        if existing:
            return jsonify({'message': 'Studente già esistente'}), 200
        
        # Crea il profilo studente
        student_id = db.insert_studente(
            username=data['username'],
            nome=data['nome'],
            cognome=data['cognome'],
            email=data['email']
        )
        
        return jsonify({
            'id': student_id,
            'message': 'Studente sincronizzato con successo'
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin/docenti/sync', methods=['POST'])
@token_required
def sync_docenti():
    """Sincronizza i docenti da Keycloak (endpoint di setup)"""
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ['username', 'nome', 'cognome', 'email']):
            return jsonify({'error': 'Dati non completi'}), 400
        
        # Verifica se il docente esiste già
        existing = db.get_docente_by_username(data['username'])
        if existing:
            return jsonify({'message': 'Docente già esistente'}), 200
        
        # Crea il profilo docente
        docente_id = db.insert_docente(
            username=data['username'],
            nome=data['nome'],
            cognome=data['cognome'],
            email=data['email']
        )
        
        return jsonify({
            'id': docente_id,
            'message': 'Docente sincronizzato con successo'
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint non trovato'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Errore interno del server'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

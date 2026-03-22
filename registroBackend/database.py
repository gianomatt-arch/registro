import pymysql
from contextlib import contextmanager
import os

class DatabaseWrapper:
    """Wrapper class per gestire la connessione MySQL"""
    
    def __init__(self, host, user, password, database):
        self.host = host
        self.user = user
        self.password = password
        self.database = database
    
    @contextmanager
    def get_connection(self):
        """Context manager per ottenere una connessione al database"""
        connection = None
        try:
            connection = pymysql.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database,
                charset='utf8mb4',
                cursorclass=pymysql.cursors.DictCursor
            )
            yield connection
        finally:
            if connection:
                connection.close()
    
    def init_database(self):
        """Inizializza il database con le tabelle necessarie"""
        with self.get_connection() as connection:
            with connection.cursor() as cursor:
                # Tabella studenti
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS studenti (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        username VARCHAR(255) UNIQUE NOT NULL,
                        nome VARCHAR(255) NOT NULL,
                        cognome VARCHAR(255) NOT NULL,
                        email VARCHAR(255),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Tabella docenti
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS docenti (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        username VARCHAR(255) UNIQUE NOT NULL,
                        nome VARCHAR(255) NOT NULL,
                        cognome VARCHAR(255) NOT NULL,
                        email VARCHAR(255),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Tabella voti
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS voti (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        id_studente INT NOT NULL,
                        materia VARCHAR(255) NOT NULL,
                        voto DECIMAL(5, 2) NOT NULL,
                        data_inserimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        id_docente INT,
                        FOREIGN KEY (id_studente) REFERENCES studenti(id),
                        FOREIGN KEY (id_docente) REFERENCES docenti(id)
                    )
                """)
                
                connection.commit()
                print("Database initialized successfully!")
    
    def get_studenti(self):
        """Restituisce tutti gli studenti"""
        with self.get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM studenti")
                return cursor.fetchall()
    
    def get_studente_by_username(self, username):
        """Restituisce uno studente per username"""
        with self.get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM studenti WHERE username = %s", (username,))
                return cursor.fetchone()
    
    def get_docenti(self):
        """Restituisce tutti i docenti"""
        with self.get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM docenti")
                return cursor.fetchall()
    
    def get_docente_by_username(self, username):
        """Restituisce un docente per username"""
        with self.get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM docenti WHERE username = %s", (username,))
                return cursor.fetchone()
    
    def insert_studente(self, username, nome, cognome, email):
        """Inserisce un nuovo studente"""
        with self.get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO studenti (username, nome, cognome, email) VALUES (%s, %s, %s, %s)",
                    (username, nome, cognome, email)
                )
                connection.commit()
                return cursor.lastrowid
    
    def insert_docente(self, username, nome, cognome, email):
        """Inserisce un nuovo docente"""
        with self.get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO docenti (username, nome, cognome, email) VALUES (%s, %s, %s, %s)",
                    (username, nome, cognome, email)
                )
                connection.commit()
                return cursor.lastrowid
    
    def insert_voto(self, id_studente, materia, voto, id_docente):
        """Inserisce un nuovo voto"""
        with self.get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO voti (id_studente, materia, voto, id_docente) VALUES (%s, %s, %s, %s)",
                    (id_studente, materia, voto, id_docente)
                )
                connection.commit()
                return cursor.lastrowid
    
    def get_voti_studente(self, id_studente):
        """Restituisce tutti i voti di uno studente"""
        with self.get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT v.*, s.nome, s.cognome, d.nome as docente_nome, d.cognome as docente_cognome
                    FROM voti v
                    JOIN studenti s ON v.id_studente = s.id
                    LEFT JOIN docenti d ON v.id_docente = d.id
                    WHERE v.id_studente = %s
                    ORDER BY v.data_inserimento DESC
                """, (id_studente,))
                return cursor.fetchall()
    
    def get_tutti_voti(self):
        """Restituisce tutti i voti con dettagli studente e docente"""
        with self.get_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT v.*, s.nome, s.cognome, s.username as studente_username, 
                           d.nome as docente_nome, d.cognome as docente_cognome
                    FROM voti v
                    JOIN studenti s ON v.id_studente = s.id
                    LEFT JOIN docenti d ON v.id_docente = d.id
                    ORDER BY v.data_inserimento DESC
                """)
                return cursor.fetchall()

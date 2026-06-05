from flask import Flask, render_template, jsonify, request
import json
import random
import sqlite3
from datetime import datetime

app = Flask(__name__)
QUESTIONS = []
DB_PATH = 'logs.db'


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS acessos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            prova TEXT NOT NULL,
            concluido INTEGER NOT NULL DEFAULT 0,
            acertos INTEGER,
            total INTEGER,
            nota REAL,
            questao_abandono INTEGER
        )
    ''')
    conn.commit()
    conn.close()


init_db()


def carregar_prova(caminho):
    global QUESTIONS
    with open(caminho, encoding='utf-8') as f:
        try:
            QUESTIONS = json.load(f)
        except json.JSONDecodeError:
            QUESTIONS = []


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/prova-operacional')
def prova_operacional():
    carregar_prova('provas/anatel-operacional.json')
    return render_template('prova.html', questions=QUESTIONS,
                           prova_nome='Técnica e Ética Operacional')


@app.route('/prova-legislacao')
def prova_legislacao():
    carregar_prova('provas/anatel-legislacao.json')
    return render_template('prova.html', questions=QUESTIONS,
                           prova_nome='Legislação de Telecomunicações')


@app.route('/prova-eletronica')
def prova_eletrica():
    carregar_prova('provas/anatel-eletrica.json')
    return render_template('prova.html', questions=QUESTIONS,
                           prova_nome='Eletrônica e Eletricidade')


@app.route('/api/questions')
def api_questions():
    if not QUESTIONS:
        return jsonify([])
    questions = [q for q in QUESTIONS if not q.get('anulada', False)]
    random.shuffle(questions)
    for q in questions:
        if q.get('embaralhar_alternativas', False):
            random.shuffle(q['alternativas'])
    return jsonify(questions[:20])


@app.route('/api/log-acesso', methods=['POST'])
def log_acesso():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'Dados inválidos'}), 400

    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        '''INSERT INTO acessos
           (timestamp, prova, concluido, acertos, total, nota, questao_abandono)
           VALUES (?, ?, ?, ?, ?, ?, ?)''',
        (
            datetime.utcnow().isoformat(),
            data.get('prova', ''),
            1 if data.get('concluido') else 0,
            data.get('acertos'),
            data.get('total'),
            data.get('nota'),
            data.get('questao_abandono'),
        )
    )
    conn.commit()
    conn.close()

    return jsonify({'ok': True})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5053, debug=True)

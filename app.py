from flask import Flask, render_template, jsonify
import json
import random

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/prova-operacional')
def prova_operacional():
    with open('provas/anatel-operacional.json', encoding='utf-8') as f:
        global QUESTIONS
        QUESTIONS = json.load(f)
    return render_template('prova.html', questions=QUESTIONS)

@app.route('/prova-legislacao')
def prova_legislacao():
    with open('provas/anatel-legislacao.json', encoding='utf-8') as f:
        global QUESTIONS
        QUESTIONS = json.load(f)
    return render_template('prova.html', questions=QUESTIONS)

@app.route('/prova-eletronica')
def prova_eletrica():
    with open('provas/anatel-eletrica.json', encoding='utf-8') as f:
        global QUESTIONS
        QUESTIONS = json.load(f)
    return render_template('prova.html', questions=QUESTIONS)

@app.route('/api/questions')
def api_questions():
    questions = [q for q in QUESTIONS if not q.get('anulada', False)]
    random.shuffle(questions)
    for q in questions:
        if q.get('embaralhar_alternativas', False):
            random.shuffle(q['alternativas'])
    return jsonify(questions)

if __name__ == '__main__':
    app.run(debug=True)

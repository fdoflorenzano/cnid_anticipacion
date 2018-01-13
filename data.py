"""
SCRIPT DE DATOS VISUALIZACIÓN DE CNID ANTICIPACIÓN.

Como input este archivo recibe los csv de datos de anticipación de CNID
como estan estructurados el 12/01/2018 en Google Sheets.
Los archivos deben llamarse hitos.csv y preguntas.csv para ser procesados
y producen el archivo data.json para alimentar estaticamente la visualización.

Copyright (c) 2018, Fernando Florenzano
"""

import json
import csv


def date_parser(date_string):
    """
    Date parser
    """
    parsed = date_string.split('-')
    if date_string == '' or date_string == '-':
        return -1
    elif date_string.lower() == 'hoy':
        return 2018
    elif len(parsed) == 1:
        return int(parsed[0])
    else:
        try:
            return (int(parsed[0]) + int(parsed[1])) / 2
        except ValueError:
            return (2018 + int(parsed[1])) / 2

print('PROCESSING HITOS')
with open('hitos.csv', newline='', encoding="utf-8") as csvfile:
    reader = csv.reader(csvfile)
    hitosJson = []
    rownum = 0
    for row in reader:
        if rownum == 0:
            header = row
        else:
            colnum = 0
            hito = {}
            for col in row:
                if header[colnum] in ['hito_consecuencia', 'tags', 'hito_precedente']:
                    hito[header[colnum]] = list(filter(lambda x: x != '', col.replace(" ", "").split(',')))
                elif header[colnum] in [ 'tipo', 'lugar', 'investigador']:
                    pass
                elif header[colnum] == 'fecha':
                    hito[header[colnum]] = date_parser(col)
                else:
                    hito[header[colnum]] = col
                colnum += 1
            hitosJson.append(hito)
        rownum += 1
    with open('hitos.json', 'w') as f:
        json.dump(hitosJson, f, ensure_ascii=False)

print('PROCESSING PREGUNTAS')
with open('preguntas.csv', newline='', encoding="utf-8") as csvfile:
    reader = csv.reader(csvfile)
    preguntasJson = []
    rownum = 0
    for row in reader:
        if rownum == 0:
            header = row
        else:
            colnum = 0
            pregunta = {}
            for col in row:
                pregunta[header[colnum]] = col
                colnum += 1
            preguntasJson.append(pregunta)
        rownum += 1
    with open('preguntas.json', 'w') as f:
        json.dump(preguntasJson, f, ensure_ascii=False)

# print('ADDING RANDOM INFO')
# # COMENTAR EN VERSION DEFINITIVA

def flat(arrays):
    """
    Flatten array of arrays
    """
    result = []
    for array in arrays:
        result.extend(array)
    return result
def transitive(hit):
    """
    Produce clausura transitiva de hitos relacionados a preguntas
    """
    dict_hit = {}
    for h in hit:
        if h['pregunta'] != '':
            h['pregunta'] = [ h['hito_id'][0] + h['pregunta']]
        else:
            h['pregunta'] = []
        dict_hit[h['hito_id']] = h
    for h in hit:
        if len(h['pregunta']) > 0 :
            ques = h['pregunta'][0]
            stack = [h]
            while len(stack) > 0:
                current = stack.pop()
                for c in current['hito_consecuencia']:
                    if ques not in dict_hit[c]['pregunta']:
                        dict_hit[c]['pregunta'].append(ques)
                        stack.append(dict_hit[c])
                for c in current['hito_precedente']:
                    if ques not in dict_hit[c]['pregunta']:
                        dict_hit[c]['pregunta'].append(ques)
                        stack.append(dict_hit[c])
    return dict_hit.values()
def question(pre):
    """
    Formateador de preguntas desde pregunta original
    """
    return {'text': pre['contenido_pregunta'], 'id': pre['mesa'] + pre['pregunta']}
def extract_links(hit):
    """
    Extractor de enlaces desde hitos
    """
    return list(map(lambda y: {
                    'source': hit['hito_id'], 
                    'target': y,
                    'questions': hit['pregunta']
                    }, hit['hito_consecuencia']))
def node(hit):
    """
    Formateador de nodos desde hitos original
    """
    return {
        'id': hit['hito_id'],
        'name': hit['hito_texto'],
        'date': hit['fecha'],
        'tags': hit['tags'],
        'question': hit['pregunta']
        }
def filter_data(data):
    """
    Filtrar nodos sin fechas validas y relaciones correspondientes
    """
    valid_nodes = {};
    present_questions = {};
    for node in data['nodes']:
        if node['date'] > 0:
            valid_nodes[node['id']] = True;
            for q in node['question']:
                present_questions[q] = True;
        else:
            valid_nodes[node['id']] = False
    
    data['nodes'] = list(filter(lambda x: valid_nodes[x['id']], data['nodes']));
    data['links'] = list(filter(lambda x: valid_nodes[x['source']] and valid_nodes[x['target']], data['links']))
    data['questions'] = list(filter(lambda x: x['id'] in present_questions, data['questions']));
    return data

print('ADDING UP INFO')
with open('hitos.json') as hitos_file:
    hitos = json.loads(hitos_file.read())
    with open('preguntas.json') as preguntas_file:
        preguntas = json.loads(preguntas_file.read())
        data = {}
        data['questions'] = list(map(lambda x: question(x), preguntas))
        hitos = transitive(hitos)
        data['links'] = flat(list(map(lambda x: extract_links(x), hitos)))
        data['nodes'] = list(map(lambda x: node(x), hitos))
        data = filter_data(data)
        with open('data.json', 'w') as f:
            json.dump(data, f, ensure_ascii=False)

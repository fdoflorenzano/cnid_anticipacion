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
import os

os.chdir('data')

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
with open('hitos.csv', newline='') as csvfile:
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
                if header[colnum] in ['hito_consecuencia', 'hito_precedente', 
                                      'dimension', 'subdimension', 
                                      'disciplinas', 'subdisciplina']:
                    hito[header[colnum]] = list(filter(lambda x: x != '', 
                                                       col.replace(" ", "").split(',')))
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
with open('preguntas.csv', newline='') as csvfile:
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

def csvToJson(file):
    with open(file+'.csv', newline='') as csvfile:
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
        with open(file + '.json', 'w') as f:
            json.dump(preguntasJson, f, ensure_ascii=False)

print('PROCESSING DISCIPLINAS Y DIMENSIONES')
csvToJson('disciplina')
csvToJson('subdisciplina')
csvToJson('dimension')
csvToJson('subdimension')

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

def DFS(hitos, hit_dict, attr):
    for h in hitos:
        for ques in h[attr]:
            stack = [h]
            while len(stack) > 0:
                current = stack.pop()
                for c in current['hito_consecuencia']:
                    if ques not in hit_dict[c][attr]:
                        hit_dict[c][attr].append(ques)
                        stack.append(hit_dict[c])
                for c in current['hito_precedente']:
                    if ques not in hit_dict[c][attr]:
                        hit_dict[c][attr].append(ques)
                        stack.append(hit_dict[c])
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
    for attr in ['pregunta', 'dimension', 'subdimension', 'disciplinas', 'subdisciplina']:
        DFS(hit, dict_hit, attr)
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
                    'question': hit['pregunta'],
                    'dimensions': hit['dimension'],
                    'subdimensions': hit['subdimension'],
                    'disciplines': hit['disciplinas'],
                    'subdisciplines': hit['subdisciplina'],
                    'tags':  hit['dimension'] +
                        hit['subdimension'] + hit['disciplinas'] + hit['subdisciplina']
                    }, hit['hito_consecuencia']))
def node(hit):
    """
    Formateador de nodos desde hitos original
    """
    return {
        'id': hit['hito_id'],
        'name': hit['hito_texto'],
        'date': hit['fecha'],
        'question': hit['pregunta'],
        'dimensions': hit['dimension'],
        'subdimensions': hit['subdimension'],
        'disciplines': hit['disciplinas'],
        'subdisciplines': hit['subdisciplina'],
        'tags':  hit['dimension'] +
                        hit['subdimension'] + hit['disciplinas'] + hit['subdisciplina']
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

def tagger(categories):
    """
    Get possible tags from categories
    """
    tags = {}
    for dim in categories['dimensions']:
        for subdimension in dim['subdimension']:
            tags[subdimension['id']] = subdimension
    for disc in categories['disciplines']:
        for subdiscipline in disc['subdisciplinas']:
            tags[subdiscipline['id']] = subdiscipline 
    return tags;

print('ADDING UP INFO')

with open('disciplina.json') as disciplinas_file:
    disciplinas = json.loads(disciplinas_file.read())
    with open('subdisciplina.json') as subdisciplinas_file:
        subdisciplinas = json.loads(subdisciplinas_file.read())
        for d in disciplinas:
            d['subdisciplinas'] = []
        for s in subdisciplinas:
            for d in disciplinas:
                if s['id_disciplina'] == d['id']:
                    d['subdisciplinas'].append(s)
                    break
        with open('disciplinas.json', 'w') as f:
            json.dump(disciplinas, f, ensure_ascii=False)

with open('dimension.json') as dimension_file:
    dimension = json.loads(dimension_file.read())
    with open('subdimension.json') as subdimension_file:
        subdimension = json.loads(subdimension_file.read())
        for d in dimension:
            d['subdimension'] = []
        for s in subdimension:
            for d in dimension:
                if s['dimension_id'] == d['id']:
                    s['id'] = d['id'] + '.' + s['id']
                    d['subdimension'].append(s)
                    break
        with open('dimensiones.json', 'w') as f:
            json.dump(dimension, f, ensure_ascii=False)

with open('dimensiones.json') as dimension_file:
    dimensiones = json.loads(dimension_file.read())
    with open('disciplinas.json') as disciplina_file:
        disciplinas = json.loads(disciplina_file.read())
        data = {
            "dimensions": dimensiones,
            "disciplines": disciplinas
        }
        with open('categories.json', 'w') as f:
            json.dump(data, f, ensure_ascii=False)

with open('hitos.json') as hitos_file:
    hitos = json.loads(hitos_file.read())
    with open('preguntas.json') as preguntas_file:
        preguntas = json.loads(preguntas_file.read())
        with open('categories.json') as category_file:
            categories = json.loads(category_file.read())
            data = {}
            data['dimensions'] = categories['dimensions']
            data['disciplines'] = categories['disciplines']
            data['tags'] = tagger(categories)
            data['questions'] = list(map(lambda x: question(x), preguntas))
            hitos = transitive(hitos)
            data['links'] = flat(list(map(lambda x: extract_links(x), hitos)))
            data['nodes'] = list(map(lambda x: node(x), hitos))
            data = filter_data(data)
            with open('data.json', 'w') as f:
                json.dump(data, f, ensure_ascii=False)

print('DONE')
# cnid_anticipacion

For adding new data, it's only necessary to modify the .csv files in the data folder. A script was developed to update the data of visualized on the platform once executed.

## Add new landmark

1. Modify the hitos.csv in data folder, adding a new element containing at least an id, text and a year, otherwise it won't be shown in the platform.
2. Run the python script data.py.

## Add new question

1. Modify the preguntas.csv in data folder, adding a new element containing at least an id and text, otherwise it won't be shown in the platform.
2. Run the python script data.py.

## Add new challenge

1. Modify the dimension.csv in data folder, adding a new element containing at least an id and name, otherwise it won't be shown in the platform.
2. Run the python script data.py.

## Add new challenge-dimension

1. Modify the subdimension.csv in data folder, adding a new element containing at least an id, it's parent id and name, otherwise it won't be shown in the platform.
2. Run the python script data.py.

## Add new theme

1. Modify the disciplina.csv in data folder, adding a new element containing at least an id, it's parent id and name, otherwise it won't be shown in the platform.
2. Run the python script data.py.

## Add new sub-theme

1. Modify the subdisciplina.csv in data folder, adding a new element containing at least an id, it's parent id and name, otherwise it won't be shown in the platform.
2. Run the python script data.py.

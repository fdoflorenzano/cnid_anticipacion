const parse = string => {
    const parsed = string.split(', ');
    if (parsed.length == 1 && '' == parsed[0]) {
        return [];
    }
    return parsed;
}
const merge = arrays => {
    let A = [];
    arrays.forEach(array => {
        A = A.concat(array);
    });
    return A;
};
const fromTo = (from, to) => ({
    'target': to,
    'source': from
});
const dateParser = date => {
    const parsed = date.split('-');    
    if(date == '' || date == '-') {
        return 2100
    }else if(date.toLowerCase() == 'hoy'){
        return 2018
    }else if(parsed.length == 1){
        return parseInt(parsed)
    }else{
        if(isNaN(parseInt(parsed[0]))){
            return (2018 + parseInt(parsed[1]))/2
        }else{
            return (parseInt(parsed[0]) + parseInt(parsed[1]))/2
        }
    }
    return date
};
const nodificador = n => ({
    'id': n.hito_id,
    'fecha': dateParser(n.fecha),
    'name': n.hito_texto
});
const linkeador = dataset => {
    return merge(dataset.map(n => parse(n.hito_consecuencia).map(c => fromTo(n.hito_id, c))));
};
const rankYears = nodes => {
    let ranking = {};
    nodes.forEach( node => {
        if(ranking[node.fecha]){
            ranking[node.fecha] += 1;
        } else {
            ranking[node.fecha] = 1;            
        }
    });
    return ranking;
}
const tipHTML = element => {
    return `<span class="fecha">${element.fecha}: </span><span>${element.name}</span>`;
}
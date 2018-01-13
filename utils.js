
const rankYears = nodes => {
    let ranking = {};
    nodes.forEach(node => {
        if (ranking[node.fecha]) {
            ranking[node.fecha] += 1;
        } else {
            ranking[node.fecha] = 1;
        }
    });
    return ranking;
}
const tipHTML = element => {
    if (element['date']) {
        return `<span class="fecha">${element.date}: </span><span>${element.name}</span>`;
    } else {
        return `<span>${element.text}: </span>`;        
    }
}
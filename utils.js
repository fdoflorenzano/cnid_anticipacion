const tipHTML = element => {
    if (element['date']) {
        return `<span>${element.name}</span>`;
    } else {
        return `<span>${element.text}: </span>`;
    }
}

const tipHTMLLong = (element, tags) => {
    let html = `
    <span class="long">${element.name}</span>
    <div class="separator-tip"></div>
    <p>${'LOREM LOREM LOREM LOREM LOREM LOREM LOREM LOREM LOREM LOREM LOREM LOREM'}</p>
    `;
    element.tags.forEach(tag => {
        if( tags.hasOwnProperty(tag)){
            html += `<span class="tag">${tags[tag].nombre}</span>`
        }
    });
    return html;
}

function arrayContainsArray(superset, subset) {
    return subset.every(function (value) {
        return (superset.indexOf(value) >= 0);
    });
}
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
const nodificador = n => ({
    'id': n.hito_id,
    'fecha': n.fecha,
    'name': n.hito_texto
});
const linkeador = dataset => {
    return merge(dataset.map(n => parse(n.hito_consecuencia).map(c => fromTo(n.hito_id, c))));
};
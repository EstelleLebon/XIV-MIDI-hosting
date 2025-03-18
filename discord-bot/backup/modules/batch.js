/**
 * Divise un tableau en lots de taille spécifiée.
 * @param {Array} array - Le tableau à diviser en lots.
 * @param {number} size - La taille de chaque lot.
 * @returns {Array[]} - Un tableau de lots.
 */
function batch(array, size) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

module.exports = batch;
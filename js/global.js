export function computeIfAbsent(map, key, value) {
    if (map.has(key)) {
        return map.get(key);
    } else {
        map.set(key, value);
    }
    return value;
}
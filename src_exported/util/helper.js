import { SetMultimap } from "./multimap.js";
export function partition(array, predicate) {
    return array.reduce(([pass, fail], item) => {
        if (predicate(item)) {
            pass.push(item);
        }
        else {
            fail.push(item);
        }
        return [pass, fail];
    }, [[], []]);
}
export function set_or_add(map, k1, k2, v) {
    if (map.has(k1)) {
        // @ts-ignore 2532
        map.get(k1).put(k2, v);
        return false;
    }
    map.set(k1, new SetMultimap([[k2, v]]));
    return true;
}
export function try_set(map, key, value) {
    if (map.has(key)) {
        return false;
    }
    map.set(key, value);
    return true;
}
export function get_or_set(map, key, default_value) {
    const existing_value = map.get(key);
    if (existing_value) {
        return existing_value;
    }
    map.set(key, default_value);
    return default_value;
}
export function extract(map, key) {
    const value = map.get(key);
    if (!value) {
        return undefined;
    }
    map.delete(key);
    return value;
}
export function has(array, value) {
    const index = array.indexOf(value);
    return index > -1;
}
//# sourceMappingURL=helper.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.traverseTree = void 0;
/**
 * Traverse a JSON object depth-first, in a `reduce` manner.
 *
 * @param input The root node to traverse
 * @param callback A function to call on each visited node
 * @param initialState Think of this as the last argument of `reduce`
 */
function traverseTree(input, callback, initialState) {
    const stack = [
        {
            path: [],
            type: typeOf(input),
            node: input,
            state: initialState
        }
    ];
    while (stack.length > 0) {
        const { state, ...item } = stack.shift();
        const newState = callback(state, item);
        if (!isCollection(item.node)) {
            continue;
        }
        const children = Object.entries(item.node).map(([key, child]) => ({
            key,
            node: child,
            type: typeOf(child),
            path: [...item.path, key],
            state: newState
        }));
        stack.unshift(...children);
    }
}
exports.traverseTree = traverseTree;
// Helpers --
function isObject(item) {
    return (typeof item === 'object' &&
        Object.prototype.toString.call(item) === '[object Object]');
}
function isCollection(item) {
    return Array.isArray(item) || isObject(item);
}
function typeOf(item) {
    if (Array.isArray(item)) {
        return 'array';
    }
    if (isObject(item)) {
        return 'object';
    }
    if (item === null) {
        return 'null';
    }
    return typeof item;
}

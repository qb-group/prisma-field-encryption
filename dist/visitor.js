"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitOutputTargetFields = exports.visitInputTargetFields = void 0;
const traverseTree_1 = require("./traverseTree");
const makeVisitor = (models, visitor) => function visitNode(state, { key, type, node, path }) {
    const model = models[state.currentModel];
    if (!model || !key) {
        return state;
    }
    if (type === 'string' && key in model.fields) {
        const targetField = {
            field: key,
            model: state.currentModel,
            fieldConfig: model.fields[key],
            path: path.join('.'),
            value: node
        };
        visitor(targetField);
        return state;
    }
    // Special case: {field}.set for updates
    if (type === 'object' &&
        key in model.fields &&
        typeof (node === null || node === void 0 ? void 0 : node.set) === 'string') {
        const value = node.set;
        const targetField = {
            field: key,
            model: state.currentModel,
            fieldConfig: model.fields[key],
            path: path.join('.') + '.set',
            value
        };
        visitor(targetField);
        return state;
    }
    if (['object', 'array'].includes(type) && key in model.connections) {
        // Follow the connection: from there on downwards, we're changing models.
        // Return a new object to break from existing references.
        return {
            currentModel: model.connections[key].modelName
        };
    }
    return state;
};
function visitInputTargetFields(params, models, visitor) {
    (0, traverseTree_1.traverseTree)(params.args, makeVisitor(models, visitor), {
        currentModel: params.model
    });
}
exports.visitInputTargetFields = visitInputTargetFields;
function visitOutputTargetFields(params, result, models, visitor) {
    (0, traverseTree_1.traverseTree)(result, makeVisitor(models, visitor), {
        currentModel: params.model
    });
}
exports.visitOutputTargetFields = visitOutputTargetFields;

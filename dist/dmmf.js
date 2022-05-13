"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAnnotation = exports.analyseDMMF = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("./errors");
const supportedCursorTypes = ['BigInt', 'Int', 'String'];
function analyseDMMF(dmmf = client_1.Prisma.dmmf) {
    // todo: Make it robust against changes in the DMMF structure
    // (can happen as it's an undocumented API)
    // - Prisma.dmmf does not exist
    // - Models are not located there, or empty -> warning
    // - Model objects don't conform to what we need (parse with zod)
    const allModels = dmmf.datamodel.models;
    return allModels.reduce((output, model) => {
        var _a, _b, _c;
        const idField = model.fields.find(field => field.isId && supportedCursorTypes.includes(String(field.type)));
        const uniqueField = model.fields.find(field => field.isUnique && supportedCursorTypes.includes(String(field.type)));
        const cursorField = model.fields.find(field => { var _a; return (_a = field.documentation) === null || _a === void 0 ? void 0 : _a.includes('@encryption:cursor'); });
        if (cursorField) {
            // Make sure custom cursor field is valid
            if (!cursorField.isUnique) {
                throw new Error(errors_1.errors.nonUniqueCursor(model.name, cursorField.name));
            }
            if (!supportedCursorTypes.includes(String(cursorField.type))) {
                throw new Error(errors_1.errors.unsupportedCursorType(model.name, cursorField.name, String(cursorField.type)));
            }
            if ((_a = cursorField.documentation) === null || _a === void 0 ? void 0 : _a.includes('@encrypted')) {
                throw new Error(errors_1.errors.encryptedCursor(model.name, cursorField.name));
            }
        }
        const modelDescriptor = {
            cursor: (_c = (_b = cursorField === null || cursorField === void 0 ? void 0 : cursorField.name) !== null && _b !== void 0 ? _b : idField === null || idField === void 0 ? void 0 : idField.name) !== null && _c !== void 0 ? _c : uniqueField === null || uniqueField === void 0 ? void 0 : uniqueField.name,
            fields: model.fields.reduce((fields, field) => {
                const fieldConfig = parseAnnotation(field.documentation, model.name, field.name);
                if (fieldConfig && field.type !== 'String') {
                    throw new Error(errors_1.errors.unsupportedFieldType(model, field));
                }
                return fieldConfig ? { ...fields, [field.name]: fieldConfig } : fields;
            }, {}),
            connections: model.fields.reduce((connections, field) => {
                const targetModel = allModels.find(model => field.type === model.name);
                if (!targetModel) {
                    return connections;
                }
                const connection = {
                    modelName: targetModel.name,
                    isList: field.isList
                };
                return {
                    ...connections,
                    [field.name]: connection
                };
            }, {})
        };
        if (Object.keys(modelDescriptor.fields).length > 0 &&
            !modelDescriptor.cursor) {
            console.warn(errors_1.warnings.noCursorFound(model.name));
        }
        return {
            ...output,
            [model.name]: modelDescriptor
        };
    }, {});
}
exports.analyseDMMF = analyseDMMF;
// --
const annotationRegex = /@encrypted(?<query>\?[\w=&]+)?/;
function parseAnnotation(annotation = '', model, field) {
    var _a, _b;
    const match = annotation.match(annotationRegex);
    if (!match) {
        return null;
    }
    const query = new URLSearchParams((_b = (_a = match.groups) === null || _a === void 0 ? void 0 : _a.query) !== null && _b !== void 0 ? _b : '');
    const readonly = query.get('readonly') !== null;
    const strict = query.get('strict') !== null;
    /* istanbul ignore next */
    if (process.env.NODE_ENV === 'development' &&
        strict &&
        readonly &&
        model &&
        field) {
        console.warn(errors_1.warnings.strictAndReadonlyAnnotation(model, field));
    }
    return {
        encrypt: !readonly,
        strictDecryption: !readonly && strict
    };
}
exports.parseAnnotation = parseAnnotation;

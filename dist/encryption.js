"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptOnRead = exports.encryptOnWrite = exports.configureKeys = void 0;
const cloak_1 = require("@47ng/cloak");
const object_path_1 = __importDefault(require("object-path"));
const errors_1 = require("./errors");
const visitor_1 = require("./visitor");
function configureKeys(config) {
    var _a, _b;
    const encryptionKey = config.encryptionKey || process.env.PRISMA_FIELD_ENCRYPTION_KEY;
    if (!encryptionKey) {
        throw new Error(errors_1.errors.noEncryptionKey);
    }
    const decryptionKeysFromEnv = ((_a = process.env.PRISMA_FIELD_DECRYPTION_KEYS) !== null && _a !== void 0 ? _a : '')
        .split(',')
        .filter(Boolean);
    const decryptionKeys = Array.from(new Set([
        encryptionKey,
        ...((_b = config.decryptionKeys) !== null && _b !== void 0 ? _b : decryptionKeysFromEnv)
    ]));
    const keychain = (0, cloak_1.makeKeychainSync)(decryptionKeys);
    return {
        encryptionKey: (0, cloak_1.parseKeySync)(encryptionKey),
        keychain
    };
}
exports.configureKeys = configureKeys;
// --
const writeOperations = [
    'create',
    'createMany',
    'update',
    'updateMany',
    'upsert'
];
const whereClauseRegExp = /\.where\./;
function encryptOnWrite(params, keys, models, operation) {
    if (!writeOperations.includes(params.action)) {
        return; // No input data to encrypt
    }
    const encryptionErrors = [];
    (0, visitor_1.visitInputTargetFields)(params, models, function encryptFieldValue({ fieldConfig, value: clearText, path, model, field }) {
        if (!fieldConfig.encrypt) {
            return;
        }
        if (whereClauseRegExp.test(path)) {
            console.warn(errors_1.warnings.whereClause(operation, path));
        }
        try {
            const cipherText = (0, cloak_1.encryptStringSync)(clearText, keys.encryptionKey);
            object_path_1.default.set(params.args, path, cipherText);
        }
        catch (error) {
            encryptionErrors.push(errors_1.errors.fieldEncryptionError(model, field, path, error));
        }
    });
    if (encryptionErrors.length > 0) {
        throw new Error(errors_1.errors.encryptionErrorReport(operation, encryptionErrors));
    }
}
exports.encryptOnWrite = encryptOnWrite;
function decryptOnRead(params, result, keys, models, operation) {
    var _a;
    // Analyse the query to see if there's anything to decrypt.
    const model = models[params.model];
    if (Object.keys(model.fields).length === 0 && !((_a = params.args) === null || _a === void 0 ? void 0 : _a.include)) {
        // The queried model doesn't have any encrypted field,
        // and there are no included connections.
        // We can safely skip decryption for the returned data.
        // todo: Walk the include/select tree for a better decision.
        return;
    }
    const decryptionErrors = [];
    const fatalDecryptionErrors = [];
    (0, visitor_1.visitOutputTargetFields)(params, result, models, function decryptFieldValue({ fieldConfig, value: cipherText, path, model, field }) {
        try {
            if (!cloak_1.cloakedStringRegex.test(cipherText)) {
                return;
            }
            const decryptionKey = (0, cloak_1.findKeyForMessage)(cipherText, keys.keychain);
            const clearText = (0, cloak_1.decryptStringSync)(cipherText, decryptionKey);
            object_path_1.default.set(result, path, clearText);
        }
        catch (error) {
            const message = errors_1.errors.fieldDecryptionError(model, field, path, error);
            if (fieldConfig.strictDecryption) {
                fatalDecryptionErrors.push(message);
            }
            else {
                decryptionErrors.push(message);
            }
        }
    });
    if (decryptionErrors.length > 0) {
        console.error(errors_1.errors.encryptionErrorReport(operation, decryptionErrors));
    }
    if (fatalDecryptionErrors.length > 0) {
        throw new Error(errors_1.errors.decryptionErrorReport(operation, fatalDecryptionErrors));
    }
}
exports.decryptOnRead = decryptOnRead;

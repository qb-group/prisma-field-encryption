"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fieldEncryptionMiddleware = void 0;
const dmmf_1 = require("./dmmf");
const encryption_1 = require("./encryption");
function fieldEncryptionMiddleware(config = {}) {
    // This will throw if the encryption key is missing
    // or if anything is invalid.
    const keys = (0, encryption_1.configureKeys)(config);
    const models = (0, dmmf_1.analyseDMMF)();
    return async function fieldEncryptionMiddleware(params, next) {
        if (!params.model) {
            // Unsupported operation
            return await next(params);
        }
        const operation = `${params.model}.${params.action}`;
        // Params are mutated in-place for modifications to occur.
        // See https://github.com/prisma/prisma/issues/9522
        const encryptedParams = (0, encryption_1.encryptOnWrite)(params, keys, models, operation);
        let result = await next(encryptedParams);
        (0, encryption_1.decryptOnRead)(encryptedParams, result, keys, models, operation);
        return result;
    };
}
exports.fieldEncryptionMiddleware = fieldEncryptionMiddleware;

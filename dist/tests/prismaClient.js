"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = exports.logger = exports.TEST_ENCRYPTION_KEY = void 0;
const client_1 = require("@prisma/client");
const index_1 = require("../index");
exports.TEST_ENCRYPTION_KEY = 'k1.aesgcm256.OsqVmAOZBB_WW3073q1wU4ag0ap0ETYAYMh041RuxuI=';
exports.logger = process.env.PRISMA_FIELD_ENCRYPTION_LOG === 'true'
    ? console
    : {
        log: (_args) => { },
        info: (_args) => { },
        dir: (_args) => { },
        error: console.error,
        warn: console.warn // and warnings
    };
exports.client = new client_1.PrismaClient();
exports.client.$use(async (params, next) => {
    const operation = `${params.model}.${params.action}`;
    exports.logger.dir({ '👀': `${operation}: before encryption`, params }, { depth: null });
    const result = await next(params);
    exports.logger.dir({ '👀': `${operation}: after decryption`, result }, { depth: null });
    return result;
});
exports.client.$use((0, index_1.fieldEncryptionMiddleware)({
    encryptionKey: exports.TEST_ENCRYPTION_KEY
}));
exports.client.$use(async (params, next) => {
    const operation = `${params.model}.${params.action}`;
    exports.logger.dir({ '👀': `${operation}: sent to database`, params }, { depth: null });
    const result = await next(params);
    exports.logger.dir({ '👀': `${operation}: received from database`, result }, { depth: null });
    return result;
});

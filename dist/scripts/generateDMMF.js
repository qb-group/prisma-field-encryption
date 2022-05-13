"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDMMF = void 0;
const client_1 = require(".prisma/client");
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
async function generateDMMF() {
    const outputPath = node_path_1.default.resolve(__dirname, '../../prisma/dmmf.json');
    await promises_1.default.writeFile(outputPath, JSON.stringify(client_1.Prisma.dmmf, null, 2));
}
exports.generateDMMF = generateDMMF;
if (require.main === module) {
    generateDMMF();
}

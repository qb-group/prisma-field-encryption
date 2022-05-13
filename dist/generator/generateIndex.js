"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateIndex = void 0;
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
async function generateIndex({ models, outputDir, modelNamePad, prismaClientModule }) {
    const modelImports = Object.keys(models).map(modelName => `import { migrate as migrate${modelName} } from './${modelName}'`);
    const contents = `// This file was generated by prisma-field-encryption.

import type { PrismaClient } from '${prismaClientModule}'
${modelImports.join('\n')}

export interface ProgressReport {
  model: string
  processed: number
  totalCount: number
  performance: number
}

export type ProgressReportCallback = (
  progress: ProgressReport
) => void | Promise<void>

export const defaultProgressReport: ProgressReportCallback = ({
  model,
  totalCount,
  processed,
  performance
}) => {
  const length = totalCount.toString().length
  const pct = Math.round((100 * processed) / totalCount)
    .toString()
    .padStart(3)
  console.info(
    \`\${model.padEnd(${modelNamePad})} \${pct}% processed \${processed
      .toString()
      .padStart(length)} / \${totalCount} (took \${performance.toFixed(2)}ms)\`
  )
}

// --

export type MigrationReport = {
${Object.keys(models)
        .map(modelName => `  ${modelName}: number`)
        .join(',\n')}
}

/**
 * Migrate models concurrently.
 *
 * Processed models:
${Object.keys(models)
        .map(modelName => ` * - ${modelName}`)
        .join('\n')}
 *
 * @returns a dictionary of the number of processed records per model.
 */
export async function migrate(
  client: PrismaClient,
  reportProgress: ProgressReportCallback = defaultProgressReport
): Promise<MigrationReport> {
  const [
${Object.keys(models)
        .map(modelName => `    processed${modelName}`)
        .join(',\n')}
  ] = await Promise.all([
${Object.keys(models)
        .map(modelName => `    migrate${modelName}(client, reportProgress)`)
        .join(',\n')}
  ])
  return {
${Object.keys(models)
        .map(modelName => `    ${modelName}: processed${modelName}`)
        .join(',\n')}
  }
}
`;
    const outputPath = node_path_1.default.join(outputDir, 'index.ts');
    return promises_1.default.writeFile(outputPath, contents);
}
exports.generateIndex = generateIndex;

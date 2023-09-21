import type { DMMFModels } from '../dmmf';
export interface GenerateIndexArgs {
    models: DMMFModels;
    prismaClientModule: string;
    outputDir: string;
    modelNamePad: number;
}
export declare function generateIndex({ models, outputDir, modelNamePad, prismaClientModule }: GenerateIndexArgs): Promise<void>;

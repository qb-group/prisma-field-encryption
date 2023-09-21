import type { DMMF, FieldConfiguration } from './types';
export interface ConnectionDescriptor {
    modelName: string;
    isList: boolean;
}
export interface DMMFModelDescriptor {
    /**
     * The field to use to iterate over rows
     * in encryption/decryption/key rotation migrations.
     *
     * See https://github.com/47ng/prisma-field-encryption#migrations
     */
    cursor?: string;
    fields: Record<string, FieldConfiguration>;
    connections: Record<string, ConnectionDescriptor>;
}
export declare type DMMFModels = Record<string, DMMFModelDescriptor>;
export declare function analyseDMMF(dmmf?: DMMF): DMMFModels;
export declare function parseAnnotation(annotation?: string, model?: string, field?: string): FieldConfiguration | null;

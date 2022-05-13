import type { Prisma } from '@prisma/client';
export declare const errors: {
    noEncryptionKey: string;
    unsupportedFieldType: (model: Prisma.DMMF.Model, field: Prisma.DMMF.Field) => string;
    fieldEncryptionError: (model: string, field: string, path: string, error: any) => string;
    encryptionErrorReport: (operation: string, errors: string[]) => string;
    fieldDecryptionError: (model: string, field: string, path: string, error: any) => string;
    decryptionErrorReport: (operation: string, errors: string[]) => string;
    nonUniqueCursor: (model: string, field: string) => string;
    unsupportedCursorType: (model: string, field: string, type: string) => string;
    encryptedCursor: (model: string, field: string) => string;
    noInteractiveTransactions: string;
};
export declare const warnings: {
    strictAndReadonlyAnnotation: (model: string, field: string) => string;
    noCursorFound: (model: string) => string;
    whereClause: (operation: string, path: string) => string;
};

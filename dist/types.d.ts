import { Prisma } from '@prisma/client';
export declare type MiddlewareParams = Prisma.MiddlewareParams;
export declare type Middleware = Prisma.Middleware;
export declare type DMMF = typeof Prisma.dmmf;
export interface Configuration {
    encryptionKey?: string;
    decryptionKeys?: string[];
}
export interface FieldConfiguration {
    encrypt: boolean;
    strictDecryption: boolean;
}
export interface FieldMatcher {
    regexp: RegExp;
    fieldConfig: FieldConfiguration;
}

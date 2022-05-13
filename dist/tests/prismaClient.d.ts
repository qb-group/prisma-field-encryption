import { PrismaClient } from '@prisma/client';
export declare const TEST_ENCRYPTION_KEY = "k1.aesgcm256.OsqVmAOZBB_WW3073q1wU4ag0ap0ETYAYMh041RuxuI=";
export declare const logger: Console | {
    log: (_args: any) => void;
    info: (_args: any) => void;
    dir: (_args: any) => void;
    error: {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
    warn: {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
};
export declare const client: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import(".prisma/client").Prisma.RejectOnNotFound | import(".prisma/client").Prisma.RejectPerOperation | undefined>;

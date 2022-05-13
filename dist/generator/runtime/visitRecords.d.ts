import type { PrismaClient } from '@prisma/client';
import { ProgressReportCallback } from './progressReport';
export declare type RecordVisitor<Cursor> = (client: PrismaClient, cursor: Cursor | undefined) => Promise<Cursor | undefined>;
export interface VisitRecordsArgs<Cursor> {
    modelName: string;
    client: PrismaClient;
    getTotalCount: () => Promise<number>;
    migrateRecord: RecordVisitor<Cursor>;
    reportProgress?: ProgressReportCallback;
}
export declare function visitRecords<Cursor>({ modelName, client, getTotalCount, migrateRecord, reportProgress }: VisitRecordsArgs<Cursor>): Promise<number>;

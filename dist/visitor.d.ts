import { DMMFModels } from './dmmf';
import type { FieldConfiguration, MiddlewareParams } from './types';
export interface TargetField {
    path: string;
    value: string;
    model: string;
    field: string;
    fieldConfig: FieldConfiguration;
}
export declare type TargetFieldVisitorFn = (targetField: TargetField) => void;
export declare function visitInputTargetFields(params: MiddlewareParams, models: DMMFModels, visitor: TargetFieldVisitorFn): void;
export declare function visitOutputTargetFields(params: MiddlewareParams, result: any, models: DMMFModels, visitor: TargetFieldVisitorFn): void;

import { CloakKeychain, ParsedCloakKey } from '@47ng/cloak';
import type { DMMFModels } from './dmmf';
import type { Configuration, MiddlewareParams } from './types';
export interface KeysConfiguration {
    encryptionKey: ParsedCloakKey;
    keychain: CloakKeychain;
}
export declare function configureKeys(config: Configuration): KeysConfiguration;
export declare function encryptOnWrite(params: MiddlewareParams, keys: KeysConfiguration, models: DMMFModels, operation: string): import(".prisma/client").Prisma.MiddlewareParams;
export declare function decryptOnRead(params: MiddlewareParams, result: any, keys: KeysConfiguration, models: DMMFModels, operation: string): void;

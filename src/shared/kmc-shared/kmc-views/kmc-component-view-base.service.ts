import { KalturaLogger } from '@kaltura-ng/kaltura-logger';

export abstract class KmcComponentViewBaseService<TArgs> {

    protected constructor(protected _logger: KalturaLogger) {
    }

    abstract isAvailable(args: TArgs): boolean;
}

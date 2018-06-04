import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

export abstract class KmcComponentViewBaseService<TArgs> {

    protected constructor(protected _logger: KalturaLogger) {
    }

    abstract isAvailable(args: TArgs): boolean;
}

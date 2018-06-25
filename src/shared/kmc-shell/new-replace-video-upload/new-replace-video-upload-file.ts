import { KalturaUploadFile } from 'app-shared/kmc-shared/upload-management/kaltura-upload-file';
import { ISubscription } from 'rxjs/Subscription';

export class NewReplaceVideoUploadFile extends KalturaUploadFile {
    public createMediaEntrySubscription: ISubscription;

    constructor(file: File,
                public assetParamsId: number,
                public transcodingProfileId: number,
                public entryId: string) {
        super(file);
    }
}



import { KalturaUploadFile } from '@kaltura-ng/kaltura-server-utils';
import { KalturaMediaType } from 'kaltura-typescript-client/types/KalturaMediaType';

export class NewEntryUploadFile extends KalturaUploadFile
{
    constructor(file: File, public mediaType: KalturaMediaType , public transcodingProfileId: number)
    {
        super(file)
    }
}
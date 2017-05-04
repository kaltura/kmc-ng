import {  Injectable } from '@angular/core';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types';
import { EntrySectionTypes } from './entry-sections-types';
import { FormSectionsManager } from '@kaltura-ng2/kaltura-ui/form-sections'


@Injectable()
export class EntrySectionsManager extends FormSectionsManager<KalturaMediaEntry,EntrySectionTypes>
{


}

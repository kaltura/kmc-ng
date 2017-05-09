import { Injectable } from '@angular/core';
import { EntrySectionTypes } from './entry-sections-types';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types';
import { FormSection } from '@kaltura-ng2/kaltura-ui/form-sections'


@Injectable()
export abstract class EntrySection extends FormSection<KalturaMediaEntry,EntrySectionTypes>
{


}

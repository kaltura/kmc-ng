import { Observable } from 'rxjs/Observable';
import { EntrySectionTypes } from './entry-sections-types';

// TODO [kmcng] remove file
export interface EntrySectionValidation
{
    isValid : boolean;
}

export interface EntryDataSection
{
    // getSectionType() : EntrySectionTypes;
    // validate() : Observable<EntrySectionValidation>;
    // sectionStatus$ : Observable<{ section :EntrySectionTypes, isValid : boolean}>;
    // canLeaveSection() : Observable<boolean>;
}
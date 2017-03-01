import { EntrySectionTypes } from "../entry-store/entry-store.service";
export interface Section
{
    label : string,
    enabled : boolean,
    hasError : boolean,
    sectionType : EntrySectionTypes
}
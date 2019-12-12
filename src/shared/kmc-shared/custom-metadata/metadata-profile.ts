export enum MetadataItemTypes
{
    Text,
    Date,
    Object,
    List,
    Container
}

export interface MetadataProfile
{
    id : number;
    name : string;
    isActive : boolean;
    items : MetadataItem[]

}

export interface MetadataItem
{
    documentations? : string;
    label? : string;
    isSearchable? : boolean;
    isHidden? : boolean;
    key? : string;
    isTimeControl? : boolean;
    description? : string;
    type : MetadataItemTypes;
    optionalValues : { value : string, text : string}[];
    name : string;
    id : string;
    isRequired : boolean;
    allowMultiple : boolean;
    children : MetadataItem[];
}

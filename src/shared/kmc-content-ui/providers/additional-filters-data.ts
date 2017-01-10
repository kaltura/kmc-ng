export enum AllModeTypes
{
    Null,
    Children
}
export interface AdditionalFiltersItem
{
    id? : string;
    name : string;
    value? : any;
    allMode? : AllModeTypes;
    children? : AdditionalFiltersItem[];
}

export const AdditionalFiltersData: AdditionalFiltersItem[] = [
    {
        id : 'mediaTypes',
        name: 'Media Types',
        allMode : AllModeTypes.Children,
        children: [
            {
                name: 'Video',
                value: 1,
            },
            {
                name: 'Image',
                value: 2,
            },
            {
                name: 'Audio',
                value: 5,
            }]
    },
    {
        name: 'Ingestion Statuses',
        children: [
            {
                name: 'Video',
                value: 2,
            },
            {
                name: 'No Media',
                value: 7,
            },
            {
                name: 'Pending',
                value: 4,
            }]
    }
];

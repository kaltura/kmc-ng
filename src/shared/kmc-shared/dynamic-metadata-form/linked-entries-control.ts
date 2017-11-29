import { DynamicFormControlBase, DynamicFormControlArgs } from '@kaltura-ng/kaltura-ui/dynamic-form';

export interface LinkedEntriesControlArgs extends DynamicFormControlArgs<any>
{
    allowMultipleEntries : boolean;
}

export class LinkedEntriesControl extends DynamicFormControlBase<any> {
    get controlType()
    {
        return 'LinkedEntries';
    }

    allowMultipleEntries : boolean;

    constructor(options: LinkedEntriesControlArgs) {
        super(options);
        this.allowMultipleEntries = options.allowMultipleEntries;
    }
}

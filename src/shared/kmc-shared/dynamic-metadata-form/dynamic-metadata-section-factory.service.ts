import { Injectable } from '@angular/core';
import { MetadataProfile, MetadataItemTypes, MetadataItem } from '../custom-metadata';
import { DynamicSectionControl, DynamicFormControlBase, TextAreaControl, DatePickerControl, ListControl, TextboxControl, DynamicDropdownControl } from '@kaltura-ng/kaltura-ui';
import { LinkedEntriesControl } from './linked-entries-control';
import { BrowserService } from 'app-shared/kmc-shell';

@Injectable()
export class DynamicMetadataSectionFactory {
    constructor(private _browserService: BrowserService) {
    }

    create(metadataProfile : MetadataProfile) : DynamicSectionControl
    {
        let result = null;

        if (metadataProfile) {

            result = new DynamicSectionControl({key : 'metadata', children : []});
            result.children = this._extractChildren(metadataProfile.items);

        }

        return result;
    }

    private _extractChildren(items : MetadataItem[]) : DynamicFormControlBase<any>[]
    {
        const result : DynamicFormControlBase<any>[] = [];

        if (items) {
            items.forEach(item => {
                switch (item.type) {
                    case MetadataItemTypes.Text:
                        if (item.allowMultiple) {
                            result.push(this._createTextbox(item));
                        }else
                        {
                            result.push(this._createTextArea(item));
                        }
                        break;
                    case MetadataItemTypes.Object:
                        result.push(this._createLinkedEntriesSelector(item));
                        break;
                    case MetadataItemTypes.Date:
                        result.push(this._createDatePicker(item));
                        break;
                    case MetadataItemTypes.List:
                        if (item.allowMultiple)
                        {
                            result.push(this._createList(item));
                        }else {
                            result.push(this._createDropdown(item));
                        }
                        break;
                    case MetadataItemTypes.Container:
                        result.push(this._createSection(item));
                        break;
                }
            });
        }

        return result;
    }


    private _createTextArea(item : MetadataItem) : DynamicFormControlBase<any>
    {
        return new TextAreaControl(
            {
                label: item.key,
                allowMultiple : item.allowMultiple,
                key: item.name,
                description: item.description,
                inputHelperConfig:{
                    title: item.key,
                    body: item.description
                }
            }
        );
    }

    private _createLinkedEntriesSelector(item : MetadataItem) : DynamicFormControlBase<any>
    {
        return new LinkedEntriesControl(
            {
                label: item.key,
                allowMultiple : false,
                allowMultipleEntries : item.allowMultiple,
                key: item.name,
                description: item.description,
                styleClass: 'kLinkedEntries',
                inputHelperConfig:{
                    title: item.key,
                    body: item.description
                }
            }
        );
    }

    private _createTextbox(item : MetadataItem) : DynamicFormControlBase<any>
    {
        return new TextboxControl(
            {
                label: item.key,
                allowMultiple : item.allowMultiple,
                key: item.name,
                description: item.description,
                inputHelperConfig:{
                    title: item.key,
                    body: item.description
                }
            }
        );
    }

    private _createSection(item : MetadataItem) : DynamicFormControlBase<any>
    {
        return new DynamicSectionControl(
            {
                label : item.key,
                allowMultiple : item.allowMultiple,
                key: item.name,
                children: this._extractChildren(item.children),
                description: item.description,
                inputHelperConfig:{
                    title: item.key,
                    body: item.description
                }
            }
        );
    }

    private _createList(item : MetadataItem) : DynamicFormControlBase<any>
    {
        return new ListControl(
            {
                values : item.optionalValues,
                allowMultiple : false,
                label: item.label,
                key: item.name,
                description: item.description,
                inputHelperConfig:{
                    title: item.key,
                    body: item.description
                }
            }
        );
    }

    private _createDropdown(item : MetadataItem) : DynamicFormControlBase<any>
    {
        return new DynamicDropdownControl(
            {
                values : item.optionalValues,
                allowMultiple : false,
                label: item.key,
                key: item.name,
                description: item.description,
                inputHelperConfig:{
                    title: item.key,
                    body: item.description
                }
            }
        );
    }

    private _createDatePicker(item : MetadataItem) : DynamicFormControlBase<any>
    {
        return new DatePickerControl(
            {
                label: item.key,
                allowMultiple : item.allowMultiple,
                key: item.name,
                showTime : item.isTimeControl,
                description: item.description,
                dateFormat: this._browserService.getCurrentDateFormat(true),
                inputHelperConfig:{
                    title: item.key,
                    body: item.description
                }
            }
        );
    }
}

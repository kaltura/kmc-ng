import { Component, Input, OnInit, ViewChild, OnDestroy,forwardRef } from '@angular/core';
import { FormGroup, AbstractControl }        from '@angular/forms';
import { DynamicFormControlBase } from '@kaltura-ng/kaltura-ui/dynamic-form';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { BaseEntryGetAction } from 'kaltura-typescript-client/types/BaseEntryGetAction';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/forkJoin';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { AppLocalization } from '@kaltura-ng/kaltura-common';


@Component({
    selector: 'k-linked-entries',
    templateUrl: './linked-entries.component.html',
    styleUrls : ['./linked-entries.component.scss'],
    providers : [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: LinkedEntries,
            multi: true
        }
    ]
})
export class LinkedEntries implements OnInit, OnDestroy, ControlValueAccessor {
    @Input() control: DynamicFormControlBase<any>;
    @Input() form: FormGroup;


    private _innerValue : string[] = [];
    public _blockerMessage : any;
    public _showLoader : boolean = false;
    public _selectedEntries: any[] = [];
    public _entries = [];

    public _isReady = false;
    private _formControl: AbstractControl;

    private onTouchedCallback: () => void = () => void{};
    private onChangeCallback: (_: any) => void = () => void{};

    constructor(
        private _kalturaClient : KalturaClient, private _appLocalization: AppLocalization) {
    }

    ngOnDestroy() {

    }

    private _updateEntries() {
        this._entries = [];

        if (this._innerValue && this._innerValue.length) {
            this._blockerMessage = null;
            this._showLoader = true;

            const requests = this._innerValue.map(entryId => new BaseEntryGetAction({entryId}));

            this._kalturaClient.multiRequest(requests)
                .subscribe(
                    responses => {
                        if (responses.hasErrors()) {
                            this._blockerMessage = new AreaBlockerMessage({
                                message: this._appLocalization.get('applications.content.entryDetails.errors.entriesLoadError'), buttons: [
                                    {
                                        label: this._appLocalization.get('applications.content.entryDetails.errors.retry'),
                                        action: () => {
                                            this._updateEntries();
                                        }
                                    }
                                ]
                            });
                        } else {
                            this._entries = responses.map((response) => ({
                                id: response.result.id,
                                name: response.result.name,
                                thumbnailUrl: response.result.thumbnailUrl
                            }));
                            this._showLoader = false;
                        }
                    }
                );
        }
    }

    ngOnInit() {

        this._isReady = true;
    }

    public _deleteEntry(entry)
    {
        this._selectedEntries = null;
        this._entries.splice(this._entries.indexOf(entry),1);
        this._propogateChanges();
    }

    //Set touched on blur
    onBlur() {
        this.onTouchedCallback();
    }

    //From ControlValueAccessor interface
    writeValue(value: any) {
        if (value !== this._innerValue) {
            this._innerValue = value || [];
            this._updateEntries();
        }
    }

    //From ControlValueAccessor interface
    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    //From ControlValueAccessor interface
    registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }

    private _propogateChanges() {
        this._innerValue = (this._entries || []).map(entry => entry.id);
        this.onChangeCallback(this._innerValue);
    }

    moveUpSelections() {
        if(this._selectedEntries && this._selectedEntries.length) {
            for(let i = 0; i < this._selectedEntries.length; i++) {
                let selectedItem = this._selectedEntries[i];
                let selectedItemIndex: number = this.findIndexInList(selectedItem, this._entries);

                if(selectedItemIndex != 0) {
                    let movedItem = this._entries[selectedItemIndex];
                    let temp = this._entries[selectedItemIndex-1];
                    this._entries[selectedItemIndex-1] = movedItem;
                    this._entries[selectedItemIndex] = temp;
                }
                else {
                    break;
                }
            }

            this._propogateChanges();
        }
    }

    moveTopSelections() {
        if(this._selectedEntries && this._selectedEntries.length) {
            for(let i = 0; i < this._selectedEntries.length; i++) {
                let selectedItem = this._selectedEntries[i];
                let selectedItemIndex: number = this.findIndexInList(selectedItem, this._entries);

                if(selectedItemIndex != 0) {
                    let movedItem = this._entries.splice(selectedItemIndex,1)[0];
                    this._entries.unshift(movedItem);
                }
                else {
                    break;
                }
            }

            this._propogateChanges();

        }
    }

    moveDownSelections() {
        if (this._selectedEntries && this._selectedEntries.length) {
            for (let i = this._selectedEntries.length - 1; i >= 0; i--) {
                let selectedItem = this._selectedEntries[i];
                let selectedItemIndex: number = this.findIndexInList(selectedItem, this._entries);

                if (selectedItemIndex != (this._entries.length - 1)) {
                    let movedItem = this._entries[selectedItemIndex];
                    let temp = this._entries[selectedItemIndex + 1];
                    this._entries[selectedItemIndex + 1] = movedItem;
                    this._entries[selectedItemIndex] = temp;
                }
                else {
                    break;
                }
            }

            this._propogateChanges();

        }
    }

    moveBottomSelections() {
        if(this._selectedEntries && this._selectedEntries.length) {
            for(let i = this._selectedEntries.length - 1; i >= 0; i--) {
                let selectedItem = this._selectedEntries[i];
                let selectedItemIndex: number = this.findIndexInList(selectedItem, this._entries);

                if(selectedItemIndex != (this._entries.length - 1)) {
                    let movedItem = this._entries.splice(selectedItemIndex,1)[0];
                    this._entries.push(movedItem);
                }
                else {
                    break;
                }
            }

            this._propogateChanges();

        }
    }

    deleteSelections() {
        if (this._selectedEntries && this._selectedEntries.length) {
            this._selectedEntries.forEach(selectedEntry => {
                const selectedEntryIndex = this._entries.findIndex(entry => entry === selectedEntry);

                if (selectedEntryIndex >= 0) {
                    this._entries.splice(selectedEntryIndex, 1);
                }
            });

            this._propogateChanges();

        }

    }

    findIndexInList(item: any, list: any): number {
        let index: number = -1;

        if(list) {
            for(let i = 0; i < list.length; i++) {
                if(list[i] == item) {
                    index = i;
                    break;
                }
            }
        }

        return index;
    }

}

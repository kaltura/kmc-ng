import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, AbstractControl }        from '@angular/forms';
import { DynamicFormControlBase } from '@kaltura-ng2/kaltura-ui/dynamic-form';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';

@Component({
    selector: 'k-linked-entries',
    templateUrl: './linked-entries.component.html',
    styleUrls : ['./linked-entries.component.scss']
})
export class LinkedEntries implements OnInit, OnDestroy {
    @Input() control: DynamicFormControlBase<any>;
    @Input() form: FormGroup;

    public _selectedEntries: any[] = [];
    public _entries = [];
    public _isReady = false;
    private _formControl: AbstractControl;


    ngOnDestroy() {

    }

    private _updateEntries()
    {
        this._entries = this._formControl.value;
    }

    ngOnInit() {
        this._formControl = this.form.controls[this.control.key];

        if (this._formControl) {
            this._isReady = true;

            this._formControl.valueChanges
                .cancelOnDestroy(this)
                .subscribe(
                    value => {
                        this._updateEntries();
                    }
                );

            this._updateEntries();
        }
    }
}

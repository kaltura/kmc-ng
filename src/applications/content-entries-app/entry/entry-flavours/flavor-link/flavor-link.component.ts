import { Component, Input, OnDestroy } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { KalturaValidators } from '@kaltura-ng/kaltura-ui/validators';
import { Flavor } from '../flavor';
import { KalturaStorageProfile } from 'kaltura-ngx-client/api/types/KalturaStorageProfile';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

@Component({
    selector: 'kFlavorLink',
    templateUrl: './flavor-link.component.html',
    styleUrls: ['./flavor-link.component.scss'],
    providers: [KalturaLogger.createLogger('FlavorLinkComponent')]
})
export class FlavorLinkComponent implements OnDestroy {
    @Input() flavor: Flavor;
    @Input() storageProfile: KalturaStorageProfile;
    @Input() parentPopupWidget: PopupWidgetComponent;

    public _form: FormGroup;
    public _filePathField: AbstractControl;

    constructor(private _appLocalization: AppLocalization,
                private _logger: KalturaLogger,
                private _fb: FormBuilder) {
        this._buildForm();
    }

    ngOnDestroy() {
    }

    private _buildForm(): void {
        this._form = this._fb.group({
            filePath: ['', [Validators.required, KalturaValidators.url]]
        });

        this._filePathField = this._form.controls['filePath'];
    }

    public _link(): void {
        if (this._form.valid) {

        } else {

        }
    }
}


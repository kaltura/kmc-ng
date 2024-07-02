import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {AreaBlockerMessage} from '@kaltura-ng/kaltura-ui';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui';
import {ManagedTasksProfile, MrStoreService} from '../../mr-store/mr-store.service';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {AppAnalytics, BrowserService, ButtonType} from 'app-shared/kmc-shell/providers';
import {tag} from '@kaltura-ng/kaltura-common';
import {AppAuthentication} from 'app-shared/kmc-shell';

@Component({
    selector: 'kNewRule',
    templateUrl: './new-rule.component.html',
    styleUrls: ['./new-rule.component.scss'],
    providers: [
        KalturaLogger.createLogger('NewRuleComponent')
    ]
})
export class NewRuleComponent implements OnInit {
    @Input() parentPopupWidget: PopupWidgetComponent;
    @Output() onProfileCreated = new EventEmitter<ManagedTasksProfile>();

    public _newProfileForm: FormGroup;

    public _blockerMessage: AreaBlockerMessage = null;

    public get _saveDisabled(): boolean {
        return this._newProfileForm.pristine || !this._newProfileForm.valid;
    }

    constructor(private _fb: FormBuilder,
                private _logger: KalturaLogger,
                private _analytics: AppAnalytics,
                private _profilesService: MrStoreService,
                private _appLocalization: AppLocalization) {
        this._buildForm();
    }

    ngOnInit() {
        this._prepare();
    }

    private _prepare(): void {
        this._logger.info(`prepare new rule`);
    }

    private _buildForm(): void {
        this._newProfileForm = this._fb.group({
            name: ['', Validators.required],
            description: ['']
        });
    }

    private _markFormFieldsAsTouched() {
        for (const controlName in this._newProfileForm.controls) {
            if (this._newProfileForm.controls.hasOwnProperty(controlName)) {
                this._newProfileForm.get(controlName).markAsTouched();
                this._newProfileForm.get(controlName).updateValueAndValidity();
            }
        }
        this._newProfileForm.updateValueAndValidity();
    }

    private _markFormFieldsAsPristine() {
        for (const controlName in this._newProfileForm.controls) {
            if (this._newProfileForm.controls.hasOwnProperty(controlName)) {
                this._newProfileForm.get(controlName).markAsPristine();
                this._newProfileForm.get(controlName).updateValueAndValidity();
            }
        }
        this._newProfileForm.updateValueAndValidity();
    }

    public _createProfile(): void {
        this._blockerMessage = null;
        this._logger.info(`send create rule to the server`);
        if (!this._newProfileForm.valid) {
            this._markFormFieldsAsTouched();
            this._logger.info(`abort action, rule has invalid data`);
            return;
        }

        this._markFormFieldsAsPristine();
        this._analytics.trackButtonClickEvent(ButtonType.Add, 'AM_add_new_rule', null, 'Automation_manager');

        const {name, description} = this._newProfileForm.value;
        const newProfile = {
            name,
            description,
            runningCadence: {
                cadence: 'advanced',
                advancedCadence: {
                    dateUnit: 'month',
                    numberOfUnits: 1,
                    dayNumber: 1
                }
            },
            audit: {
                auditApproval: false,
                reviewPeriod: 7
            },
        };

        this._profilesService.createProfile(newProfile)
            .pipe(tag('block-shell'))
            .subscribe(
                (profile: ManagedTasksProfile) => {
                    if (profile.objectType === 'KalturaAPIException') { // error handling
                        this.displayServerError(profile);
                        return;
                    }
                    this.onProfileCreated.emit(profile);
                    this.parentPopupWidget.close();
                },
                error => {
                    this.displayServerError(error);
                }
            );
    }

    private displayServerError = error => {
        this._blockerMessage = new AreaBlockerMessage({
            message: error.message || 'Error preforming operation',
            buttons: [
                {
                    label: this._appLocalization.get('app.common.close'),
                    action: () => {
                        this._logger.info(`dismiss dialog`);
                        this._blockerMessage = null;
                    }
                }
            ]
        });
    };

}

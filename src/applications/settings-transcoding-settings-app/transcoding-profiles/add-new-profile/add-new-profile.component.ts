import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AppEventsService } from 'app-shared/kmc-shared';
import { KalturaConversionProfileType } from 'kaltura-ngx-client/api/types/KalturaConversionProfileType';
import { KalturaStorageProfile } from 'kaltura-ngx-client/api/types/KalturaStorageProfile';
import { Observable } from 'rxjs/Observable';
import { StorageProfilesStore } from 'app-shared/kmc-shared/storage-profiles';
import { BaseEntryGetAction } from 'kaltura-ngx-client/api/types/BaseEntryGetAction';
import { KalturaAPIException, KalturaClient } from 'kaltura-ngx-client';
import { CreateNewTranscodingProfileEvent } from 'app-shared/kmc-shared/events/transcoding-profile-creation';
import { KalturaConversionProfile } from 'kaltura-ngx-client/api/types/KalturaConversionProfile';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui/area-blocker/area-blocker-message';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';

export interface NewTranscodingProfileFormData {
  name: string;
  description: string;
  defaultMetadataSettings: string;
  ingestFromRemoteStorage: { label: string, value: number };
}

@Component({
  selector: 'kAddNewTranscodingProfile',
  templateUrl: './add-new-profile.component.html',
  styleUrls: ['./add-new-profile.component.scss'],
  providers: [KalturaLogger.createLogger('AddNewProfileComponent')]
})
export class AddNewProfileComponent implements OnInit, OnDestroy {
  @Input() parentPopupWidget: PopupWidgetComponent;
  @Input() profileType: KalturaConversionProfileType;

  public _addNewProfileForm: FormGroup;
  public _nameField: AbstractControl;
  public _descriptionField: AbstractControl;
  public _defaultMetadataSettingsField: AbstractControl;
  public _ingestFromRemoteStorageField: AbstractControl;
  public _hideIngestFromRemoteStorage = false;
  public _remoteStorageProfilesOptions: { label: string, value: number }[] = [];
  public _dataLoading = false;
  public _blockerMessage: AreaBlockerMessage;

  constructor(private _formBuilder: FormBuilder,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization,
              private _storageProfilesStore: StorageProfilesStore,
              private _kalturaClient: KalturaClient,
              private _logger: KalturaLogger,
              private _appEvents: AppEventsService) {
    this._buildForm();
  }

  ngOnInit() {
    this._logger.info(`initiate add new profile view`);
    this._prepare();
  }

  ngOnDestroy() {

  }

  private _buildForm(): void {
    this._addNewProfileForm = this._formBuilder.group({
      name: ['', Validators.required],
      description: '',
      defaultMetadataSettings: '',
      ingestFromRemoteStorage: { label: this._appLocalization.get('applications.settings.transcoding.na'), value: null }
    });
    this._nameField = this._addNewProfileForm.controls['name'];
    this._descriptionField = this._addNewProfileForm.controls['description'];
    this._defaultMetadataSettingsField = this._addNewProfileForm.controls['defaultMetadataSettings'];
    this._ingestFromRemoteStorageField = this._addNewProfileForm.controls['ingestFromRemoteStorage'];
  }

  private _prepare(): void {
    this._hideIngestFromRemoteStorage = this.profileType && this.profileType === KalturaConversionProfileType.liveStream;
    if (!this._hideIngestFromRemoteStorage) {
      this._logger.info(`load remote storage profiles data`);
      this._dataLoading = true;
      this._loadRemoteStorageProfiles()
        .cancelOnDestroy(this)
        .map(profiles => profiles.map(profile => ({ label: profile.name, value: profile.id })))
        .subscribe(
          profiles => {
            this._logger.info(`handle success load remote storage profiles data`);
            this._dataLoading = false;
            this._remoteStorageProfilesOptions = profiles;
          },
          error => {
            this._logger.info(`handle failed load remote storage profiles data, show confirmation dialog`);
            this._blockerMessage = new AreaBlockerMessage({
              message: error.message || this._appLocalization.get('applications.settings.transcoding.errorLoadingRemoteStorageProfiles'),
              buttons: [
                {
                  label: this._appLocalization.get('app.common.retry'),
                  action: () => {
                    this._logger.info(`user selected retry, retry action`);
                    this._blockerMessage = null;
                    this._prepare();
                  }
                },
                {
                  label: this._appLocalization.get('app.common.cancel'),
                  action: () => {
                    this._logger.info(`user canceled, abort action and dismiss dialog`);
                    this._blockerMessage = null;
                    this.parentPopupWidget.close();
                  }
                }
              ]
            });
          });
    }
  }

  private _loadRemoteStorageProfiles(): Observable<KalturaStorageProfile[]> {
    const createEmptyRemoteStorageProfile = () => {
      const emptyProfile = new KalturaStorageProfile({ name: this._appLocalization.get('applications.settings.transcoding.na') });
      (<any>emptyProfile).id = null;
      return emptyProfile;
    };

    return this._storageProfilesStore.get()
      .map(({ items }) => [createEmptyRemoteStorageProfile(), ...items])
      .catch((error) => {
        if (error.code && error.code === 'SERVICE_FORBIDDEN') {
          return Observable.of([createEmptyRemoteStorageProfile()]);
        }
        return Observable.throw(error);
      });
  }

  private _validateEntryExists(entryId: string): Observable<boolean> {
    return this._kalturaClient.request(new BaseEntryGetAction({ entryId }))
      .map(Boolean)
      .catch(
        error => (error instanceof KalturaAPIException && error.code === 'ENTRY_ID_NOT_FOUND')
          ? Observable.of(false)
          : Observable.throw(error.message)
      );
  }

  private _proceedSave(profile: KalturaConversionProfile): void {
    this._logger.info(`publish 'CreateNewTranscodingProfileEvent' event`, { id: profile.id, name: profile.name });
    this._appEvents.publish(new CreateNewTranscodingProfileEvent({ profile }));
    this.parentPopupWidget.close();
  }

  private _mapFormDataToProfile(formData: NewTranscodingProfileFormData): KalturaConversionProfile {

    const newConversionProfile = new KalturaConversionProfile({
      type: this.profileType,
      name: formData.name
    });
    newConversionProfile.description = formData.description || '';
    if (formData.defaultMetadataSettings) {
      newConversionProfile.defaultEntryId = formData.defaultMetadataSettings;
    }

    if (formData.ingestFromRemoteStorage.value) {
      newConversionProfile.storageProfileId = formData.ingestFromRemoteStorage.value;
    }

    return newConversionProfile;
  }

  public _goNext(): void {
    this._logger.info(`handle save new profile action by user`);
    if (this._addNewProfileForm.valid) {
      const formData = this._addNewProfileForm.value;
      const entryId = (formData.defaultMetadataSettings || '').trim();
      if (entryId) {
        this._logger.info(`entryId is provided validate it exists`, { entryId });
        this._dataLoading = true;
        this._validateEntryExists(entryId)
          .cancelOnDestroy(this)
          .subscribe(
            exists => {
              this._dataLoading = false;
              if (exists) {
                this._logger.info(`entry exists, proceed action`);
                this._proceedSave(this._mapFormDataToProfile(formData));
              } else {
                this._logger.info(`entry doesn't exist, abort action, show alert`);
                this._browserService.alert({
                  message: this._appLocalization.get('applications.settings.transcoding.entryNotFound', [entryId]),
                  accept: () => {
                    this._logger.info(`user dismissed alert`);
                  }
                });
              }
            },
            error => {
              this._logger.warn(`handle failed entry validation, abort action, show alert`);
              this._dataLoading = false;
              this._browserService.alert({
                message: error.message,
                accept: () => {
                  this._logger.warn(`user dismissed alert`);
                }
              });
            }
          );
      } else {
        this._proceedSave(this._mapFormDataToProfile(formData));
      }
    } else {
      this._logger.info(`form data is not valid, abort action`);
    }
  }
}


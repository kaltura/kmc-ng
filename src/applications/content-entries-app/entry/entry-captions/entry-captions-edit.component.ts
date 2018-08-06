import { AfterContentInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';

import { ISubscription } from 'rxjs/Subscription';

import { KalturaCaptionAsset } from 'kaltura-ngx-client';
import { KalturaCaptionType } from 'kaltura-ngx-client';
import { UploadManagement } from '@kaltura-ng/kaltura-common';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { BrowserService } from 'app-shared/kmc-shell';
import { FileDialogComponent } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui';
import { NewEntryCaptionFile } from './new-entry-caption-file';
import { globalConfig } from 'config/global';
import { LanguageOptionsService } from 'app-shared/kmc-shared/language-options';
import { KalturaValidators } from '@kaltura-ng/kaltura-ui';

@Component({
    selector: 'kEntryCaptionsEdit',
    templateUrl: './entry-captions-edit.component.html',
    styleUrls: ['./entry-captions-edit.component.scss'],
    providers: [LanguageOptionsService]
})
export class EntryCaptionsEdit implements  OnInit, AfterContentInit, OnDestroy{

	@Input() currentCaption: KalturaCaptionAsset;
	@Input() parentPopupWidget: PopupWidgetComponent;

	@ViewChild('fileDialog') private fileDialog: FileDialogComponent;

	public captionsEditForm: FormGroup;
	public _languages = [];
	public _captionFormats = [];
	public _newCaption = false;
	public _uploadFileName = "";
	public _validationErrorMsg: string = "";

	private _parentPopupStateChangeSubscribe : ISubscription;
	private _confirmClose: boolean = true;
	private fileToUpload: File;

  constructor(private _appLocalization: AppLocalization,
              private _uploadManagement: UploadManagement,
              private _fb: FormBuilder,
              private _languageOptions: LanguageOptionsService,
              private _browserService: BrowserService) {

  }

    ngOnInit() {
        this._languages = this._languageOptions.get();

	    // set caption formats array. Note that WEBVTT cannot be set on client side - only on backend so is doesn't appear in the list
        this._captionFormats = [
            {
                label: 'SRT',
                value: KalturaCaptionType.srt
            },
            {
                label: 'DFXP',
                value: KalturaCaptionType.dfxp
            },
            {
                label: 'VTT',
                value: KalturaCaptionType.webvtt
            }
        ];
	    this._newCaption = this.currentCaption.id === null;
	    this._createForm();
    }

	ngAfterContentInit(){
		if (this.parentPopupWidget) {
			this._parentPopupStateChangeSubscribe = this.parentPopupWidget.state$
				.subscribe(event => {
					if (event.state === PopupWidgetStates.Open) {
						this._resetForm();
						this._confirmClose = true;
						this._uploadFileName = "";
						this._validationErrorMsg = "";
						this.fileToUpload = null;
						this.captionsEditForm.get("label").setValue(this.currentCaption.label);
						this.captionsEditForm.get("language").setValue(this._languageOptions.getValueByLabel(this.currentCaption.language));
						this.captionsEditForm.get("format").setValue(this.currentCaption.format);
					}
					if (event.state === PopupWidgetStates.BeforeClose) {
						if (event.context && event.context.allowClose){
							if (this.captionsEditForm.dirty && this._confirmClose){
								event.context.allowClose = false;
								this._browserService.confirm(
									{
										header: this._appLocalization.get('applications.content.entryDetails.captions.cancelEdit'),
										message: this._appLocalization.get('applications.content.entryDetails.captions.discard'),
										accept: () => {
											this._confirmClose = false;
											this.parentPopupWidget.close();
										}
									}
								);
							}
						}
					}
				});
		}
	}

	ngOnDestroy(){
		this._parentPopupStateChangeSubscribe.unsubscribe();
	}

  private _validateFileSize(file: File): boolean {
    const maxFileSize = globalConfig.kalturaServer.maxUploadFileSize;
    const fileSize = file.size / 1024 / 1024; // convert to Mb

    return this._uploadManagement.supportChunkUpload(new NewEntryCaptionFile(null)) || fileSize < maxFileSize;
  }

	public _saveAndClose(): void{
		if (this.captionsEditForm.get("label").dirty) {
			this.currentCaption.label = this.captionsEditForm.get("label").value;
			if (this.captionsEditForm.get("label").value === ""){
				this._browserService.alert(
					{
						header: this._appLocalization.get('app.common.attention'),
						message: this._appLocalization.get('applications.content.entryDetails.captions.noLabel')
					}
				);
			}
		}
		if (this.captionsEditForm.get("language").dirty) {
            this.currentCaption.language = this._languageOptions.getLabelByValue(this.captionsEditForm.get("language").value);
		}
		if (this.captionsEditForm.get("format").dirty) {
			this.currentCaption.format = this.captionsEditForm.get("format").value;
		}
		this._confirmClose = false;

		let context = {}; // pass selected file or file URL to the parent component via the popup widget close context
		if (this._newCaption){
			if (this._uploadFileName !== '' && this.fileToUpload){ // a file was selected for upload
				context['newCaptionFile'] = this.fileToUpload;
			}
			if (this.captionsEditForm.get("captionUrl").value !== ""){ // a file URL was enetered
				context['newCaptionUrl'] = this.captionsEditForm.get("captionUrl").value;
			}
		}
		this.parentPopupWidget.close(context);
	}

	public _uploadCaption(){
		this.fileDialog.open();
	}

  public _onFileSelected(selectedFiles: FileList) {
    if (selectedFiles && selectedFiles.length) {
      const file = selectedFiles[0];
      if (this._validateFileSize(file)) {
        this.fileToUpload = file;
        this._uploadFileName = this.fileToUpload.name;
      } else {
        this._browserService.alert({
          header: this._appLocalization.get('app.common.attention'),
          message: this._appLocalization.get('applications.upload.validation.fileSizeExceeded')
        });
      }
    }
  }

	public _resetUpload(uploadMethod: string){
		this.captionsEditForm.get('captionUrl').reset();
		this._uploadFileName = "";
		this._validationErrorMsg = "";
	}

	public _validate(formControlName: string){
		this._validationErrorMsg = "";
		const control: AbstractControl = this.captionsEditForm.get(formControlName);
		if (control && (control.touched || control.dirty) && control.value.length && control.errors){
			if (control.errors.url){
				this._validationErrorMsg = this._appLocalization.get('applications.content.entryDetails.captions.invalidUrl');
			}
		}
	}

	public _getCaptionFormatLabel(format: KalturaCaptionType): string{
		let label = "";
		this._captionFormats.forEach( obj => {
			if (format && obj.value.toString() === format.toString()){
				label = obj.label;
			}
		});
		return label;
	}

	public _allowSave():boolean{
		let allow = true;
		if (this.captionsEditForm.get('uploadMethod').value === 'fromUrl'){
			allow = this._validationErrorMsg === "" && this.captionsEditForm.get('captionUrl').value && this.captionsEditForm.get('captionUrl').value.length;
		}else{
			allow = this._uploadFileName.length > 0;
		}
		return allow;
	}
	private _createForm(): void{
		this.captionsEditForm = this._fb.group({
			label: '',
			language: '',
			format: '',
			uploadMethod: 'upload',
			captionUrl: ['', KalturaValidators.url]
		});
	}

	private _resetForm(): void{
		this.captionsEditForm.reset({
			label: '',
			language: '',
			format: '',
			uploadMethod: 'upload',
			captionUrl: ''
		});
	}
}


import { AfterContentInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';

import { ISubscription } from 'rxjs/Subscription';

import { KalturaCaptionAsset } from 'kaltura-ngx-client/api/types/KalturaCaptionAsset';
import { KalturaCaptionType } from 'kaltura-ngx-client/api/types/KalturaCaptionType';
import { AppLocalization, UploadManagement } from '@kaltura-ng/kaltura-common';
import { BrowserService } from 'app-shared/kmc-shell';
import { FileDialogComponent } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { NewEntryCaptionFile } from './new-entry-caption-file';
import { globalConfig } from 'config/global';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { LanguageOptionsService } from 'app-shared/kmc-shared/language-options';

function urlValidator(control: AbstractControl): {[key: string]: boolean} | null {
	let v: string = control.value;
	return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(v) ? null : {'url': true};
};

@Component({
    selector: 'kEntryCaptionsEdit',
    templateUrl: './entry-captions-edit.component.html',
    styleUrls: ['./entry-captions-edit.component.scss'],
    providers: [
        LanguageOptionsService,
        KalturaLogger.createLogger('EntryCaptionsEdit')
    ]
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
              private _browserService: BrowserService,
              private _logger: KalturaLogger) {

  }

    ngOnInit() {
        this._languages = this._languageOptions.get();

	    // set caption formats array. Note that WEBVTT cannot be set on client side - only on backend so is doesn't appear in the list
	    this._captionFormats = [
		    {label: "SRT", value: KalturaCaptionType.srt},
		    {label: "DFXP", value: KalturaCaptionType.dfxp}
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
						this.captionsEditForm.get("language").setValue(this.currentCaption.language);
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
			this.currentCaption.language = this.captionsEditForm.get("language").value;
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

        this._logger.info(`handle save action by user`, { context });

		this.parentPopupWidget.close(context);
	}

	public _uploadCaption(){
      this._logger.info(`handle upload caption action by user, open file select`);
		this.fileDialog.open();
	}

  public _onFileSelected(selectedFiles: FileList) {
      this._logger.info(`handle file selected action`, { file: selectedFiles[0] });
    if (selectedFiles && selectedFiles.length) {
      const file = selectedFiles[0];
      if (this._validateFileSize(file)) {
        this.fileToUpload = file;
        this._uploadFileName = this.fileToUpload.name;
      } else {
          this._logger.info(`file size exceeded, abort action`);
        this._browserService.alert({
          header: this._appLocalization.get('app.common.attention'),
          message: this._appLocalization.get('applications.upload.validation.fileSizeExceeded')
        });
      }
    } else {
        this._logger.info(`no file was selected, abort action`);
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
			captionUrl: ['', urlValidator]
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


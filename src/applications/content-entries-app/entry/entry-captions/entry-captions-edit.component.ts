import { Component, Input, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl, ValidatorFn } from '@angular/forms';

import { ISubscription } from 'rxjs/Subscription';

import { KalturaCaptionAsset, KalturaLanguage, KalturaCaptionType } from '@kaltura-ng2/kaltura-api/types';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { FileDialogComponent } from '@kaltura-ng2/kaltura-ui';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng2/kaltura-ui/popup-widget/popup-widget.component';

function urlValidator(control: AbstractControl): {[key: string]: boolean} | null {
	let v: string = control.value;
	return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(v) ? null : {'url': true};
};

@Component({
    selector: 'kEntryCaptionsEdit',
    templateUrl: './entry-captions-edit.component.html',
    styleUrls: ['./entry-captions-edit.component.scss']
})
export class EntryCaptionsEdit implements  AfterViewInit, OnDestroy{

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

    constructor(private _appLocalization: AppLocalization, private _fb: FormBuilder) {
	    // load all supported languages
	    this._languages = [];
	    for (let lang in KalturaLanguage){
		    this._languages.push({label: KalturaLanguage[lang].toString(), value: lang.toLowerCase()}); //TODO [KMCNG] - update language logic after KAPI changes
	    }
	    this._captionFormats = [
	    	{label: "SRT", value: KalturaCaptionType.Srt},
		    {label: "DFXP", value: KalturaCaptionType.Dfxp},
		    {label: "WEBVTT", value: KalturaCaptionType.Webvtt}
	    ];
	    this._createForm();
    }

	ngAfterViewInit(){
		if (this.parentPopupWidget) {
			this._parentPopupStateChangeSubscribe = this.parentPopupWidget.state$
				.subscribe(event => {
					if (event.state === PopupWidgetStates.Open) {
						this._resetForm();
						this._confirmClose = true;
						this._uploadFileName = "";
						this._validationErrorMsg = "";
						this.fileToUpload = null;
						this._newCaption = this.currentCaption.id === null;
						this.captionsEditForm.get("label").setValue(this.currentCaption.label);
						this.captionsEditForm.get("language").setValue(this.currentCaption.languageCode); //TODO [KMCNG] - update language logic after KAPI changes
						this.captionsEditForm.get("format").setValue(this.currentCaption.format);
					}
					if (event.state === PopupWidgetStates.Close) {
						if (this.captionsEditForm.dirty && this._confirmClose){
							alert("Closing without saving data!");
						}

					}
				});
		}
	}

	ngOnDestroy(){
		this._parentPopupStateChangeSubscribe.unsubscribe();
	}

	public _saveAndClose(): void{
		if (this.captionsEditForm.dirty){
			this.currentCaption.label = this.captionsEditForm.get("label").value;
			//TODO [KMCNG] - update language logic after KAPI changes
			//this.currentCaption.language = this.captionsEditForm.get("language").value.toString();
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
			this.fileToUpload = selectedFiles[0];
			this._uploadFileName = this.fileToUpload.name;
		}
	}

	public _resetUpload(){
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


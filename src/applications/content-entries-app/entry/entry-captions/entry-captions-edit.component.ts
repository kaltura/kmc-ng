import { Component, Input, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

import { ISubscription } from 'rxjs/Subscription';

import { KalturaCaptionAsset, KalturaLanguage, KalturaCaptionType } from '@kaltura-ng2/kaltura-api/types';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng2/kaltura-ui/popup-widget/popup-widget.component';

@Component({
    selector: 'kEntryCaptionsEdit',
    templateUrl: './entry-captions-edit.component.html',
    styleUrls: ['./entry-captions-edit.component.scss']
})
export class EntryCaptionsEdit implements  AfterViewInit, OnDestroy{

	@Input() currentCaption: KalturaCaptionAsset;
	@Input() parentPopupWidget: PopupWidgetComponent;

	public captionsEditForm: FormGroup;
	public _languages = [];
	public _captionFormats = [];

	private _parentPopupStateChangeSubscribe : ISubscription;
	private _confirmClose: boolean = true;

    constructor(private _appLocalization: AppLocalization, private _fb: FormBuilder) {
	    // load all supported languages
	    this._languages = [];
	    for (let lang in KalturaLanguage){
		    this._languages.push({label: KalturaLanguage[lang].toString(), value: lang.toLowerCase()});
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
					if (event === PopupWidgetStates.Open) {
						this._resetForm();
						this._confirmClose = true;
						this.captionsEditForm.get("label").setValue(this.currentCaption.label);
						this.captionsEditForm.get("language").setValue(this.currentCaption.languageCode);
						this.captionsEditForm.get("format").setValue(this.currentCaption.format);
					}
					if (event === PopupWidgetStates.Close) {
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
			this.currentCaption.language = this.captionsEditForm.get("language").value.toString();
			this.currentCaption.format = this.captionsEditForm.get("format").value;
		}
		this._confirmClose = false;
		this.parentPopupWidget.close();
	}


	private _createForm(): void{
		this.captionsEditForm = this._fb.group({
			label: '',
			language: '',
			format: ''
		});
	}

	private _resetForm(): void{
		this.captionsEditForm.reset({
			label: '',
			language: '',
			format: ''
		});
	}

}


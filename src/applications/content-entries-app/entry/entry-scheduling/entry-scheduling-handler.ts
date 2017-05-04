import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { KalturaUtils } from 'kaltura-typescript-client/utils/kaltura-utils';
import { KalturaMultiRequest } from 'kaltura-typescript-client';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';

import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import { EntrySection } from '../../entry-store/entry-section-handler';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';
import { EntrySectionsManager } from '../../entry-store/entry-sections-manager';

function datesValidation(checkRequired: boolean = false): ValidatorFn {
	return (c: AbstractControl): {[key: string]: boolean} | null => {
		const startDate = c.get('startDate').value;
		const endDate = c.get('endDate').value;
		const scheduling = c.get('scheduling').value;
		const enableEndDate = c.get('enableEndDate').value;
		if (checkRequired && scheduling === "scheduled"){
			if (!startDate) {
				return { 'noStartDate': true };
			}
			if (enableEndDate && !endDate){
				return { 'noEndDate': true };
			}
		}

		if (startDate && endDate && startDate > endDate){
			return { 'endDateBeforeStartDate': true };
		}

		return null;
	}
}

@Injectable()
export class EntrySchedulingHandler extends EntrySection
{
	public schedulingForm: FormGroup;
	public _timeZone = "";

    constructor(manager : EntrySectionsManager,
				private _appLocalization: AppLocalization,
				private _fb: FormBuilder)
    {
        super(manager);
	    this.createForm();
	    this.getTimeZone();
    }

	protected _activate(firstLoad : boolean): void {
    	if (firstLoad) {
			this._resetForm();
		}
		this.setValidators(false);
	}

	protected _onDataSaving(data: KalturaMediaEntry, request: KalturaMultiRequest)
	{
		const startDate = this.schedulingForm.get('startDate').value;
		const endDate = this.schedulingForm.get('endDate').value;
		const scheduling = this.schedulingForm.get('scheduling').value;
		const enableEndDate = this.schedulingForm.get('enableEndDate').value;

		if (scheduling === "scheduled"){
			if (startDate) {
				data.startDate = KalturaUtils.toServerDate(startDate);
			}
			if (enableEndDate && endDate){
				data.endDate = KalturaUtils.toServerDate(endDate);
			}else{
				// TODO [KMC] - delete endDate
			}
		}else{
			// TODO [KMC] - delete existing startDate and endDate
		}
	}

	private _resetForm(){
		let scheduleSettings = "anytime";
		let startDate = null;
		let endDate = null;
		let enableEndDate = false;
		if (this.data && this.data.startDate){
			scheduleSettings = "scheduled";
			this.schedulingForm.get('startDate').enable();
			startDate = KalturaUtils.fromServerDate(this.data.startDate);
			if (this.data.endDate){
				this.schedulingForm.get('endDate').enable();
				enableEndDate = true;
				endDate = KalturaUtils.fromServerDate(this.data.endDate);
			}
		}
		this.schedulingForm.reset({
			scheduling: scheduleSettings,
			startDate: startDate,
			endDate: endDate,
			enableEndDate: enableEndDate
		});
	}

    private createForm(): void{
    	this.schedulingForm = this._fb.group({
		    scheduling: 'anytime',
		    startDate: {value: '', disabled: true},
		    endDate: {value: '', disabled: true},
		    enableEndDate: false
	    }, { validator: datesValidation(false) });
	    this.schedulingForm.get('scheduling').valueChanges
		    .cancelOnDestroy(this)
		    .subscribe(
	    	value => {
	    		if (value === "anytime"){
				    this.schedulingForm.get('startDate').disable();
				    this.schedulingForm.get('endDate').disable();
				    this.schedulingForm.get('enableEndDate').disable();
			    }else{
				    this.schedulingForm.get('startDate').enable();
				    this.schedulingForm.get('enableEndDate').enable();
				    if (this.schedulingForm.get('enableEndDate').value){
					    this.schedulingForm.get('endDate').enable();
				    }

			    }
		    }
	    );
	    this.schedulingForm.get('enableEndDate').valueChanges
		    .cancelOnDestroy(this)
		    .subscribe(
		    value => {
			    if (value){
				    this.schedulingForm.get('endDate').enable();
			    }else{

				    this.schedulingForm.get('endDate').disable();
			    }
		    }
	    );

		this.schedulingForm.statusChanges
            .cancelOnDestroy(this)
            .subscribe(
				value =>
				{
					super._onStatusChanged({isValid : value === 'VALID'});
				}
			)
    }


	public _clearDates(){
		this.schedulingForm.patchValue({
			startDate: '',
			endDate: ''
		});
	}

	private getTimeZone(){
		this._timeZone = this._appLocalization.get('applications.content.entryDetails.scheduling.note');
		const now: any = new Date();
		const zoneTimeOffset:number = (now.getTimezoneOffset() / 60) * (-1);
		const ztStr: string = (zoneTimeOffset == 0) ? '' : (zoneTimeOffset > 0) ? ('+' + zoneTimeOffset) : ('-' + zoneTimeOffset);
		this._timeZone = this._timeZone.split("(NUM)").join(ztStr);
	}

	private setValidators(checkRequired: boolean){
		this.schedulingForm.clearValidators();
		this.schedulingForm.setValidators(datesValidation(checkRequired));
		this.schedulingForm.updateValueAndValidity();
	}
	public get sectionType() : EntrySectionTypes
	{
		return EntrySectionTypes.Scheduling;
	}

	protected _validate() : Observable<{ isValid : boolean}>
	{
		return Observable.create(observer =>
		{
			this.setValidators(true);
			const isValid = !this.schedulingForm.errors;
			observer.next({ isValid });
			observer.complete()
		});
	}

    /**
     * Do some cleanups if needed once the section is removed
     */
	protected _reset()
	{
		this.setValidators(false);
		this.schedulingForm.updateValueAndValidity();
	}
}

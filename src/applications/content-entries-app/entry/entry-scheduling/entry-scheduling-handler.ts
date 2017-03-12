import { Injectable, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { KalturaUtils, KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';

import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import { EntrySectionHandler, OnSectionLoadingArgs } from '../../entry-store/entry-section-handler';
import { EntryStore } from '../../entry-store/entry-store.service';
import { EntryLoaded } from '../../entry-store/entry-sections-events';
import TakeUntilDestroy  from "angular2-take-until-destroy";

@Injectable()
@TakeUntilDestroy
export class EntrySchedulingHandler extends EntrySectionHandler
{

	private validationMessages = {
		noStartDate: this.appLocalization.get('applications.content.entryDetails.scheduling.noStartDate'),
		noEndDate: this.appLocalization.get('applications.content.entryDetails.scheduling.noEndDate'),
		endDateBefore: this.appLocalization.get('applications.content.entryDetails.scheduling.endDateBefore')
	}

	public schedulingForm: FormGroup;
	public _timeZone = "";
	public _validationError = "";
	public valid: boolean = true;

    constructor(store : EntryStore, kalturaServerClient: KalturaServerClient, private appLocalization: AppLocalization, private fb: FormBuilder)
    {
        super(store, kalturaServerClient);
	    this.createForm();
	    this.getTimeZone();
	    store.events$
		    .takeUntil((<any>this).componentDestroy())
		    .subscribe(
			    event =>
			    {
				    if (event instanceof EntryLoaded)
				    {
				    	this.entry = event.entry;
						let scheduleSettings = "anytime";
					    if (this.entry && this.entry.startDate){
						    scheduleSettings = "scheduled";
						    let startDate = KalturaUtils.fromServerDate(this.entry.startDate);
						    if (this.entry.endDate){
							    this.schedulingForm.get('endDate').enable();
							    this.schedulingForm.patchValue({
								    enableEndDate: true,
								    endDate: KalturaUtils.fromServerDate(this.entry.endDate)
							    });
						    }
					    }
					    this.schedulingForm.get('startDate').enable();
					    this.schedulingForm.patchValue({
						    scheduling: scheduleSettings,
						    startDate: startDate
					    });
				    }
			    }
		    );
    }

    private createForm(): void{
    	this.schedulingForm = this.fb.group({
		    scheduling: 'anytime',
		    startDate: {value: '', disabled: true},
		    endDate: {value: '', disabled: true},
		    enableEndDate: false
	    });
	    this.schedulingForm.get('scheduling').valueChanges.subscribe(
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
	    this.schedulingForm.get('enableEndDate').valueChanges.subscribe(
		    value => {
			    if (value){
				    this.schedulingForm.get('endDate').enable();
			    }else{

				    this.schedulingForm.get('endDate').disable();
			    }
		    }
	    );

	    // Validation
	    this.schedulingForm.get('endDate').valueChanges.subscribe(value => {this.validate();});
	    this.schedulingForm.get('startDate').valueChanges.subscribe(value => {this.validate();});
    }

    // validation should also be called upon save
    public validate(calledFromSave: boolean = false){
	    this._validationError = "";
	    const startDate = this.schedulingForm.get('startDate').value;
	    const endDate = this.schedulingForm.get('endDate').value;
	    const scheduling = this.schedulingForm.get('scheduling').value;
	    const enableEndDate = this.schedulingForm.get('enableEndDate').value;

	    if (calledFromSave && scheduling === "scheduled"){
	    	if (!startDate) {
			    this._validationError = this.validationMessages.noStartDate;
		    }
		    if (enableEndDate && !endDate){
			    this._validationError = this.validationMessages.noEndDate;
		    }
	    }

	    if (startDate && endDate && startDate > endDate){
		    this._validationError = this.validationMessages.endDateBefore;
	    }

	    this.valid = this._validationError === "";
    }

	public _clearDates(){
		this.schedulingForm.patchValue({
			startDate: '',
			endDate: ''
		});
	}

	private getTimeZone(){
		this._timeZone = this.appLocalization.get('applications.content.entryDetails.scheduling.note');
		const now: any = new Date();
		const zoneTimeOffset:number = (now.getTimezoneOffset() / 60) * (-1);
		const ztStr: string = (zoneTimeOffset == 0) ? '' : (zoneTimeOffset > 0) ? ('+' + zoneTimeOffset) : ('-' + zoneTimeOffset);
		this._timeZone = this._timeZone.split("(NUM)").join(ztStr);
	}

	public get sectionType() : EntrySectionTypes
	{
		return EntrySectionTypes.Related;
	}
    /**
     * Do some cleanups if needed once the section is removed
     */
	protected _onSectionReset()
	{
		return undefined;
	}

	protected _onSectionLoading(data : OnSectionLoadingArgs) {
		return undefined;
	}

}

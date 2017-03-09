import { Injectable, OnDestroy } from '@angular/core';

import { KalturaMediaEntry } from '@kaltura-ng2/kaltura-api/types';
import { KalturaUtils } from '@kaltura-ng2/kaltura-api';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';

import { EntrySectionHandler } from '../../entry-store/entry-section-handler';;
import { EntryStore } from '../../entry-store/entry-store.service';
import { EntryLoaded } from '../../entry-store/entry-sections-events';
import TakeUntilDestroy  from "angular2-take-until-destroy";

@Injectable()
@TakeUntilDestroy
export class EntrySchedulingHandler extends EntrySectionHandler
{

	public _scheduleSettings: string;
	public _startDate;
	public _endDate;
	public _enableEndDate:boolean = false;
	public _timeZone = "";

    constructor(store : EntryStore, private appLocalization: AppLocalization)
    {
        super(store);
	    this.getTimeZone();
	    store.events$
		    .takeUntil((<any>this).componentDestroy())
		    .subscribe(
			    event =>
			    {
				    if (event instanceof EntryLoaded)
				    {
				    	this.entry = event.entry;
						this._scheduleSettings = "anytime";
					    if (this.entry && this.entry.startDate){
						    this._scheduleSettings = "scheduled";
						    this._startDate = KalturaUtils.fromServerDate(this.entry.startDate);
						    if (this.entry.endDate){
						    	this._enableEndDate = true;
							    this._endDate = KalturaUtils.fromServerDate(this.entry.endDate);
						    }
					    }
				    }
			    }
		    );
    }

	public _clearDates(){
		this._startDate = null;
		this._endDate = null;
	}

	private getTimeZone(){
		this._timeZone = this.appLocalization.get('applications.content.entryDetails.scheduling.note');
		const now: any = new Date();
		const zoneTimeOffset:number = (now.getTimezoneOffset() / 60) * (-1);
		const ztStr: string = (zoneTimeOffset == 0) ? '' : (zoneTimeOffset > 0) ? ('+' + zoneTimeOffset) : ('-' + zoneTimeOffset);
		this._timeZone = this._timeZone.split("(NUM)").join(ztStr);
	}
    /**
     * Do some cleanups if needed once the section is removed
     */
    onSectionRemoved()
    {

    }
}

import { Host, Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';
import { EntryStore } from './entry-store.service';
import { KalturaMediaEntry } from '@kaltura-ng2/kaltura-api/types';
import { EntryLoading, SectionEntered, EntryLoaded } from './entry-sections-events';
import { EntrySectionTypes } from './entry-sections-types';
import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import { EntryDataSection, EntrySectionValidation } from './entry-data-section';

export interface OnEntryLoadedArgs
{
    entry : KalturaMediaEntry
}

export interface OnSectionLoadedArgs
{
    firstLoad : boolean;
    entry : KalturaMediaEntry
}

export interface OnEntryLoadingArgs
{
    entryId : string;
}

export interface OnEntryValidatingArgs
{
    cancel : false;
    warnings : any[],
    errors : any[]
}

export interface OnEntrySavingArgs
{
}

export interface OnEntrySavedArgs
{
}


@Injectable()
export abstract class EntrySectionHandler implements OnDestroy, EntryDataSection
{
    public entry : KalturaMediaEntry;
    private _shouldHandleSectionLoading : boolean = false;
    private _sectionLoadedOnce : boolean = false;
    private _sectionReset : Subject<any> = new Subject<any>();
    public sectionReset$ = this._sectionReset.asObservable();
    private _sectionStatus : BehaviorSubject<{ section :EntrySectionTypes, isValid : boolean}> = new BehaviorSubject<{section :EntrySectionTypes, isValid : boolean}>(null);
    public sectionStatus$ = this._sectionStatus.monitor(`section '${this.sectionType}' status changed`).share();



    public constructor(@Host() public store : EntryStore,
                        _kalturaServerClient: KalturaServerClient) {
        store.registerSection(this);

        store.events$
            .cancelOnDestroy(this)
            .subscribe(
                event => {
                    if (event instanceof EntryLoading) {
                        this._resetSectionState();

                        this._onEntryLoading({entryId : event.entryId});
                    } else if (event instanceof EntryLoaded)
                    {
                        this.entry = event.entry;
                        this._onEntryLoaded({entry : event.entry});

                        if (this.sectionType === event.activeSection) {
                            this._onSectionLoaded({entry : event.entry, firstLoad : !this._sectionLoadedOnce});
                            this._shouldHandleSectionLoading = false;
                            this._sectionLoadedOnce = true;
                        }

                    }
                    else if (event instanceof SectionEntered) {
                        if (this.entry && event.to === this.sectionType) {

                            if (this._shouldHandleSectionLoading)
                            {
                                this._onSectionLoaded({entry : this.entry, firstLoad : !this._sectionLoadedOnce});
                                this._shouldHandleSectionLoading = false;
                                this._sectionLoadedOnce = true;
                            }else {
                                this._onSectionEntered();
                            }

                        }
                    }
                }
            );
    }

    public abstract get sectionType() : EntrySectionTypes;

    public getSectionType() : EntrySectionTypes
    {
        return this.sectionType;
    }

    protected _notifySectionStatus(status : {isValid : boolean}) : void
    {
        const currentStatus = this._sectionStatus.getValue();
        if (!currentStatus || (currentStatus && currentStatus.isValid !== status.isValid))
        {
            this._sectionStatus.next({section : this.sectionType, isValid : status.isValid});
        }

    }

	protected _onEntryValidating(data : OnEntryValidatingArgs) : void {}
	protected _onEntrySaving(data : OnEntrySavingArgs) : void {}
	protected _onEntrySaved(data : OnEntrySavedArgs) : void {}

    protected abstract _onSectionReset() : void;
    protected _onSectionEntered() : void {}
    protected abstract _onSectionLoaded(data : OnSectionLoadedArgs);
    protected _onEntryLoaded(data : OnEntryLoadedArgs) : void {}
    protected _onEntryLoading(data : OnEntryLoadingArgs) : void {}

    private _resetSectionState() : void
    {
        this._shouldHandleSectionLoading = true;
        this.entry = null;
        this._sectionReset.next('');
        this._sectionStatus.next({ section : this.sectionType, isValid : true});

        this._onSectionReset();
    }

    ngOnDestroy()
    {
        this._resetSectionState();
        this._sectionStatus.complete();
        this._sectionReset.complete();
    }

    canLeaveSection() : Observable<boolean>
    {
        return Observable.of(true);
    }

    validate() : Observable<EntrySectionValidation>
    {
        return Observable.of({ sectionType : this.sectionType, isValid : true});
    }
}

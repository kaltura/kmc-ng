import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';
import { KalturaMediaEntry } from '@kaltura-ng2/kaltura-api/types';
import { EntrySectionTypes } from './entry-sections-types';
import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import { EntryDataSection, EntrySectionValidation } from './entry-data-section';
import { FormSectionsManager } from './form-sections-manager';

export interface OnDataLoadedArgs
{
    entry : KalturaMediaEntry
}

export interface OnDataLoadingArgs
{
    entryId : string;
}

export interface ActivateArgs
{
    firstLoad : boolean;
}

export interface DeactivateArgs
{
}


@Injectable()
export abstract class FormSectionHandler implements OnDestroy, EntryDataSection
{
    public entry : KalturaMediaEntry;
    private _sectionActivated : boolean = false;
    private _sectionActivatedOnce : boolean = false;
    private _sectionReset : Subject<any> = new Subject<any>();
    public sectionReset$ = this._sectionReset.asObservable();
    private _sectionStatus : BehaviorSubject<{ section :EntrySectionTypes, isValid : boolean}> = new BehaviorSubject<{section :EntrySectionTypes, isValid : boolean}>(null);
    public sectionStatus$ = this._sectionStatus.monitor(`section '${this.sectionType}' status changed`).share();

    constructor(public manager : FormSectionsManager,
                        _kalturaServerClient: KalturaServerClient) {
        manager.registerSection(this);
    }

    public abstract get sectionType() : EntrySectionTypes;

    protected _notifySectionStatus(status : {isValid : boolean}) : void
    {
        const currentStatus = this._sectionStatus.getValue();
        if (!currentStatus || (currentStatus && currentStatus.isValid !== status.isValid))
        {
            this._sectionStatus.next({section : this.sectionType, isValid : status.isValid});
        }
    }

    protected  _onSectionReset() : void{}
    protected  _initialize() : void{}
    protected _onDataLoaded(args : OnDataLoadedArgs) : void {}
    protected _onDataLoading(args : OnDataLoadingArgs) : void {}
    protected _activate(args : ActivateArgs) : void {}
    protected _deactivate(args : DeactivateArgs) : void {}

    public  initialize() : void
    {
        this._initialize();
    }

    public resetSectionState() : void
    {
        this._sectionActivated = false;
        this.entry = null;
        this._sectionReset.next('');
        this._sectionStatus.next({ section : this.sectionType, isValid : true});

        this._onSectionReset();
    }

    public onDataLoaded(data : KalturaMediaEntry) : void {
        this.entry = data;

        this._onDataLoaded({entry: data});

        if (this.manager.isActiveSection(this)) {
            this.activate();
        }

    }

    public deactivate() : void
    {
        this._deactivate({});
    }

    public activate() : void {
        if (!this._sectionActivated && this.entry)
        {
            this._activate({ firstLoad: !this._sectionActivatedOnce });
            this._sectionActivated = true;
            this._sectionActivatedOnce = true;
        }
    }

    public onDataLoading(dataId : string) : void {
        this._onDataLoading({ entryId : dataId});
    }

    ngOnDestroy()
    {
        this.resetSectionState();
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

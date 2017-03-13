import { Host, Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';
import { EntryStore } from './entry-store.service';
import { KalturaMediaEntry } from '@kaltura-ng2/kaltura-api/types';
import { EntryLoading, SectionEntered, EntryLoaded } from './entry-sections-events';
import { EntrySectionTypes } from './entry-sections-types';
import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';

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


@Injectable()
export abstract class EntrySectionHandler implements OnDestroy
{
    public entry : KalturaMediaEntry;
    private _shouldHandleSectionLoading : boolean = false;
    private _sectionLoadedOnce : boolean = false;
    private _sectionReset : Subject<any> = new Subject<any>();
    public sectionReset$ = this._sectionReset.asObservable();


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

	public validate(): boolean{
		return true;
	}

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
        this._onSectionReset();
    }

    ngOnDestroy()
    {
        this._resetSectionState();
    }


}

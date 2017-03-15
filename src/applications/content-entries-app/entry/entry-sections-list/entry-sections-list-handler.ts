import { Injectable, OnDestroy } from '@angular/core';
import { EntrySectionHandler, OnSectionLoadedArgs } from '../../entry-store/entry-section-handler';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EntryStore } from '../../entry-store/entry-store.service';
import { EntryLoaded, SectionEntered } from '../../entry-store/entry-sections-events';
import { AppLocalization } from "@kaltura-ng2/kaltura-common";
import { SectionsList } from './sections-list';
import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import { KalturaServerClient, KalturaMediaType } from '@kaltura-ng2/kaltura-api';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';
import { KalturaRequest } from '@kaltura-ng2/kaltura-api';

export interface SectionData
{
    label : string,
    hasError : boolean,
    active?: boolean,
    sectionType : EntrySectionTypes
}


@Injectable()
export class EntrySectionsListHandler extends EntrySectionHandler
{
    private _sections : BehaviorSubject<SectionData[]> = new BehaviorSubject<SectionData[]>(null);
    public sections$ : Observable<SectionData[]> = this._sections.asObservable();
    private _activeSectionType : EntrySectionTypes;

    constructor(store : EntryStore,
                kalturaServerClient: KalturaServerClient,
                private _appLocalization: AppLocalization,)
    {
        super(store,kalturaServerClient)

        store.events$
            .cancelOnDestroy(this)
            .subscribe(
            event =>
            {
                if (event instanceof SectionEntered)
                {
                    this._updateActiveSection(event.to);
                }else if (event instanceof EntryLoaded)
                {
                    this._reloadSections(event.entry.id);
                }
            }
        );
    }

    public get sectionType() : EntrySectionTypes
    {
        return null;
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
    protected _onSectionReset()
    {

    }

    private _updateActiveSection(sectionType : EntrySectionTypes) : void
    {
        this._activeSectionType = sectionType;

        if (this._sections.getValue())
        {
            this._sections.getValue().forEach((section : SectionData) =>
            {
                section.active = section.sectionType === this._activeSectionType;
            });
        }
    }

    private _reloadSections(entryId) : void
    {
        const mediaType = this.entry.mediaType;
    	const sections = SectionsList.filter((section: SectionData) => {
    		switch (section.sectionType){
			    case EntrySectionTypes.Thumbnails:
    				return mediaType !== KalturaMediaType.Image;
			        break;
			    case EntrySectionTypes.Flavours:
				    return mediaType !== KalturaMediaType.Image && !this._isLive();
				    break;
			    case EntrySectionTypes.Captions:
				    return mediaType !== KalturaMediaType.Image && !this._isLive();
				    break;
			    case EntrySectionTypes.Live:
				    return this._isLive();
				    break;
			    case EntrySectionTypes.Clips:
				    return true;
				    break;
			    default:
				    return true;
			        break;
		    }
        });

        sections.forEach((section : SectionData) =>
        {
            section.label = this._appLocalization.get(section.label);
            section.active = section.sectionType === this._activeSectionType;
        });

        this._sections.next(sections);
    }

    private _isLive(): boolean{
    	const mediaType = this.entry.mediaType;
    	return mediaType === KalturaMediaType.LiveStreamFlash || mediaType === KalturaMediaType.LiveStreamWindowsMedia || mediaType === KalturaMediaType.LiveStreamRealMedia || mediaType === KalturaMediaType.LiveStreamQuicktime;
    }

    protected _onSectionLoaded(data : OnSectionLoadedArgs) {
        // do nothing
    }
}

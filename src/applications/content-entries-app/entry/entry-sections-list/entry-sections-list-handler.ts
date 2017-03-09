import { Injectable, OnDestroy } from '@angular/core';
import { EntrySectionHandler } from '../../entry-store/entry-section-handler';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EntryStore } from '../../entry-store/entry-store.service';
import { EntryLoaded, SectionEntered } from '../../entry-store/entry-sections-events';
import { AppLocalization } from "@kaltura-ng2/kaltura-common";
import { SectionsList } from './sections-list';
import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';
import { KalturaRequest } from '@kaltura-ng2/kaltura-api';

export interface SectionData
{
    label : string,
    enabled : boolean,
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
    _resetSection()
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
        const sections = SectionsList.filter(section => {
            // TODO [kmcng] update according to entry id
            return section.enabled && true;
        });

        sections.forEach((section : SectionData) =>
        {
            section.label = this._appLocalization.get(section.label);
            section.active = section.sectionType === this._activeSectionType;
        });

        this._sections.next(sections);
    }

    protected _onSectionLoading(data: {entryId: string; requests: KalturaRequest<any>[]}) {
        // do nothing
    }
}
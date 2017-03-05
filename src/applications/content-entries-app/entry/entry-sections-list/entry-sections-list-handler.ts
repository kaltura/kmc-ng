import { Injectable, OnDestroy } from '@angular/core';
import { EntrySectionHandler } from '../../entry-store/entry-section-handler';
import { ISubscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EntryStore } from '../../entry-store/entry-store.service';
import { EntryLoaded, SectionEntered } from '../../entry-store/entry-sections-events';
import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import { AppLocalization } from "@kaltura-ng2/kaltura-common";
import { SectionsList } from './sections-list';


export interface SectionData
{
    label : string,
    enabled : boolean,
    hasError : boolean,
    active?: boolean,
    sectionType : EntrySectionTypes
}


@Injectable()
export class EntrySectionsListHandler extends EntrySectionHandler implements  OnDestroy
{
    private _eventSubscription : ISubscription;
    private _sections : BehaviorSubject<SectionData[]> = new BehaviorSubject<SectionData[]>(null);
    public sections$ : Observable<SectionData[]> = this._sections.asObservable();
    private _activeSectionType : EntrySectionTypes;

    constructor(private _appLocalization: AppLocalization)
    {
        super();
    }

    protected _onStoreProvided(store : EntryStore)
    {
        this._eventSubscription = store.events$.subscribe(
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

    ngOnDestroy()
    {
        this._eventSubscription.unsubscribe();
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
}
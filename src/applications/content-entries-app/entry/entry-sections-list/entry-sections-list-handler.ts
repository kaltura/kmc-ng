import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AppLocalization } from "@kaltura-ng2/kaltura-common";
import { SectionsList } from './sections-list';
import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import '@kaltura-ng2/kaltura-common/rxjs/add/operators';
import { EntrySection } from '../../entry-store/entry-section-handler';
import { EntrySectionsManager } from '../../entry-store/entry-sections-manager';
import { KalturaMediaEntry } from '@kaltura-ng2/kaltura-api/types';

export interface SectionData
{
    label : string,
    hasErrors : boolean,
    active?: boolean,
    sectionType : EntrySectionTypes
}


@Injectable()
export class EntrySectionsListHandler extends EntrySection
{
    private _sections : BehaviorSubject<SectionData[]> = new BehaviorSubject<SectionData[]>(null);
    public sections$ : Observable<SectionData[]> = this._sections.asObservable();
    private _activeSectionType : EntrySectionTypes;
    private _firstLoad = true;

    constructor(private _manager : EntrySectionsManager,
                kalturaServerClient: KalturaServerClient,
                private _appLocalization: AppLocalization,)
    {
        super(_manager);
    }

    protected _onDataLoading(dataId : any) : void {
        this._clearSections();
    }

    protected _onDataLoaded(data : KalturaMediaEntry) : void {
        this._reloadSections(data.id);
    }

    protected _initialize() : void {

        this._manager.activeSection$
            .cancelOnDestroy(this)
            .subscribe(
                section =>
                {
                    if (section) {
                        this._updateActiveSection(section.sectionType);
                    }
                }
            );

        this._manager.sectionsStatus$
            .cancelOnDestroy(this)
            .subscribe(
                sectionsStatus => {
                    const sections = this._sections.getValue();

                    if (sections) {
                        sections.forEach(section =>
                        {
                            const sectionStatus = sectionsStatus[section.sectionType];
                            section.hasErrors =  (sectionStatus && !sectionStatus.isValid);
                        });
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
    protected reset()
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

    private _clearSections() : void
    {
        this._sections.next([]);

    }

    private _reloadSections(entryId) : void
    {
        const sections = [];

        if (entryId) {
            SectionsList.forEach((section: any) => {
                sections.push(
                    {
                        label: this._appLocalization.get(section.label),
                        active: section.sectionType === this._activeSectionType,
                        hasErrors: false,
                        sectionType: section.sectionType
                    }
                );
            });
        }

        this._sections.next(sections);
    }

    protected _activate(firstLoad : boolean) {
        // do nothing
    }
}
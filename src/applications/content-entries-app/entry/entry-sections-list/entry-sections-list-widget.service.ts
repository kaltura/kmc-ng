import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AppLocalization } from "@kaltura-ng/kaltura-common";
import { SectionsList } from './sections-list';
import { EntryWidgetKeys } from '../entry-widget-keys';
import { KalturaMediaType } from 'kaltura-typescript-client/types/KalturaMediaType';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';

import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { KalturaExternalMediaEntry } from 'kaltura-typescript-client/types/KalturaExternalMediaEntry';
import { EntryWidget } from '../entry-widget';

export interface SectionWidgetItem
{
    label : string,
    isValid : boolean,
    attached: boolean,
    key : string
}

@Injectable()
export class EntrySectionsListWidget extends EntryWidget implements OnDestroy
{
    private _sections = new BehaviorSubject<SectionWidgetItem[]>([]);
    public sections$ : Observable<SectionWidgetItem[]> = this._sections.asObservable();

    constructor(private _appLocalization: AppLocalization)
    {
        super('sectionsList');
    }

    protected onDataLoading(dataId : any) : void {
        this._clearSectionsList();
    }

    protected onActivate(firstTimeActivating: boolean)
    {
        if (firstTimeActivating)
        {
            this._initialize();
        }
    }

    protected onDataLoaded(data : KalturaMediaEntry) : void {
        this._reloadSections(data);
    }

    private _initialize() : void {
        this.form.widgetsState$
            .cancelOnDestroy(this)
            .subscribe(
                sectionsState => {
                    this._sections.getValue().forEach((section: SectionWidgetItem) => {
                        const sectionState = sectionsState[section.key];
                        const isValid = (!sectionState || sectionState.isBusy || sectionState.isValid || !sectionState.isActive);
                        const isAttached = (!!sectionState && sectionState.isAttached);

                        if (section.attached !== isAttached || section.isValid !== isValid) {
                            section.attached = isAttached;
                            section.isValid = isValid;
                        }
                    });
                }
            );
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
    protected onReset()
    {

    }

    private _clearSectionsList() : void
    {
        this._sections.next([]);

    }

    private _reloadSections(entry : KalturaMediaEntry) : void
    {
        const sections = [];
        const formWidgetsState = this.form.widgetsState;

        if (entry) {
            SectionsList.forEach((section) => {

                const sectionFormWidgetState =  formWidgetsState ? formWidgetsState[section.key] : null;
                const isSectionActive = sectionFormWidgetState && sectionFormWidgetState.isActive;

                if (this._isSectionEnabled(section.key, entry)) {
                    sections.push(
                        {
                            label: this._appLocalization.get(section.label),
                            active: isSectionActive,
                            hasErrors: sectionFormWidgetState ? sectionFormWidgetState.isValid : false,
                            key: section.key
                        }
                    );
                }
            });
        }

        this._sections.next(sections);
    }

    private _isSectionEnabled(sectionKey : string, entry : KalturaMediaEntry) : boolean {
        const mediaType = this.data.mediaType;
        const externalMedia = this.data instanceof KalturaExternalMediaEntry;
        switch (sectionKey) {
            case EntryWidgetKeys.Thumbnails:
                return mediaType !== KalturaMediaType.image;
            case EntryWidgetKeys.Flavours:
                return mediaType !== KalturaMediaType.image && !this._isLive(entry) && !externalMedia;
            case EntryWidgetKeys.Captions:
                return mediaType !== KalturaMediaType.image && !this._isLive(entry) && !externalMedia;
            case EntryWidgetKeys.Live:
                return this._isLive(entry);
            case EntryWidgetKeys.Clips:
	            return mediaType !== KalturaMediaType.image && !externalMedia;
            default:
                return true;
        }
    }

    private _isLive( entry : KalturaMediaEntry): boolean {
        const mediaType = entry.mediaType;
        return mediaType === KalturaMediaType.liveStreamFlash || mediaType === KalturaMediaType.liveStreamWindowsMedia || mediaType === KalturaMediaType.liveStreamRealMedia || mediaType === KalturaMediaType.liveStreamQuicktime;
    }

    ngOnDestroy()
    {

    }
}

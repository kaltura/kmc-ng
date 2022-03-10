import {Injectable, OnDestroy} from '@angular/core';
import { KalturaClient, KalturaMediaEntry } from 'kaltura-ngx-client';
import { KalturaMediaEntryFilter, MediaListAction, KalturaFilterPager} from 'kaltura-ngx-client'
import { Observable } from 'rxjs';
import {BehaviorSubject} from 'rxjs';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {SectionsList} from './sections-list';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';
import {EntryWidget} from '../entry-widget';
import {
    ContentEntryViewSections,
    ContentEntryViewService
} from 'app-shared/kmc-shared/kmc-views/details-views/content-entry-view.service';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import { ActivatedRoute } from '@angular/router';

export interface SectionWidgetItem {
    label: string;
    isValid: boolean;
    attached: boolean;
    key: ContentEntryViewSections;
}

@Injectable()
export class EntrySectionsListWidget extends EntryWidget implements OnDestroy
{
    private _sections = new BehaviorSubject<SectionWidgetItem[]>([]);
    private _stripFlavoursChildrenSection: boolean = false;
    public sections$ : Observable<SectionWidgetItem[]> = this._sections.asObservable();

    constructor(private _appLocalization: AppLocalization,
                private _contentEntryViewService: ContentEntryViewService,
                public route: ActivatedRoute,
                private _kalturaServerClient: KalturaClient,
                logger: KalturaLogger)
    {
        super('sectionsList', logger);
        const entryId = this.route.snapshot.url[1].path
        this._hasChildren(entryId)
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

    /**
     * Evaluates if loaded entry has any children.
     * If not, we're hiding the FlavoursChildren section.
     *
     * @param {string} id entryId
     */
    private _hasChildren(id : string) : void {
        const listMediaEntryAction = new MediaListAction({
            filter: new KalturaMediaEntryFilter({
                parentEntryIdEqual: id
            }),
            pager: new KalturaFilterPager({ pageSize : 1})
        });
        this._kalturaServerClient.request(listMediaEntryAction).subscribe((response) => {
            if (response.objects.length < 1) {
                this._stripFlavoursChildrenSection = true;
            }
        })
    }

    private _initialize() : void {
        this.form.widgetsState$
            .pipe(cancelOnDestroy(this))
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
                if (section.key === ContentEntryViewSections.FlavoursChildren && this._stripFlavoursChildrenSection) { return }
                const sectionFormWidgetState =  formWidgetsState ? formWidgetsState[section.key] : null;
                const isSectionActive = sectionFormWidgetState && sectionFormWidgetState.isActive;

                if (this._contentEntryViewService.isAvailable({ section: section.key, entry })) {
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

    ngOnDestroy() {

    }
}

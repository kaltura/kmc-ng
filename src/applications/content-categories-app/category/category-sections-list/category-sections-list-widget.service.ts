import { KalturaCategory } from 'kaltura-typescript-client/types/KalturaCategory';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AppLocalization } from "@kaltura-ng/kaltura-common";
import { CategorySectionsList } from './category-sections-list';
import { CategoryWidgetKeys } from '../category-widget-keys';
import { KalturaMediaType } from 'kaltura-typescript-client/types/KalturaMediaType';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import { CategoryWidget } from '../category-widget';

export interface SectionWidgetItem {
    label: string,
    isValid: boolean,
    attached: boolean,
    key: string
}

@Injectable()
export class CategorySectionsListWidget extends CategoryWidget implements OnDestroy {
    private _sections = new BehaviorSubject<SectionWidgetItem[]>([]);
    public sections$: Observable<SectionWidgetItem[]> = this._sections.asObservable();

    constructor(private _appLocalization: AppLocalization) {
        super('categorySectionsList');
    }

    protected onDataLoading(dataId: any): void {
        this._clearSectionsList();
    }

    protected onActivate(firstTimeActivating: boolean) {
        if (firstTimeActivating) {
            this._initialize();
        }
    }

    protected onDataLoaded(data: KalturaCategory): void {
        this._reloadSections(data);
    }

    private _initialize(): void {
        this.form.widgetsState$
            .cancelOnDestroy(this)
            .subscribe(
            sectionsState => {
                this._sections.getValue().forEach((section: SectionWidgetItem) => {
                    const sectionState = sectionsState[section.key];
                    if (sectionState) {
                        const isValid = (!sectionState || sectionState.isBusy || sectionState.isValid || !sectionState.isActive);
                        const isAttached = (!!sectionState && sectionState.isAttached);

                        if (section.attached !== isAttached || section.isValid !== isValid) {
                            console.log(`category sections list: updated section '${section.key}' state`, {
                                isAttached,
                                isValid
                            });
                            section.attached = isAttached;
                            section.isValid = isValid;
                        }
                    }
                });
            }
            );
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
    protected onReset() {
        // TODO: remove this line!!!
        // super.updateState({
        //     isDirty: true
        // });
    }

    private _clearSectionsList(): void {
        this._sections.next([]);

    }

    private _reloadSections(category: KalturaCategory): void {
        const sections = [];
        const formWidgetsState = this.form.widgetsState;

        if (category) {
            CategorySectionsList.forEach((section) => {

                const sectionFormWidgetState = formWidgetsState ? formWidgetsState[section.key] : null;
                const isSectionActive = sectionFormWidgetState && sectionFormWidgetState.isActive;

                if (this._isSectionEnabled(section.key, category)) {
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

    private _isSectionEnabled(sectionKey: string, entry: KalturaCategory): boolean {
        //const mediaType = this.data.mediaType;
        // todo: update section list
        switch (sectionKey) {
            // case EntryWidgetKeys.Thumbnails:
            //     return mediaType !== KalturaMediaType.image;
            // case EntryWidgetKeys.Flavours:
            //     return mediaType !== KalturaMediaType.image && !this._isLive(entry);
            // case EntryWidgetKeys.Captions:
            //     return mediaType !== KalturaMediaType.image && !this._isLive(entry);
            // case EntryWidgetKeys.Live:
            //     return this._isLive(entry);
            // case EntryWidgetKeys.Clips:
            //     return mediaType !== KalturaMediaType.image;
            default:
                return true;
        }
    }

    ngOnDestroy()
    {

    }
    // private _isLive( entry : KalturaMediaEntry): boolean {
    //     const mediaType = entry.mediaType;
    //     return mediaType === KalturaMediaType.liveStreamFlash || mediaType === KalturaMediaType.liveStreamWindowsMedia || mediaType === KalturaMediaType.liveStreamRealMedia || mediaType === KalturaMediaType.liveStreamQuicktime;
    // }
}

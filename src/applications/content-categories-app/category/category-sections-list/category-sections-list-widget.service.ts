import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {CategorySectionsList} from './category-sections-list';
import {Injectable, OnDestroy} from '@angular/core';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import {ActivatedRoute} from '@angular/router';
import {CategoryWidget} from '../category-widget';
import {KalturaCategory} from 'kaltura-ngx-client/api/types/KalturaCategory';

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

    constructor(private _appLocalization: AppLocalization,
                private _categoryRoute: ActivatedRoute) {
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
                sections.push(
                    {
                        label: this._appLocalization.get(section.label),
                        active: isSectionActive,
                        hasErrors: sectionFormWidgetState ? sectionFormWidgetState.isValid : false,
                        key: section.key
                    }
                );
            });
        }

        this._sections.next(sections);
    }

    ngOnDestroy() {
    }
}

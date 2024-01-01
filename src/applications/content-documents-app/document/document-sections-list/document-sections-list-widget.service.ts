import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { DocumentWidget } from '../document-widget';
import { KalturaDocumentEntry } from 'kaltura-ngx-client';
import { SectionsList } from './sections-list';
import { cancelOnDestroy } from '@kaltura-ng/kaltura-common';
import { ContentDocumentViewSections, ContentDocumentViewService } from 'app-shared/kmc-shared/kmc-views/details-views';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
export interface SectionWidgetItem {
  label: string;
  isValid: boolean;
  attached: boolean;
  key: ContentDocumentViewSections;
}

@Injectable()
export class DocumentSectionsListWidget extends DocumentWidget implements OnDestroy {
  private _sections = new BehaviorSubject<SectionWidgetItem[]>([]);
  public sections$: Observable<SectionWidgetItem[]> = this._sections.asObservable();

  constructor(private _appLocalization: AppLocalization,
              private _contentDocumentView: ContentDocumentViewService,
              logger: KalturaLogger
              ) {
    super('sectionsList', logger);
  }

  ngOnDestroy() {
  }

  protected onDataLoading(dataId: any): void {
    this._clearSectionsList();
  }

  protected onActivate(firstTimeActivating: boolean) {
    if (firstTimeActivating) {
      this._initialize();
    }
  }

  protected onDataLoaded(data: KalturaDocumentEntry): void {
    this._reloadSections(data);
  }

  private _initialize(): void {
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
  protected onReset() {

  }

  private _clearSectionsList(): void {
    this._sections.next([]);

  }

  private _reloadSections(document: KalturaDocumentEntry): void {
    const sections = [];
    const formWidgetsState = this.form.widgetsState;

    if (document) {
      SectionsList.forEach((section) => {

        const sectionFormWidgetState = formWidgetsState ? formWidgetsState[section.key] : null;
        const isSectionActive = sectionFormWidgetState && sectionFormWidgetState.isActive;

        if (this._contentDocumentView.isAvailable({ section: section.key, document })) {
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
}

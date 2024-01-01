import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DocumentStore } from '../document-store.service';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { StickyComponent } from '@kaltura-ng/kaltura-ui';
import { DocumentSectionsListWidget, SectionWidgetItem } from './document-sections-list-widget.service';
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kDocumentSectionsList',
  templateUrl: './document-sections-list.component.html',
  styleUrls: ['./document-sections-list.component.scss']
})
export class DocumentSectionsList implements OnInit, OnDestroy {
  public _loading = false;
  public _showList = false;
  public _sections: SectionWidgetItem[] = [];

  @ViewChild('documentSections', { static: true }) private documentSections: StickyComponent;

  constructor(public _appLocalization: AppLocalization,
              public _documentStore: DocumentStore,
              public _widgetService: DocumentSectionsListWidget) {
  }

  ngOnInit() {
    this._loading = true;
    this._widgetService.attachForm();

    this._widgetService.sections$
      .pipe(cancelOnDestroy(this))
      .subscribe(sections => {
        this._loading = false;
        this._sections = sections;
        this._showList = sections && sections.length > 0;
        // this.documentSections.updateLayout();
      });
  }

  ngOnDestroy() {
    this._widgetService.detachForm();
  }

  public _navigateToSection(widget: SectionWidgetItem): void {
    this._documentStore.openSection(widget.key);
  }

}

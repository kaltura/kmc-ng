import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CategoryService} from '../category.service';
import {CategorySectionsListWidget, SectionWidgetItem} from './category-sections-list-widget.service';
import {StickyComponent} from '@kaltura-ng/kaltura-ui';
import {BrowserService} from "app-shared/kmc-shell";
import { cancelOnDestroy, tag } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kCategorySectionsList',
  templateUrl: './category-sections-list.component.html',
  styleUrls: ['./category-sections-list.component.scss']
})
export class CategorySectionsListComponent implements OnInit, OnDestroy {

  @ViewChild('categorySections') private categorySections: StickyComponent;

  public _loading = false;
  public _showList = false;
  public _sections: SectionWidgetItem[] = [];


  constructor(public _widgetService: CategorySectionsListWidget, public _categoryService: CategoryService, private _browserService: BrowserService) {
  }

  public navigateToSection(widget: SectionWidgetItem): void {
    this._browserService.scrollToTop();
    this._categoryService.openSection(widget.key);
  }

  ngOnInit() {
    this._loading = true;
      this._widgetService.attachForm();

    this._widgetService.sections$
      .pipe(cancelOnDestroy(this))
      .subscribe(
      sections => {
        this._loading = false;
        this._sections = sections;
        this._showList = sections && sections.length > 0;
        this.categorySections.updateLayout();
      }
      );
  }

  ngOnDestroy() {
    this._widgetService.detachForm();
  }
}


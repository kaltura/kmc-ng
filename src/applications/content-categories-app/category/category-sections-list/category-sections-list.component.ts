import { ISubscription } from 'rxjs/Subscription';
import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { CategoryService } from '../category.service';
import { SectionWidgetItem, CategorySectionsListWidget } from './category-sections-list-widget.service';


@Component({
  selector: 'kCategorySectionsList',
  templateUrl: './category-sections-list.component.html',
  styleUrls: ['./category-sections-list.component.scss']
})
export class CategorySectionsListComponent implements AfterViewInit, OnInit, OnDestroy {

  public _loading = false;
  public _showList = false;
  public _sections: SectionWidgetItem[] = [];


  constructor(public _widgetService: CategorySectionsListWidget, public _categoryService: CategoryService) {
  }

  public navigateToSection(widget: SectionWidgetItem): void {
    this._categoryService.openSection(widget.key);
  }

  ngOnInit() {
    this._loading = true;
      this._widgetService.attachForm();

    this._widgetService.sections$
      .cancelOnDestroy(this)
      .subscribe(
      sections => {
        this._loading = false;
        this._sections = sections;
        this._showList = sections && sections.length > 0;
      }
      );
  }

  ngOnDestroy() {
    this._widgetService.detachForm();
  }

  ngAfterViewInit() {
  }
}


import { ISubscription } from 'rxjs/Subscription';
import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { CategoryService } from '../category.service';
import { SectionWidgetItem, CategorySectionsListHandler } from './category-sections-list-handler';
import { CategoryFormManager } from '../category-form-manager';


@Component({
  selector: 'kCategorySectionsList',
  templateUrl: './category-sections-list.component.html',
  styleUrls: ['./category-sections-list.component.scss']
})
export class CategorySectionsListComponent implements AfterViewInit, OnInit, OnDestroy {

  public _loading = false;
  public _showList = false;
  public _sections: SectionWidgetItem[] = [];
  private _handler: CategorySectionsListHandler;
  private _categorySectionListSubscription: ISubscription;

  constructor(private _categoryFormManager: CategoryFormManager, public _categoryService: CategoryService) {
  }

  public navigateToSection(widget: SectionWidgetItem): void {
    this._categoryService.openSection(widget.key);
  }

  ngOnInit() {
    this._loading = true;
    this._handler = this._categoryFormManager.attachWidget(CategorySectionsListHandler);

    this._categorySectionListSubscription = this._handler.sections$.subscribe(
      sections => {
        this._loading = false;
        this._sections = sections;
        this._showList = sections && sections.length > 0;
      }
    );
  }

  ngOnDestroy() {
    this._categoryFormManager.detachWidget(this._handler);
    this._categorySectionListSubscription.unsubscribe();
  }

  ngAfterViewInit() {
  }
}


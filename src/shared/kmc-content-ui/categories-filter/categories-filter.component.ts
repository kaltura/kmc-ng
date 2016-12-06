import { Component, OnInit, OnDestroy, EventEmitter, Output} from '@angular/core';

import { Subscription} from 'rxjs';
import * as R from 'ramda';

import { ContentCategoriesStore, Category } from 'kmc-content-ui/providers/content-categories-store.service';

@Component({
  selector: 'kCategoriesFilter',
  templateUrl: './categories-filter.component.html',
  styleUrls: ['./categories-filter.component.scss']
})
export class CategoriesFilterComponent implements OnInit, OnDestroy{

  loading = false;
  categories: any;
  categoriesMap: {};
  categoriesSelectionMap: any = {};
  categoriesSubscribe : Subscription;

  @Output()
  categoriesChanged = new EventEmitter<any>();

  constructor(public contentCategoriesStore: ContentCategoriesStore) {

  }

  ngOnInit() {
    this.categoriesSubscribe = this.contentCategoriesStore.categories$.subscribe(
      (categoriesRoot: any) => {
        this.categories = categoriesRoot.items ? categoriesRoot.items : [];
        this.categoriesMap = categoriesRoot.map;
      },
      (error) => {
        // TODO [KMC] - handle error
      });

    this.loading = true;
    this.contentCategoriesStore.reloadCategories().subscribe(
      () => {
        this.categoriesSelectionMap = {};
        this.loading = false;
      },
      (error) => {
        // TODO [KMC] - handle error
        this.categoriesSelectionMap = {};
        this.loading = false;
      });
  }

  ngOnDestroy(){
    this.categoriesSubscribe.unsubscribe();
  }

  // TODO [kmc] - check if we need to recursively check / un-check children and parents and if we need partial selection. If not - remove remarked code
  /*
  // select / unselect all children (recursive)
  private toggleChildren(cat : Category) {
    cat.children.forEach(function(category: Category) {
      category.selected = cat.selected;
      if (category.children.length){
        this.toggleChildren(category);
      }
    });
  }

  // update parent if needed (recursive)
  private updateParent(cat: Category){
    if (cat.parentId != "0") {
      const parentCat = this.categoriesMap[cat.parentId];
      const siblings = parentCat.children;
      parentCat.partialSelection = false;
      if ( R.find(R.propEq('selected', !cat.selected))(siblings) === undefined){
        parentCat.selected = cat.selected;
        if (parentCat.parentId != "0"){
          this.updateParent(parentCat);
        }
      }else{
        parentCat.partialSelection = true;
      }
    }
  }
  */

  categorySelected(id: string, selected: boolean){
    if (selected){
      this.categoriesSelectionMap[id] = "selected";
    }else {
      delete this.categoriesSelectionMap[id];
    }

    // TODO [kmc] - check if we need to recursively check / un-check children and parents and if we need partial selection. If not - remove remarked code
    // this.toggleChildren(toggleCat);
    // this.updateParent(toggleCat);

    let selectedCategories = [];
    for (let key in this.categoriesSelectionMap){
      selectedCategories.push(key);
    }

    this.categoriesChanged.emit(selectedCategories);
  }

}


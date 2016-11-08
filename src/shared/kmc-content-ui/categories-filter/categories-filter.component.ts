import { Component, OnInit, OnDestroy, EventEmitter, Output} from '@angular/core';

import { Subscription} from 'rxjs';
import * as R from 'ramda';

import { ContentCategoriesStore, Category } from 'kmc-content-ui/providers/content-categories-store.service';

@Component({
  selector: 'kmc-categories-filter',
  templateUrl: './categories-filter.component.html',
  styleUrls: ['./categories-filter.component.scss']
})
export class CategoriesFilterComponent implements OnInit, OnDestroy{

  loading = false;
  categories: any;
  categoriesMap: {};
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
        this.loading = false;
      },
      (error) => {
        // TODO [KMC] - handle error
        this.loading = false;
      });
  }

  ngOnDestroy(){
    this.categoriesSubscribe.unsubscribe();
  }

  categorySelected(toggleCat: Category){
    // select / unselect all children (recursive)
    let toggleChildren = (cat: Category) => {
      cat.children.forEach(function(category: Category) {
        category.selected = cat.selected;
        if (category.children.length){
          toggleChildren(category);
        }
      });
    }
    toggleChildren(toggleCat);

    // update parent if needed (recursive)
    let updateParent = (cat: Category) => {
      if (cat.parentId != "0") {
        const parentCat = this.categoriesMap[cat.parentId];
        const siblings = parentCat.children;
        parentCat.partialSelection = false;
        if ( R.find(R.propEq('selected', !cat.selected))(siblings) === undefined){
          parentCat.selected = cat.selected;
          if (parentCat.parentId != "0"){
            updateParent(parentCat);
          }
        }else{
          parentCat.partialSelection = true;
        }
      }
    }
    updateParent(toggleCat);
    let selectedCategories = [];
    for (let key in this.categoriesMap){
      if (this.categoriesMap[key].selected){
        selectedCategories.push(key);
      }
    }
    this.categoriesChanged.emit(selectedCategories);
  }

}


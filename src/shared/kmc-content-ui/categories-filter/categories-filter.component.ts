import { Component, OnInit, OnDestroy, } from '@angular/core';

import { Subscription} from 'rxjs';

import { ContentCategoriesStore, Categories } from 'kmc-content-ui/providers/content-categories-store.service';

@Component({
  selector: 'kmc-categories-filter',
  templateUrl: './categories-filter.component.html',
  styleUrls: ['./categories-filter.component.scss']
})
export class CategoriesFilterComponent implements OnInit, OnDestroy{

  loading = false;
  categories: any;
  categoriesSubscribe : Subscription;
  constructor(public contentCategoriesStore: ContentCategoriesStore) {

  }

  ngOnInit() {

    this.categoriesSubscribe = this.contentCategoriesStore.categories$.subscribe(
      (categories: Categories) => {
        this.categories = categories ? categories.items : {};
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

}


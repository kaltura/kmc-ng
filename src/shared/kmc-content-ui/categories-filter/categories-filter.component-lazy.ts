// import { Component, OnInit, OnDestroy, EventEmitter, Output, ViewChild} from '@angular/core';
// import { Tree, TreeNode } from 'primeng/primeng';
//
// import { Subscription} from 'rxjs';
// import * as R from 'ramda';
//
// import { CategoriesStore, Category } from 'kmc-content-ui/providers/content-categories-store.service';
//
// @Component({
//   selector: 'kCategoriesFilter',
//   templateUrl: './categories-filter.component.html',
//   styleUrls: ['./categories-filter.component.scss']
// })
// export class CategoriesFilterComponent implements OnInit, OnDestroy{
//
//   loading = false;
//   categories: any;
//   categoriesSubscribe : Subscription;
//   selectedCategories: Category[] = [];
//   categoriesMap: any = {};
//
//   searchCategories = [];
//   filteredSearchCategories = [];
//   currentSearch: any;
//
//   autoSelectChildren:boolean = true;
//   lazyLoading: boolean = false;
//
//   categoryToLoad: Category = null; // for lazy loading
//
//   @Output()
//   categoriesChanged = new EventEmitter<any>();
//
//   @ViewChild(Tree) categoriesTree: Tree;
//
//   constructor(public categoriesStore: CategoriesStore) {
//   }
//
//   ngOnInit() {
//     this.categoriesSubscribe = this.categoriesStore.categories$.subscribe(
//       (categoriesRoot: any) => {
//         this.categories = categoriesRoot.items ? categoriesRoot.items : [];
//         this.categoriesMap = categoriesRoot.map ? categoriesRoot.map : {};
//         if (this.lazyLoading){
//           this.categories.forEach((category: Category) => {
//             category["leaf"] = false;
//           });
//           // need to put the loaded categories in the "children" property of the this.categoryToLoad category
//           // if no categories are returned - set the "leaf" property to true
//         }
//         this.createSearchCategories();
//       },
//       (error) => {
//         // TODO [KMC] - handle error
//       });
//
//     const parentNodeId = this.lazyLoading ? 0 : -1;
//     this.reloadCategories(parentNodeId);
//   }
//
//   reloadCategories(parentNodeId: number){
//     this.loading = true;
//     this.categoriesStore.reloadCategories(this.lazyLoading, parentNodeId).subscribe(
//       () => {
//         this.loading = false;
//       },
//       (error) => {
//         // TODO [KMC] - handle error
//         this.loading = false;
//       });
//   }
//
//   // support lazy loading of node
//   loadNode(event) {
//     if (this.lazyLoading && event.node) {
//       this.categoryToLoad = event.node as Category;
//       this.reloadCategories(this.categoryToLoad.id);
//     }
//   }
//
//   // create a flat array for all categories to be used by auto-complete search field
//   createSearchCategories(){
//     this.searchCategories = [];
//     for (let id in this.categoriesMap){
//       let category: Category = this.categoriesMap[id];
//       let label = category.label;
//       while (category.parentId !== 0){
//         category = this.categoriesMap[category.parentId];
//         label = category.label + " > "+ label;
//       }
//       this.searchCategories.push({'label': label, 'id': id});
//     }
//   }
//
//   categorySearch(event) {
//     let query = event.query;
//     this.filteredSearchCategories = [];
//     this.searchCategories.forEach((category: Category) => {
//       if(category.label.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
//         this.filteredSearchCategories.push(category);
//       }
//     });
//   }
//
//   categorySelected(event){
//     this.categoriesTree.expandToNode(this.categoriesMap[event.id]);
//
//     if (R.findIndex(R.propEq('id', parseInt(event.id)))(this.selectedCategories) === -1){
//       if (this.autoSelectChildren){
//         this.categoriesTree.propagateSelectionDown(this.categoriesMap[event.id], true);
//         if(this.categoriesMap[event.id].parent) {
//           this.categoriesTree.propagateSelectionUp(this.categoriesMap[event.id].parent, true);
//         }
//       }else{
//         this.selectedCategories.push(this.categoriesMap[event.id]);
//       }
//       this.onCategorySelectionChange(null);
//     }
//
//     this.currentSearch = null;
//   }
//
//   onCategorySelectionChange(event){
//     let selectedCategories: any[] = [];
//     this.selectedCategories.forEach((category: Category) => {
//       selectedCategories.push(category.id);
//     });
//     this.categoriesChanged.emit(selectedCategories);
//   }
//
//   clearAll(){
//     this.selectedCategories = [];
//     // clear all partial selections
//     for (let key in this.categoriesMap){
//       if (this.categoriesMap[key] && this.categoriesMap[key]['partialSelected']) {
//         this.categoriesMap[key]['partialSelected'] = false;
//       }
//     }
//     this.onCategorySelectionChange(null);
//   }
//
//
//   ngOnDestroy(){
//     this.categoriesSubscribe.unsubscribe();
//   }
//
// }
//

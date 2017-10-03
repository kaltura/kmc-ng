import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { PrimeTreeNode } from '@kaltura-ng/kaltura-primeng-ui';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { PrimeTreePropagation } from '@kaltura-ng/kaltura-primeng-ui/prime-tree';
import { CategoriesPrimeService } from 'app-shared/content-shared/categories-prime.service';

export type TreeSelectionMode = 'single' | 'multiple';

@Component({
  selector: 'k-categories-tree',
  templateUrl: './categories-tree.component.html',
  styleUrls: ['./categories-tree.component.scss']
})
export class CategoriesTreeComponent implements OnInit {

  @Input() public disablePropagation = false;
  @Input() autoLoad = true;
  @Input() selection: PrimeTreeNode | PrimeTreeNode[];

  @Input()
  set selectionMode(value: TreeSelectionMode) {
    this._selectionMode = value === 'single' ? value : 'multiple';
  }

  @Output() onCategoriesLoad = new EventEmitter<{ categories: PrimeTreeNode[] }>();
  @Output() selectionChange = new EventEmitter<PrimeTreeNode[] | PrimeTreeNode>();
  @Output() onNodeChildrenLoaded = new EventEmitter<{ node: PrimeTreeNode }>();
  @Output() onNodeSelect: EventEmitter<any> = new EventEmitter();
  @Output() onNodeUnselect: EventEmitter<any> = new EventEmitter();

  @ViewChild(PrimeTreePropagation) _primeTreeNodesState: PrimeTreePropagation;

  private inLazyMode = false;
  public _loading = false;
  public _blockerMessage: AreaBlockerMessage = null;
  public _selectionMode: TreeSelectionMode = 'multiple';
  public _selectionModes = {
    'multiple': 'multiple',
    'single': 'single'
  };

  public _categories: PrimeTreeNode[] = [];

  public updateNodeState(node: PrimeTreeNode, addToSelection: boolean): void {
    this._primeTreeNodesState.updateNodeState(node, addToSelection);
  }

  public get categories(): PrimeTreeNode[] {
    return this._categories;
  }

  constructor(private _categoriesPrimeService: CategoriesPrimeService,
              private _appAuthentication: AppAuthentication,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    this.inLazyMode = this._appAuthentication.appUser.permissionsFlags.indexOf('DYNAMIC_FLAG_KMC_CHUNKED_CATEGORY_LOAD') !== -1;

    if (this.autoLoad) {
      this._loadCategories();
    }
  }

  public _selectionChange(selection: PrimeTreeNode | PrimeTreeNode[]): void {
    this.selection = selection;
    this.selectionChange.emit(selection);
  }

  private _loadCategories(): void {
    this._loading = true;
    this._blockerMessage = null;
    this._categoriesPrimeService.getCategories()
      .subscribe(result => {
          this._categories = result.categories;
          this._loading = false;
          this.onCategoriesLoad.emit({ categories: this._categories });
        },
        error => {
          this._blockerMessage = new AreaBlockerMessage({
            message: error.message || this._appLocalization.get('applications.content.entryDetails.errors.categoriesLoadError'),
            buttons: [{
              label: this._appLocalization.get('applications.content.entryDetails.errors.retry'),
              action: () => this._loadCategories()
            }]
          });
          this._loading = false;
        });
  }


  public _onNodeExpand(event: any): void {
    const node: PrimeTreeNode = event && event.node instanceof PrimeTreeNode ? event.node : null;

    if (node && this.inLazyMode) {
      this._categoriesPrimeService.loadNodeChildren(node, (children) => {
        this.onNodeChildrenLoaded.emit({ node });
        return children;
      });
    }
  }

  public _blockTreeSelection(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
  }

  public findNodeByFullIdPath(fullIdPath: (number | string)[]): PrimeTreeNode {
    // find the item in the tree (if exists)
    let result: PrimeTreeNode = null;
    for (let i = 0, length = fullIdPath.length; i < length; i++) {
      const itemIdToSearchFor = fullIdPath[i];
      result = ((result ? result.children : this._categories) || []).find(child => child.data + '' === itemIdToSearchFor + '');

      if (!result) {
        break;
      }
    }

    return result;
  }

  public clearSelection(): void {
    let resetValue = [];

    if (this._selectionMode === 'single') {
      resetValue = null;
    }

    this._selectionChange(resetValue);
  }
}


import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { PrimeTreeNode } from '@kaltura-ng/kaltura-primeng-ui';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { PrimeTreePropagation } from '@kaltura-ng/kaltura-primeng-ui/prime-tree';
import { CategoriesPrimeService } from 'app-shared/content-shared/categories-prime.service';

export enum TreeSelectionMode {
  Checkbox,
  Radiobutton
}

@Component({
  selector: 'k-categories-tree',
  templateUrl: './categories-tree.component.html',
  styleUrls: ['./categories-tree.component.scss']
})
export class CategoriesTreeComponent implements OnInit, OnChanges {

  @Input() public disablePropagation = false;
  @Input() autoLoad = true;
  @Input() selection: PrimeTreeNode | PrimeTreeNode[];

  @Input()
  set selectionMode(value: TreeSelectionMode) {
    this._selectionMode = value === TreeSelectionMode.Radiobutton ? value : TreeSelectionMode.Checkbox;
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
  public _selectionMode: TreeSelectionMode = TreeSelectionMode.Checkbox;
  public _selectionModes = TreeSelectionMode;

  public _categories: PrimeTreeNode[] = [];

  public _singleSelectedValue: string | number;

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

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selection && this._selectionMode === TreeSelectionMode.Radiobutton) {
      const selection: PrimeTreeNode = Array.isArray(this.selection) ? this.selection[0] : this.selection;
      this._singleSelectedValue = selection ? selection.data : null;
    }
  }
  public _selectionChange(selection: PrimeTreeNode | PrimeTreeNode[]): void {
    if (this._selectionMode === TreeSelectionMode.Radiobutton) {
      this._singleSelectedValue = selection ? (<PrimeTreeNode>selection).data : null;
    }

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

    if (this._selectionMode === TreeSelectionMode.Radiobutton) {
      resetValue = null;
    }

    this._selectionChange(resetValue);
  }
}


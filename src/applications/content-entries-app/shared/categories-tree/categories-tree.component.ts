import { Component, Input, Output,  ViewChild, EventEmitter } from '@angular/core';
import { Tree } from 'primeng/primeng';

import { PrimeTreeNode, NodeChildrenStatuses } from '@kaltura-ng2/kaltura-primeng-ui';

import { TreeSelection, OnSelectionChangedArgs,TreeSelectionModes } from '@kaltura-ng2/kaltura-primeng-ui/tree-selection';

@Component({
    selector: 'kCategoriesTree',
    templateUrl: './categories-tree.component.html',
    styleUrls: ['./categories-tree.component.scss']
})
export class CategoriesTreeComponent{

	@Input()
	_selectionMode :TreeSelectionModes;
	@Input()
	_categories: PrimeTreeNode[] = [];
	@Input()
	NodeChildrenStatuses : any = NodeChildrenStatuses;

	@Output()
	nodeExpand = new EventEmitter<any>();
	@Output()
	selectionChange = new EventEmitter<OnSelectionChangedArgs>();

    @ViewChild(TreeSelection)
    private _treeSelection : TreeSelection = null;

	public get treeSelection(){
		return this._treeSelection;
	}

    @ViewChild(Tree)
    private categoriesTree: Tree;



    constructor() {
    }


	public _onTreeSelectionChanged(args : OnSelectionChangedArgs) : void {
		this.selectionChange.emit(args);
	}


    public _onNodeExpand(event : any) : void
    {
	    this.nodeExpand.emit(event);
    }

	public _blockTreeSelection(e: MouseEvent){
		e.preventDefault();
		e.stopPropagation();
	}

}


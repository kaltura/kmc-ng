import { Component, Input, Output, OnInit, ViewChild, EventEmitter } from '@angular/core';
import { PrimeTreeNode } from '@kaltura-ng2/kaltura-primeng-ui';
import { AppAuthentication, AppLocalization } from '@kaltura-ng2/kaltura-common';
import { CategoriesPrimeService } from '../categories-prime.service';
import { AreaBlockerMessage } from '@kaltura-ng2/kaltura-ui';


@Component({
    selector: 'k-categories-tree',
    templateUrl: './categories-tree.component.html',
    styleUrls: ['./categories-tree.component.scss']
})
export class CategoriesTreeComponent implements OnInit {

	private inLazyMode: boolean = false;
	public _loading : boolean = false;
	public _blockerMessage: AreaBlockerMessage = null;
	public _categories: PrimeTreeNode[] = [];

	@Output()
	onCategoriesLoad = new EventEmitter<{ categories : PrimeTreeNode[]}>();

	@Input()
	autoLoad :boolean = true;

	@Input()
	selection : PrimeTreeNode[];

	@Output()
	selectionChange = new EventEmitter<PrimeTreeNode[]>();

	@Output()
	onNodeChildrenLoaded = new EventEmitter<{node : PrimeTreeNode}>();

	@Output() onNodeSelect: EventEmitter<any> = new EventEmitter();

	@Output() onNodeUnselect: EventEmitter<any> = new EventEmitter();


	get categories() : PrimeTreeNode[]
	{
		return this._categories ;
	}

	public findNodeByFullIdPath(fullIdPath : (number | string)[]) : PrimeTreeNode
	{
		// find the item in the tree (if exists)
		let result : PrimeTreeNode = null;
		for(let i=0,length=fullIdPath.length; i<length ; i++)
		{
			const itemIdToSearchFor = fullIdPath[i];
			result = ((result ? result.children : this._categories) || []).find(child => child.data + ''  === itemIdToSearchFor + '');

			if (!result)
			{
				break;
			}
		}

		return result;
	}


	constructor(private _categoriesPrimeService: CategoriesPrimeService,private _appAuthentication : AppAuthentication, private _appLocalization: AppLocalization) {
    }

    ngOnInit()
	{
		this.inLazyMode = this._appAuthentication.appUser.permissionsFlags.indexOf('DYNAMIC_FLAG_KMC_CHUNKED_CATEGORY_LOAD') !== -1;

		if (this.autoLoad)
		{
			this.loadCategories();
		}
	}

	loadCategories():void{
		this._loading = true;
		this._blockerMessage = null;
		this._categoriesPrimeService.getCategories()
            .subscribe( result => {
					this._categories = result.categories;
					this._loading = false;
					this.onCategoriesLoad.emit({ categories : this._categories});
				},
				error => {
					this._blockerMessage = new AreaBlockerMessage({
						message: error.message || this._appLocalization.get('applications.content.entryDetails.errors.categoriesLoadError'),
						buttons: [{
							label: this._appLocalization.get('applications.content.entryDetails.errors.retry'),
							action: () => {
								this.loadCategories();
							}}
						]
					});
					this._loading = false;
				});
	}



    public _onNodeExpand(event : any) : void {
		const node: PrimeTreeNode = event && event.node instanceof PrimeTreeNode ? event.node : null;

		if (node) {
			if (this.inLazyMode) {
				const node: PrimeTreeNode = <PrimeTreeNode>event.node;
				this._categoriesPrimeService.loadNodeChildren(node, (children) => {
					this.onNodeChildrenLoaded.emit({node});
					return children;
				});
			}
		}
	}

	public _blockTreeSelection(e: MouseEvent){
		e.preventDefault();
		e.stopPropagation();
	}

}


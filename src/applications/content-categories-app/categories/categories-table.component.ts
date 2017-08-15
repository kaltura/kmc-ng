import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { MenuItem, DataTable, Menu } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { CategoriesService } from "./categories.service";
import { KalturaCategory } from 'kaltura-typescript-client/types/KalturaCategory';
import { KalturaCategoryStatus } from "kaltura-typescript-client/types/KalturaCategoryStatus";

@Component({
	selector: 'kCategoriesTable',
	templateUrl: './categories-table.component.html',
	styleUrls: ['./categories-table.component.scss']
})
export class CategoriesTableComponent implements AfterViewInit, OnInit, OnDestroy {

	public _blockerMessage: AreaBlockerMessage = null;

	public _categories: KalturaCategory[] = [];
	private _deferredCategories: any[];
	@Input() set categories(data: any[]) {
		if (!this._deferredLoading) {
			// the table uses 'rowTrackBy' to track changes by id. To be able to reflect changes of entries
			// (ie when returning from entry page) - we should force detect changes on an empty list
			this._categories = [];
			this.cdRef.detectChanges();
			this._categories = data;
			this.cdRef.detectChanges();
		} else {
			this._deferredCategories = data
		}
	}

	@Input() filter: any = {};
	@Input() selectedCategories: KalturaCategory[] = [];

	@Output()
	sortChanged = new EventEmitter<any>();
	@Output()
	actionSelected = new EventEmitter<any>();
	@Output()
	selectedCategoriesChange = new EventEmitter<any>();

	@ViewChild('dataTable') private _dataTable: DataTable;
	@ViewChild('actionsmenu') private _actionsMenu: Menu;
	private _actionsMenuCategoryId: number = 0;
	private _categoriesServiceStatusSubscription: ISubscription;

	public _deferredLoading = true;
	public _emptyMessage: string = "";

	public _items: MenuItem[];

	public rowTrackBy: Function = (index: number, item: any) => { return item.id };

	constructor(private appLocalization: AppLocalization, public categoriesService: CategoriesService, private cdRef: ChangeDetectorRef) {
	}

	_convertSortValue(value: boolean): number {
		return value ? 1 : -1;

	}

	ngOnInit() {
		this._blockerMessage = null;
		this._emptyMessage = "";
		let loadedOnce = false; // used to set the empty message to "no results" only after search
		this._categoriesServiceStatusSubscription = this.categoriesService.state$.subscribe(
			result => {
				if (result.errorMessage) {
					this._blockerMessage = new AreaBlockerMessage({
						message: result.errorMessage || "Error loading entries",
						buttons: [{
							label: 'Retry',
							action: () => {
								this.categoriesService.reload(true);
							}
						}
						]
					})
				} else {
					this._blockerMessage = null;
					if (result.loading) {
						this._emptyMessage = "";
						loadedOnce = true;
					} else {
						if (loadedOnce) {
							this._emptyMessage = this.appLocalization.get('applications.content.table.noResults');
						}
					}
				}
			},
			error => {
				console.warn("[kmcng] -> could not load entries"); //navigate to error page
				throw error;
			});
	}

	ngOnDestroy() {
		this._categoriesServiceStatusSubscription.unsubscribe();
		this._categoriesServiceStatusSubscription = null;
	}

	ngAfterViewInit() {
		const scrollBody = this._dataTable.el.nativeElement.getElementsByClassName("ui-datatable-scrollable-body");
		if (scrollBody && scrollBody.length > 0) {
			scrollBody[0].onscroll = () => {
				if (this._actionsMenu) {
					this._actionsMenu.hide();
				}
			}
		}
		if (this._deferredLoading) {
			// use timeout to allow the DOM to render before setting the data to the datagrid. This prevents the screen from hanging during datagrid rendering of the data.
			setTimeout(() => {
				this._deferredLoading = false;
				this._categories = this._deferredCategories;
				this._deferredCategories = null;
			}, 0);
		}
	}

	onActionSelected(action: string, categoryID: number) {
		if (this.allowDrillDown()) {
			this.actionSelected.emit({ "action": action, "categoryID": categoryID });
		}
	}

	allowDrillDown() {
		let allowed = true;
		// if (status != KalturaCategoryStatus.active.toString()) {
		// 	allowed = false;
		// }
		return allowed;
	}

	openActionsMenu(event: any, category: KalturaCategory) {
		if (this._actionsMenu) {
			this._actionsMenu.toggle(event);
			if (this._actionsMenuCategoryId !== category.id) {
				this.buildMenu();
				this._actionsMenuCategoryId = category.id;
				this._actionsMenu.show(event);
			}
		}
	}

	buildMenu(): void {
		this._items = [
			{
				label: this.appLocalization.get("applications.content.categories.edit"), command: (event) => {
					this.onActionSelected("edit", this._actionsMenuCategoryId);
				}
			},
			{
				label: this.appLocalization.get("applications.content.categories.delete"), command: (event) => {
					this.onActionSelected("delete", this._actionsMenuCategoryId);
				}
			},
			{
				label: this.appLocalization.get("applications.content.categories.viewEntries"), command: (event) => {
					this.onActionSelected("viewEntries", this._actionsMenuCategoryId);
				}
			},
			{
				label: this.appLocalization.get("applications.content.categories.moveCategory"), command: (event) => {
					this.onActionSelected("moveCategory", this._actionsMenuCategoryId);
				}
			}
		];		
	}

	onSelectionChange(event) {
		this.selectedCategoriesChange.emit(event);
	}
}


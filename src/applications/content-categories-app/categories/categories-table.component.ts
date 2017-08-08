import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { MenuItem, DataTable, Menu } from 'primeng/primeng';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { KalturaMediaType } from 'kaltura-typescript-client/types/KalturaMediaType';
import { KalturaEntryStatus } from 'kaltura-typescript-client/types/KalturaEntryStatus';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { CategoriesService } from "./categories.service";

@Component({
	selector: 'kCategoriesTable',
	templateUrl: './categories-table.component.html',
	styleUrls: ['./categories-table.component.scss']
})
export class CategoriesTableComponent implements AfterViewInit, OnInit, OnDestroy {

	public _blockerMessage: AreaBlockerMessage = null;

	public _categories: any[] = [];
	private _deferredCategories : any[];
	@Input() set categories(data: any[]) {
		if (!this._deferredLoading) {
			// the table uses 'rowTrackBy' to track changes by id. To be able to reflect changes of entries
			// (ie when returning from entry page) - we should force detect changes on an empty list
			this._categories = [];
			this.cdRef.detectChanges();
			this._categories = data;
			this.cdRef.detectChanges();
		}else {
			this._deferredCategories = data
		}
	}

	@Input() filter: any = {};
	@Input() selectedEntries: any[] = [];

	@Output()
	sortChanged = new EventEmitter<any>();
	@Output()
	actionSelected = new EventEmitter<any>();
	@Output()
	selectedEntriesChange = new EventEmitter<any>();

	@ViewChild('dataTable') private dataTable: DataTable;
	@ViewChild('actionsmenu') private actionsMenu: Menu;
	private actionsMenuEntryId: string = "";
	private entriesStoreStatusSubscription: ISubscription;

	public _deferredLoading = true;
	public _emptyMessage: string = "";

	public _items: MenuItem[];

	public rowTrackBy: Function = (index: number, item: any) => {return item.id};

	constructor(private appLocalization: AppLocalization, public categoriesService: CategoriesService, private cdRef:ChangeDetectorRef) {
	}

	_convertSortValue(value: boolean): number {
		return value ? 1 : -1;

	}

	ngOnInit() {
		this._blockerMessage = null;
		this._emptyMessage = "";
		let loadedOnce = false; // used to set the empty message to "no results" only after search
		this.entriesStoreStatusSubscription = this.categoriesService.state$.subscribe(
			result => {
				if (result.errorMessage) {
					this._blockerMessage = new AreaBlockerMessage({
						message: result.errorMessage || "Error loading entries",
						buttons: [{
							label: 'Retry',
							action: () => {
								this.categoriesService.reload(true);
							}}
						]
					})
				} else {
					this._blockerMessage = null;
					if (result.loading){
						this._emptyMessage = "";
						loadedOnce = true;
					}else {
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
		this.actionsMenu.hide();
		this.entriesStoreStatusSubscription.unsubscribe();
		this.entriesStoreStatusSubscription = null;
	}

	ngAfterViewInit() {
		const scrollBody = this.dataTable.el.nativeElement.getElementsByClassName("ui-datatable-scrollable-body");
		if (scrollBody && scrollBody.length > 0) {
			scrollBody[0].onscroll = () => {
				if (this.actionsMenu) {
					this.actionsMenu.hide();
				}
			}
		}
		if (this._deferredLoading) {
			// use timeout to allow the DOM to render before setting the data to the datagrid. This prevents the screen from hanging during datagrid rendering of the data.
			setTimeout(()=> {
				this._deferredLoading = false;
				this._categories = this._deferredCategories;
				this._deferredCategories = null;
			}, 0);
		}
	}


}


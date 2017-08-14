import { Categories } from './../categories/categories.service';
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { BrowserService } from 'app-shared/kmc-shell';
import { CategoryStoreService, ActionTypes } from './category-store.service';
import { CategorySectionsListHandler } from './category-sections-list/category-sections-list-handler';
import { CategoriesService } from '../Categories/categories.service';
import { CategoryFormManager } from './category-form-manager';
import { AreaBlockerMessage, AreaBlockerMessageButton } from '@kaltura-ng/kaltura-ui';
import { CategoryFormWidget } from './category-form-widget';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { Observable } from 'rxjs/Observable';

@Component({
	selector: 'kCategory',
	templateUrl: './category.component.html',
	styleUrls: ['./category.component.scss'],
	providers: [
		CategoryStoreService,
		CategoryFormManager,
		{
			provide: CategoryFormWidget,
			useClass: CategorySectionsListHandler,
			multi: true
		}
	]
})
export class CategoryComponent implements OnInit, OnDestroy {

	_categoryName: string;

	public _showLoader = false;
	public _areaBlockerMessage: AreaBlockerMessage;
	public _currentCategoryId: string;
	public _enablePrevButton: boolean;
	public _enableNextButton: boolean;
	public _categoryHasChanges: boolean;

	public isSafari: boolean = false; // used for Safari specific styling

	constructor(public _categoryStore: CategoryStoreService,
		private _categoriesStore: CategoriesService,
		private _categoryFormManager: CategoryFormManager,
		private _browserService: BrowserService,
		@Inject(CategoryFormWidget) private _widgets: CategoryFormWidget[],
		private _appLocalization: AppLocalization) {

	}

	ngOnDestroy() {
	}

	private _updateNavigationState() {
		const categories = this._categoriesStore.categories;
		if (categories && this._currentCategoryId) {
			const currentCategory = categories.find(category => category.id.toString() === this._currentCategoryId);
			const currentCategoryIndex = currentCategory ? categories.indexOf(currentCategory) : -1;
			this._enableNextButton = currentCategoryIndex >= 0 && (currentCategoryIndex < categories.length - 1);
			this._enablePrevButton = currentCategoryIndex > 0;

		} else {
			this._enableNextButton = false;
			this._enablePrevButton = false;
		}
	}

	ngOnInit() {

		this._categoryFormManager.registerWidgets(this._widgets);

		this.isSafari = this._browserService.isSafari();

		this._categoryStore.state$
			.cancelOnDestroy(this)
			.subscribe(
			status => {

				this._showLoader = false;
				this._areaBlockerMessage = null;

				if (status) {
					switch (status.action) {
						case ActionTypes.CategoryLoading:
							this._showLoader = true;

							// when loading new category in progress, the 'categoryID' property
							// reflect the category that is currently being loaded
							// while 'category$' stream is null
							this._currentCategoryId = this._categoryStore.categoryId;
							this._updateNavigationState();
							this._categoryHasChanges = false;
							break;
						case ActionTypes.CategoryLoaded:
							this._categoryName = this._categoryStore.category.name;
							break;
						case ActionTypes.CategoryLoadingFailed:
							let message = status.error ? status.error.message : '';
							message = message || this._appLocalization.get('applications.content.errors.loadError');
							this._areaBlockerMessage = new AreaBlockerMessage({
								message: message,
								buttons: [
									this._createBackToCategoriesButton(),
									{
										label: this._appLocalization.get('applications.content.categoryDetails.errors.retry'),
										action: () => {
											this._categoryStore.reloadCategory();
										}
									}
								]
							});
							break;
						case ActionTypes.CategorySaving:
							this._showLoader = true;
							break;
						case ActionTypes.CategorySavingFailed:

							this._areaBlockerMessage = new AreaBlockerMessage({
								message: this._appLocalization.get('applications.content.categoryDetails.errors.saveError'),
								buttons: [
									{
										label: this._appLocalization.get('applications.content.categoryDetails.errors.reload'),
										action: () => {
											this._categoryStore.reloadCategory();
										}
									}
								]
							});
							break;
						case ActionTypes.CategoryDataIsInvalid:

							this._areaBlockerMessage = new AreaBlockerMessage({
								message: this._appLocalization.get('applications.content.categoryDetails.errors.validationError'),
								buttons: [
									{
										label: this._appLocalization.get('applications.content.categoryDetails.errors.dismiss'),
										action: () => {
											this._areaBlockerMessage = null;
										}
									}
								]
							});
							break;
						case ActionTypes.ActiveSectionBusy:

							this._areaBlockerMessage = new AreaBlockerMessage({
								message: this._appLocalization.get('applications.content.categoryDetails.errors.busyError'),
								buttons: [
									{
										label: this._appLocalization.get('applications.content.categoryDetails.errors.dismiss'),
										action: () => {
											this._areaBlockerMessage = null;
										}
									}
								]
							});
							break;
						case ActionTypes.CategoryPrepareSavingFailed:

							this._areaBlockerMessage = new AreaBlockerMessage({
								message: this._appLocalization.get('applications.content.categoryDetails.errors.savePrepareError'),
								buttons: [
									{
										label: this._appLocalization.get('applications.content.categoryDetails.errors.dismiss'),
										action: () => {
											this._areaBlockerMessage = null;
										}
									}
								]
							});
							break;
						default:
							break;
					}
				}
			},
			error => {
				// TODO [kmc] navigate to error page
				throw error;
			});
	}

	private _createBackToCategoriesButton(): AreaBlockerMessageButton {
		return {
			label: 'Back To Categories',
			action: () => {
				this._categoryStore.returnToCategories();
			}
		};
	}

	public _backToList() {
		this._categoryStore.returnToCategories();
	}

	public _save() {
		this._categoryStore.saveCategory();
	}

	public _navigateToPrevious(): void {
		const categories = this._categoriesStore.categories;

		if (categories && this._currentCategoryId) {
			const currentCategory = categories.find(category => category.id.toString() === this._currentCategoryId);
			const currentCategoryIndex = currentCategory ? categories.indexOf(currentCategory) : -1;
			if (currentCategoryIndex > 0) {
				const prevCategory = categories[currentCategoryIndex - 1];
				this._categoryStore.openCategory(prevCategory.id);
			}
		}
	}

	public _navigateToNext(): void {
		const categories = this._categoriesStore.categories;

		if (categories && this._currentCategoryId) {
			const currentCategory = categories.find(category => category.id.toString() === this._currentCategoryId);
			const currentCategoryIndex = currentCategory ? categories.indexOf(currentCategory) : -1;
			if (currentCategoryIndex >= 0 && (currentCategoryIndex < categories.length - 1)) {
				const nextCategory = categories[currentCategoryIndex + 1];
				this._categoryStore.openCategory(nextCategory.id);
			}
		}
	}

	public canLeave(): Observable<{ allowed: boolean }> {
		return this._categoryStore.canLeave();
	}

}


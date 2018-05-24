import {CategoriesService} from './../categories/categories.service';
import {Host, Injectable, OnDestroy} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ISubscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/subscribeOn';
import 'rxjs/add/operator/switchMap';

import {KalturaClient, KalturaMultiRequest, KalturaTypesFactory} from 'kaltura-ngx-client';
import {KalturaCategory} from 'kaltura-ngx-client/api/types/KalturaCategory';
import {CategoryGetAction} from 'kaltura-ngx-client/api/types/CategoryGetAction';
import {CategoryUpdateAction} from 'kaltura-ngx-client/api/types/CategoryUpdateAction';
import '@kaltura-ng/kaltura-common/rxjs/add/operators';
import {CategoryWidgetsManager} from './category-widgets-manager';
import {OnDataSavingReasons} from '@kaltura-ng/kaltura-ui';
import {BrowserService} from 'app-shared/kmc-shell/providers/browser.service';
import {PageExitVerificationService} from 'app-shared/kmc-shell/page-exit-verification';
import {AppEventsService} from 'app-shared/kmc-shared';
import { CategoriesGraphUpdatedEvent } from 'app-shared/kmc-shared/app-events/categories-graph-updated/categories-graph-updated';
import { CategoriesStatusMonitorService } from 'app-shared/content-shared/categories-status/categories-status-monitor.service';
import { CategoryDeleteAction } from 'kaltura-ngx-client/api/types/CategoryDeleteAction';
import { CategoryListAction } from 'kaltura-ngx-client/api/types/CategoryListAction';
import { KalturaCategoryFilter } from 'kaltura-ngx-client/api/types/KalturaCategoryFilter';
import { ContentCategoryViewSections, ContentCategoryViewService } from 'app-shared/kmc-shared/kmc-views/details-views';
import { ContentCategoriesMainViewService } from 'app-shared/kmc-shared/kmc-views';

export enum ActionTypes {
  CategoryLoading,
  CategoryLoaded,
  CategoryLoadingFailed,
  CategorySaving,
  CategoryPrepareSavingFailed,
  CategorySavingFailed,
  CategoryDataIsInvalid,
  ActiveSectionBusy
}

declare interface StatusArgs {
  action: ActionTypes;
  error?: Error;
}

@Injectable()
export class CategoryService implements OnDestroy {

    private _loadCategorySubscription: ISubscription;
    private _state = new BehaviorSubject<StatusArgs>({action: ActionTypes.CategoryLoading, error: null});

    private _saveCategoryInvoked = false;
    public state$ = this._state.asObservable();
    private _categoryIsDirty: boolean;
    private _pageExitVerificationToken: string;

    public get categoryIsDirty(): boolean {
        return this._categoryIsDirty;
    }

    private _category: BehaviorSubject<KalturaCategory> = new BehaviorSubject<KalturaCategory>(null);
    public category$ = this._category.asObservable();
    private _categoryId: number;

    public get categoryId(): number {
        return this._categoryId;
    }

    public get category(): KalturaCategory {
        return this._category.getValue();
    }

    public notifyChangesInCategory(): void{
    	this._saveCategoryInvoked = true;
	}
    constructor(private _kalturaServerClient: KalturaClient,
                private _router: Router,
                private _browserService: BrowserService,
                private _categoriesStore: CategoriesService,
                @Host() private _widgetsManager: CategoryWidgetsManager,
                private _categoryRoute: ActivatedRoute,
                private _appLocalization: AppLocalization,
                private _appEvents: AppEventsService,
                private _pageExitVerificationService: PageExitVerificationService,
                appEvents: AppEventsService,
                private _contentCategoryView: ContentCategoryViewService,
                private _contentCategoriesMainViewService: ContentCategoriesMainViewService,
                private _categoriesStatusMonitorService: CategoriesStatusMonitorService) {

        this._widgetsManager.categoryStore = this;

        this._mapSections();

        this._onSectionsStateChanges();
        this._onRouterEvents();
    }

    private _onSectionsStateChanges() {
        this._widgetsManager.widgetsState$
            .cancelOnDestroy(this)
            .debounce(() => Observable.timer(500))
            .subscribe(
                sectionsState => {
                    const newDirtyState = Object.keys(sectionsState).reduce((result, sectionName) => result || sectionsState[sectionName].isDirty, false);

                    if (this._categoryIsDirty !== newDirtyState) {
                        console.log(`category store: update category is dirty state to ${newDirtyState}`);
                        this._categoryIsDirty = newDirtyState;
                        this._updatePageExitVerification();
                    }
                }
            );
    }

    private _updatePageExitVerification() {
        if (this._categoryIsDirty) {
            this._pageExitVerificationToken = this._pageExitVerificationService.add();
        } else {
        	if (this._pageExitVerificationToken) {
                this._pageExitVerificationService.remove(this._pageExitVerificationToken);
            }
            this._pageExitVerificationToken = null;
        }
    }

    ngOnDestroy() {
        this._loadCategorySubscription && this._loadCategorySubscription.unsubscribe();
        this._state.complete();
        this._category.complete();

        if (this._pageExitVerificationToken) {
            this._pageExitVerificationService.remove(this._pageExitVerificationToken);
        }

        if (this._saveCategoryInvoked) {
            this._categoriesStore.reload();
        }
    }

    private _mapSections(): void {
        if (!this._categoryRoute || !this._categoryRoute.snapshot.data.categoryRoute) {
            throw new Error('this service can be injected from component that is associated to the category route');
        }
    }


	private _onRouterEvents(): void {
		this._router.events
			.cancelOnDestroy(this)
			.filter(
			event => event instanceof NavigationEnd)
.subscribe(
                event => {
					// we must defer the loadCategory to the next event cycle loop to allow components
					// to init them-selves when entering this module directly.
					setTimeout(() => {
						const currentCategoryId = this._categoryRoute.snapshot.params.id;
                        const category = this._category.getValue();
                        if (!category || (category && category.id.toString() !== currentCategoryId)) {
                          this._loadCategory(currentCategoryId);
                        }
					});
				});
			}

  private _checkReferenceId(newCategory: KalturaCategory): Observable<boolean> {
    if (!newCategory.referenceId ||
		((newCategory.referenceId || null) === (this.category.referenceId || null))
	) {
      return Observable.of(true);
    }

    return Observable.create(observer => {
      this._kalturaServerClient
        .request(new CategoryListAction({
          filter: new KalturaCategoryFilter({ referenceIdEqual: newCategory.referenceId })
        }))
        .subscribe(
          response => {
            if (Array.isArray(response.objects) && response.objects.length) {
              const message = this._appLocalization.get(
                'applications.content.categoryDetails.referenceIdInUse',
                [
                  newCategory.referenceId,
                  response.objects.map(({ fullName, id }) => `- ${fullName} (ID:${id})`).join('\n')
                ]
              );
              this._browserService.confirm({
                message,
                accept: () => {
                  observer.next(true);
                  observer.complete();
                },
                reject: () => {
                  observer.next(false);
                  observer.complete();
                }
              })
            } else {
              observer.next(true);
              observer.complete();
            }
          },
          error => {
            this._state.next({ action: ActionTypes.CategoryPrepareSavingFailed });
            observer.next(false);
          });
    });
  }

	private _transmitSaveRequest(newCategory: KalturaCategory) {
		this._state.next({ action: ActionTypes.CategorySaving });

		const request = new KalturaMultiRequest(
			new CategoryUpdateAction({
				id: this.categoryId,
				category: newCategory
			})
		);



		this._widgetsManager.notifyDataSaving(newCategory, request, this.category)
			.cancelOnDestroy(this)
			.monitor('category store: prepare category for save')
      .tag('block-shell')
			.flatMap(
			(response) => {
				if (response.ready) {
					this._saveCategoryInvoked = true;

                    const userModifiedName = this.category.name !== newCategory.name;

					return this._checkReferenceId(newCategory)
            .switchMap(proceedSaveRequest => {
              if (proceedSaveRequest) {
                return this._kalturaServerClient.multiRequest(request)
                  .monitor('category store: save category')
                  .tag('block-shell')
                  .map(
                    categorySavedResponse => {

                      if (userModifiedName) {
                        this._appEvents.publish(new CategoriesGraphUpdatedEvent());
                      }


                      // if categories were deleted during the save operation (sub-categories window) - invoke immediate polling of categories status
                      const deletedCategories = request.requests.find((req, index) => {
                        return (req instanceof CategoryDeleteAction && !categorySavedResponse[index].error)
                      });
                      if (deletedCategories) {
                        this._categoriesStatusMonitorService.updateCategoriesStatus();
                      }

                      if (categorySavedResponse.hasErrors()) {
                        this._state.next({ action: ActionTypes.CategorySavingFailed });
                      } else {
                        this._loadCategory(this.categoryId);
                      }

                      return Observable.empty();
                    }
                  )
              } else {
                return Observable.empty();
              }
            });
				}
				else {
					switch (response.reason) {
						case OnDataSavingReasons.validationErrors:
							this._state.next({ action: ActionTypes.CategoryDataIsInvalid });
							break;
						case OnDataSavingReasons.attachedWidgetBusy:
							this._state.next({ action: ActionTypes.ActiveSectionBusy });
							break;
						case OnDataSavingReasons.buildRequestFailure:
							this._state.next({ action: ActionTypes.CategoryPrepareSavingFailed });
							break;
					}

					return Observable.empty();
				}
			}
			)
			.subscribe(
			response => {
				// do nothing - the service state is modified inside the map functions.
			},
			error => {
				// should not reach here, this is a fallback plan.
				this._state.next({ action: ActionTypes.CategorySavingFailed });
			}
			);
	}
	public saveCategory(): void {

		const newCategory = KalturaTypesFactory.createObject(this.category);

		if (newCategory && newCategory instanceof KalturaCategory) {
			this._transmitSaveRequest(newCategory)
		} else {
			console.error(new Error(`Failed to create a new instance of the category type '${this.category ? typeof this.category : 'n/a'}`));
			this._state.next({ action: ActionTypes.CategoryPrepareSavingFailed });
		}
	}

	public reloadCategory(): void {
		if (this.categoryId) {
			this._loadCategory(this.categoryId);
		}
	}

	private _loadCategory(id: number): void {
		if (this._loadCategorySubscription) {
			this._loadCategorySubscription.unsubscribe();
			this._loadCategorySubscription = null;
		}

		this._categoryId = id;
		this._categoryIsDirty = false;
		this._updatePageExitVerification();

		this._state.next({ action: ActionTypes.CategoryLoading });
		this._widgetsManager.notifyDataLoading(id);

		if (!id) {
      return this._state.next({action: ActionTypes.CategoryLoadingFailed, error: new Error('Missing categoryId')});
    }this._loadCategorySubscription = this._kalturaServerClient
      .request(new CategoryGetAction({id}))
			.cancelOnDestroy(this)
			.subscribe(category => {
                if (this._contentCategoryView.isAvailable({ category, activatedRoute: this._categoryRoute, section: ContentCategoryViewSections.ResolveFromActivatedRoute  })) {
                    this._loadCategorySubscription = null;

                    this._category.next(category);

                    const dataLoadedResult = this._widgetsManager.notifyDataLoaded(category, { isNewData: false });

                    if (dataLoadedResult.errors.length) {
                        this._state.next({
                            action: ActionTypes.CategoryLoadingFailed,
                            error: new Error(`one of the widgets failed while handling data loaded event`)
                        });
                    } else {
                        this._state.next({ action: ActionTypes.CategoryLoaded });
                    }
                } else {
                    this._browserService.handleUnpermittedAction(true);
                }
            },
			error => {
				this._loadCategorySubscription = null;this._state.next({ action: ActionTypes.CategoryLoadingFailed, error });
}
			);

	}

	public openSection(section: ContentCategoryViewSections): void {
		this._contentCategoryView.open({ section, category: this.category, ignoreWarningTag: true });
	}

	public canLeaveWithoutSaving(): Observable<{ allowed: boolean }> {
		return Observable.create(observer => {
			if (this._categoryIsDirty) {
				this._browserService.confirm(
					{
						header: this._appLocalization.get('applications.content.categoryDetails.cancelEdit'),
						message: this._appLocalization.get('applications.content.categoryDetails.discard'),
						accept: () => {
							observer.next({ allowed: true });
							observer.complete();
						},
						reject: () => {
							observer.next({ allowed: false });
							observer.complete();
						}
					}
				)
			} else {
				observer.next({ allowed: true });
				observer.complete();
			}
		}).monitor('category store: check if can leave section without saving');
	}

    public openCategory(category: KalturaCategory | number) {
        const categoryId = category instanceof KalturaCategory ? category.id : category;
        if (this.categoryId !== categoryId) {
            this.canLeaveWithoutSaving()
                .filter(({ allowed }) => allowed)
                .cancelOnDestroy(this)
                .subscribe(() => {
                    if (category instanceof KalturaCategory) {
                        this._contentCategoryView.open({ category, section: ContentCategoryViewSections.Metadata });
                    } else {
                        this._contentCategoryView.openById(category, ContentCategoryViewSections.Metadata);
                    }
                });
        }
    }

	public returnToCategories(force = false) {

    	if (force)
	    {
		    this._categoryIsDirty = false;
		    this._updatePageExitVerification();
	    }

        this._contentCategoriesMainViewService.open();
	}
}


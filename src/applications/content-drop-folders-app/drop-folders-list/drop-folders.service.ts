import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { DropFolderListAction } from 'kaltura-typescript-client/types/DropFolderListAction';
import { KalturaDropFolderFilter } from 'kaltura-typescript-client/types/KalturaDropFolderFilter';
import { KalturaDropFolderOrderBy } from 'kaltura-typescript-client/types/KalturaDropFolderOrderBy';
import { KalturaDropFolderStatus } from 'kaltura-typescript-client/types/KalturaDropFolderStatus';
import { KalturaDropFolder } from 'kaltura-typescript-client/types/KalturaDropFolder';
import { KalturaDropFolderFileHandlerType } from 'kaltura-typescript-client/types/KalturaDropFolderFileHandlerType';
import { KalturaDropFolderContentFileHandlerConfig } from 'kaltura-typescript-client/types/KalturaDropFolderContentFileHandlerConfig';
import { KalturaDropFolderContentFileHandlerMatchPolicy } from 'kaltura-typescript-client/types/KalturaDropFolderContentFileHandlerMatchPolicy';
import { BrowserService } from 'app-shared/kmc-shell';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { DropFolderFileListAction } from 'kaltura-typescript-client/types/DropFolderFileListAction';
import { KalturaDropFolderFileFilter } from 'kaltura-typescript-client/types/KalturaDropFolderFileFilter';
import { KalturaDropFolderFileOrderBy } from 'kaltura-typescript-client/types/KalturaDropFolderFileOrderBy';
import { KalturaDropFolderFileStatus } from 'kaltura-typescript-client/types/KalturaDropFolderFileStatus';
import { KalturaFilterPager } from 'kaltura-typescript-client/types/KalturaFilterPager';
import { KalturaDropFolderFile } from 'kaltura-typescript-client/types/KalturaDropFolderFile';
import { BaseEntryGetAction } from 'kaltura-typescript-client/types/BaseEntryGetAction';
import { Observable } from 'rxjs/Observable';
import { KalturaUtils } from 'kaltura-typescript-client/utils/kaltura-utils';

export interface QueryData {
	pageIndex: number,
	pageSize: number,
	freeText: string,
	createdBefore: Date,
	createdAfter: Date,
	statuses: string[]
}

@Injectable()
export class DropFoldersService implements OnDestroy {
	private _dropFolders = new BehaviorSubject<{ items: KalturaDropFolderFile[], totalCount: number }>({
		items: [],
		totalCount: 0
	});
	private _state = new BehaviorSubject<{ loading: boolean, errorMessage?: string }>({loading: false});
	private _query = new BehaviorSubject<QueryData>({
		pageIndex: 1,
		pageSize: 50,
		freeText: '',
		createdBefore: null,
		createdAfter: null,
		statuses: null
	});
	ar: any[] = [];
	allStatusesList: string = KalturaDropFolderFileStatus.downloading + "," +
		KalturaDropFolderFileStatus.errorDeleting + "," +
		KalturaDropFolderFileStatus.errorDownloading + "," +
		KalturaDropFolderFileStatus.errorHandling + "," +
		KalturaDropFolderFileStatus.handled + "," +
		KalturaDropFolderFileStatus.noMatch + "," +
		KalturaDropFolderFileStatus.pending + "," +
		KalturaDropFolderFileStatus.processing + "," +
		KalturaDropFolderFileStatus.parsed + "," +
		KalturaDropFolderFileStatus.uploading + "," +
		KalturaDropFolderFileStatus.detected + "," +
		KalturaDropFolderFileStatus.waiting;

	dropFolders$ = this._dropFolders.asObservable();
	state$ = this._state.asObservable();
	query$ = this._query.monitor('queryData update');

	constructor(private _kalturaServerClient: KalturaClient,
	            private _browserService: BrowserService,
	            private _appLocalization: AppLocalization) {
		const defaultPageSize = this._browserService.getFromLocalStorage("dropFolders.list.pageSize");
		if (defaultPageSize !== null) {
			this._updateQueryData({
				pageSize: defaultPageSize
			});
		}
	}

	public reload(force: boolean): void;
	public reload(query: Partial<QueryData>): void;
	public reload(query: boolean | Partial<QueryData>): void {
		const forceReload = (typeof query === 'object' || (typeof query === 'boolean' && query));

		if (forceReload || this._dropFolders.getValue().totalCount === 0) {
			if (typeof query === 'object') {
				this._updateQueryData(query);
			}
			this._loadDropFoldersList();
		}
	}

	private _updateQueryData(partialData: Partial<QueryData>): void {
		const newQueryData = Object.assign({}, this._query.getValue(), partialData);
		this._query.next(newQueryData);

		if (partialData.pageSize) {
			this._browserService.setInLocalStorage("dropFolders.list.pageSize", partialData.pageSize);
		}
	}

	private _loadDropFoldersList(): void {
		this._state.next({loading: true});

		this._kalturaServerClient.request(
			new DropFolderListAction(
				{
					filter: new KalturaDropFolderFilter({
						orderBy: KalturaDropFolderOrderBy.createdAtDesc.toString(),
						statusEqual: KalturaDropFolderStatus.enabled
					}),
					acceptedTypes: [KalturaDropFolder, KalturaDropFolderContentFileHandlerConfig]
				}
			)
		)
			.cancelOnDestroy(this)
			.subscribe(
				response => {
					if (response.objects.length) {
						let df: KalturaDropFolder;

						this.ar = [];
						response.objects.forEach(object => {
							if (object instanceof KalturaDropFolder) {
								df = object;
								if (df.fileHandlerType.toString() === KalturaDropFolderFileHandlerType.content.toString()) {
									let cfg: KalturaDropFolderContentFileHandlerConfig = df.fileHandlerConfig as KalturaDropFolderContentFileHandlerConfig;
									if (cfg.contentMatchPolicy === KalturaDropFolderContentFileHandlerMatchPolicy.addAsNew) {
										this.ar.push(df);
									}
									else if (cfg.contentMatchPolicy === KalturaDropFolderContentFileHandlerMatchPolicy.matchExistingOrKeepInFolder) {
										this.ar.push(df);
									}
									else if (cfg.contentMatchPolicy === KalturaDropFolderContentFileHandlerMatchPolicy.matchExistingOrAddAsNew) {
										this.ar.push(df);
									}
								} else if (df.fileHandlerType === KalturaDropFolderFileHandlerType.xml) {
									this.ar.push(df);
								}
							}
						});

						if (!this.ar.length) {
							this._browserService.alert({
								message: this._appLocalization.get('applications.content.dropFolders.errors.dropFoldersAlert')
							})
						} else {
							this.loadDropFoldersFiles();
						}
					}
          this._state.next({loading: false});
				},
				error => {
					this._browserService.alert(
						{
							message: error.message
						}
					);
					this._state.next({loading: false});
				}
			);
	}

	loadDropFoldersFiles(): void {
		this._state.next({loading: true});

		let folderIds: String = '';
		this.ar.forEach(kdf => {
			folderIds += kdf.id + ",";
		});

		let _fileFilter = new KalturaDropFolderFileFilter();
		if (this._query.getValue().freeText) {
			_fileFilter.fileNameLike = this._query.getValue().freeText;
		}
		if (this._query.getValue().createdBefore) {
			_fileFilter.createdAtLessThanOrEqual = KalturaUtils.getEndDateValue(this._query.getValue().createdBefore);
		}
		if (this._query.getValue().createdAfter) {
			_fileFilter.createdAtGreaterThanOrEqual = KalturaUtils.getStartDateValue(this._query.getValue().createdAfter);
		}
		_fileFilter.orderBy = KalturaDropFolderFileOrderBy.createdAtDesc.toString();
		// use selected folder
		_fileFilter.dropFolderIdIn = folderIds.toString();
		_fileFilter.statusIn = this._query.getValue().statuses ? this._query.getValue().statuses.join(',') : this.allStatusesList;

		this._kalturaServerClient.request(
			new DropFolderFileListAction(
				{
					filter: _fileFilter,
					pager: new KalturaFilterPager({
						pageIndex: this._query.getValue().pageIndex,
						pageSize: this._query.getValue().pageSize
					})
				}
			)
		)
			.cancelOnDestroy(this)
			.subscribe(
				response => {
					this._state.next({loading: false});
					this._dropFolders.next({items: response.objects, totalCount: response.totalCount})
				},
				error => {
					this._state.next({loading: false, errorMessage: error.message});
				}
			);
	}

	_isEntryExist(entryId: string): Observable<void> {
		return Observable.create(observer => {
			this._kalturaServerClient.request(
				new BaseEntryGetAction(
					{
						entryId: entryId
					}
				)
			)
				.cancelOnDestroy(this)
				.subscribe(
					() => {
						observer.next();
						observer.complete();
					},
					error => {
						observer.error(error);
					}
				);
		});
	}

	ngOnDestroy() {
		this._state.complete();
		this._query.complete();
		this._dropFolders.complete();
	}
}


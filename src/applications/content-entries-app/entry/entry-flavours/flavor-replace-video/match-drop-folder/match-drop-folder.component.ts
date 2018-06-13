import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger/kaltura-logger.service';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui/area-blocker/area-blocker-message';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { KalturaClient } from 'kaltura-ngx-client';
import { TranscodingProfileManagement } from 'app-shared/kmc-shared/transcoding-profile-management';
import { AppLocalization } from '@kaltura-ng/mc-shared/localization/app-localization.service';
import { DropFolderListAction } from 'kaltura-ngx-client/api/types/DropFolderListAction';
import { KalturaDropFolderFilter } from 'kaltura-ngx-client/api/types/KalturaDropFolderFilter';
import { KalturaDropFolderOrderBy } from 'kaltura-ngx-client/api/types/KalturaDropFolderOrderBy';
import { KalturaDropFolderStatus } from 'kaltura-ngx-client/api/types/KalturaDropFolderStatus';
import { KalturaDropFolderContentFileHandlerConfig } from 'kaltura-ngx-client/api/types/KalturaDropFolderContentFileHandlerConfig';
import { KalturaDropFolder } from 'kaltura-ngx-client/api/types/KalturaDropFolder';
import { KalturaDropFolderContentFileHandlerMatchPolicy } from 'kaltura-ngx-client/api/types/KalturaDropFolderContentFileHandlerMatchPolicy';
import { KalturaDropFolderFileHandlerType } from 'kaltura-ngx-client/api/types/KalturaDropFolderFileHandlerType';
import { map, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { SelectItem } from 'primeng/api';
import { DropFolderFileListAction } from 'kaltura-ngx-client/api/types/DropFolderFileListAction';
import { KalturaDropFolderFileFilter } from 'kaltura-ngx-client/api/types/KalturaDropFolderFileFilter';
import { KalturaDropFolderFileOrderBy } from 'kaltura-ngx-client/api/types/KalturaDropFolderFileOrderBy';
import { KalturaDropFolderFileStatus } from 'kaltura-ngx-client/api/types/KalturaDropFolderFileStatus';
import { KalturaDropFolderFile } from 'kaltura-ngx-client/api/types/KalturaDropFolderFile';

@Component({
    selector: 'kReplaceMatchDropFolder',
    templateUrl: './match-drop-folder.component.html',
    styleUrls: ['./match-drop-folder.component.scss'],
    providers: [KalturaLogger.createLogger('MatchDropFolderComponent')]
})
export class MatchDropFolderComponent implements OnInit, OnDestroy {
    @Input() parentPopupWidget: PopupWidgetComponent;
    @Input() entry: KalturaMediaEntry;

    public _isLoading = false;
    public _blockerMessage: AreaBlockerMessage;
    public _dropFoldersList: KalturaDropFolder[] = [];
    public _dropFoldersListOptions: SelectItem[] = [];
    public _selectedDropFolder: number = null;

    constructor(private _kalturaClient: KalturaClient,
                private _transcodingProfileManagement: TranscodingProfileManagement,
                private _logger: KalturaLogger,
                private _appLocalization: AppLocalization) {

    }

    ngOnInit() {
        this._prepare();
    }

    ngOnDestroy() {

    }

    private _loadDropFolder(searchTerm: string = null): Observable<any> {
        const filter = new KalturaDropFolderFileFilter({
            orderBy: KalturaDropFolderFileOrderBy.createdAtDesc,
            dropFolderIdEqual: this._selectedDropFolder,
            statusIn: [
                KalturaDropFolderFileStatus.noMatch,
                KalturaDropFolderFileStatus.waiting,
                KalturaDropFolderFileStatus.errorHandling,
            ].join(',')
        });

        if (typeof searchTerm === 'string' && searchTerm.trim()) {
            filter.parsedSlugLike = searchTerm.trim();
        }

        const dropFolderFilesListAction = new DropFolderFileListAction({ filter });
        return this._kalturaClient.request(dropFolderFilesListAction)
            .pipe(
                map(response => {
                    let dropFolderFile: KalturaDropFolderFile;
                    const result = []; // results array
                    const dict = {}; // slugs dictionary
                    let group: KalturaDropFolderFile; // dffs group (by slug)
                    const parseFailedStr = '* Error '; // TODO should be localized

                    response.objects.forEach(file => {
                        if (file instanceof KalturaDropFolderFile) {
                            dropFolderFile = file as KalturaDropFolderFile;
                            // for files in status waiting, we only want files with a matching slug
                            if (dropFolderFile.status === KalturaDropFolderFileStatus.waiting
                                && dropFolderFile.parsedSlug !== this.entry.referenceId) {
                                return;
                            }
                            // group all files where status == ERROR_HANDLING under same group
                            if (dropFolderFile.status === KalturaDropFolderFileStatus.errorHandling) {
                                dropFolderFile.parsedSlug = parseFailedStr;
                            }
                            // get relevant group
                            if (!dict[dropFolderFile.parsedSlug]) {
                                // create group
                                group = new KalturaDropFolderFile();
                                group.parsedSlug = dropFolderFile.parsedSlug;
                                (<any>group).createdAt = dropFolderFile.createdAt;
                                (<any>group).files = [];
                                dict[group.parsedSlug] = group;
                            } else {
                                group = dict[dropFolderFile.parsedSlug];
                                // update date if needed
                                if (group.createdAt > dropFolderFile.createdAt) {
                                    (<any>group).createdAt = dropFolderFile.createdAt;
                                }
                            }
                            // add dff to files list
                            (<any>group).files.push(dropFolderFile);
                            // if any file in the group is in waiting status, set the group to waiting:
                            if (dropFolderFile.status === KalturaDropFolderFileStatus.waiting) {
                                (<any>group).status = KalturaDropFolderFileStatus.waiting;
                            }
                        }
                    });

                    let wait: KalturaDropFolderFile;
                    for (const slug in dict) {
                        if (dict.hasOwnProperty(slug) && slug !== parseFailedStr) {
                            if (dict[slug].status === KalturaDropFolderFileStatus.waiting) {
                                // we assume there's only one...
                                wait = dict[slug] as KalturaDropFolderFile;
                            } else {
                                result.push(dict[slug]);
                            }
                        }
                    }
                    // put the matched waiting file first
                    if (wait) {
                        result.unshift(wait);
                    }
                    // put the parseFailed last
                    if (dict[parseFailedStr]) {
                        result.push(dict[parseFailedStr]);
                    }
                    return result;
                })
            );
    }

    private _loadDropFoldersList(): Observable<void> {
        const dropFoldersListAction = new DropFolderListAction({
            filter: new KalturaDropFolderFilter({
                orderBy: KalturaDropFolderOrderBy.nameDesc,
                statusEqual: KalturaDropFolderStatus.enabled
            })
        });

        return this._kalturaClient.request(dropFoldersListAction)
            .cancelOnDestroy(this)
            .pipe(
                map(response => {
                    if (response.objects.length) {
                        let df: KalturaDropFolder;

                        const dropFoldersList = [];
                        response.objects.forEach(object => {
                            if (object instanceof KalturaDropFolder) {
                                df = object;
                                if (df.fileHandlerType === KalturaDropFolderFileHandlerType.content) {
                                    const cfg: KalturaDropFolderContentFileHandlerConfig = df.fileHandlerConfig as KalturaDropFolderContentFileHandlerConfig;
                                    if (cfg.contentMatchPolicy === KalturaDropFolderContentFileHandlerMatchPolicy.addAsNew) {
                                        dropFoldersList.push(df);
                                    } else if (cfg.contentMatchPolicy === KalturaDropFolderContentFileHandlerMatchPolicy.matchExistingOrKeepInFolder) {
                                        dropFoldersList.push(df);
                                    } else if (cfg.contentMatchPolicy === KalturaDropFolderContentFileHandlerMatchPolicy.matchExistingOrAddAsNew) {
                                        dropFoldersList.push(df);
                                    }
                                } else if (df.fileHandlerType === KalturaDropFolderFileHandlerType.xml) {
                                    dropFoldersList.push(df);
                                }
                            } else {
                                throw new Error(`invalid type provided, expected KalturaDropFolder, got ${typeof object}`);
                            }
                        });

                        return dropFoldersList;
                    } else {
                        return [];
                    }
                }),
                tap(dropFoldersList => {
                    this._dropFoldersList = dropFoldersList;
                    this._dropFoldersListOptions = dropFoldersList.map(folder => ({ label: folder.name, value: folder.id }));
                    this._selectedDropFolder = dropFoldersList.length ? dropFoldersList[0].id : null;
                }),
                switchMap(() => {
                    if (this._selectedDropFolder === null) {
                        return Observable.of(null);
                    }

                    return this._loadDropFolder();
                })
            );
    }

    private _prepare(): void {
        this._isLoading = true;
        this._loadDropFoldersList()
            .subscribe(
                (res) => {
                    this._isLoading = false;
                    console.warn(res);
                },
                error => {
                    this._isLoading = false;
                    // TODO handle retry
                });
    }

    public _loadFolderData(): void {
        this._isLoading = true;
        this._loadDropFolder()
            .cancelOnDestroy(this)
            .subscribe(res => {
                this._isLoading = false;
                console.warn(res);
            });
    }
}

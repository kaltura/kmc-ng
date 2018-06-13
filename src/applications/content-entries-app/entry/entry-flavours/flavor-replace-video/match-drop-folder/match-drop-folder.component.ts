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
import { Observable } from 'rxjs/Observable';
import { SelectItem } from 'primeng/api';
import { DropFolderFileListAction } from 'kaltura-ngx-client/api/types/DropFolderFileListAction';
import { KalturaDropFolderFileFilter } from 'kaltura-ngx-client/api/types/KalturaDropFolderFileFilter';
import { KalturaDropFolderFileOrderBy } from 'kaltura-ngx-client/api/types/KalturaDropFolderFileOrderBy';
import { KalturaDropFolderFileStatus } from 'kaltura-ngx-client/api/types/KalturaDropFolderFileStatus';
import { KalturaDropFolderFile } from 'kaltura-ngx-client/api/types/KalturaDropFolderFile';

export interface KalturaDropFolderFileGroup extends KalturaDropFolderFile {
    files?: KalturaDropFolderFile[];
    name?: string;
    displayName?: string;
}

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
    public _dropFolderFiles = [];
    public _selectedFile: any;

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

    private _getDisplayName(file: KalturaDropFolderFileGroup): string {
        let displayName: string;
        if (file.files) {
            displayName = `${file.parsedSlug} (${file.files.length}`;
            if (file.status === KalturaDropFolderFileStatus.waiting) {
                displayName += `, ${this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.waiting')}`;
            }
            displayName += ')';
        } else if (file.name) {
            displayName = file.name;
        } else {
            displayName = file.fileName;
        }

        return displayName;
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
            .map(response => {
                const result = []; // results array
                const dict = {}; // slugs dictionary
                let group: KalturaDropFolderFile; // dffs group (by slug)
                const parseFailedStr = this._appLocalization.get('applications.content.entryDetails.flavours.replaceVideo.error');

                response.objects.forEach(file => {
                    if (file instanceof KalturaDropFolderFile) {
                        // for files in status waiting, we only want files with a matching slug
                        if (file.status === KalturaDropFolderFileStatus.waiting && file.parsedSlug !== this.entry.referenceId) {
                            return;
                        }

                        // group all files where status == ERROR_HANDLING under same group
                        if (file.status === KalturaDropFolderFileStatus.errorHandling) {
                            file.parsedSlug = parseFailedStr;
                        }

                        // get relevant group
                        if (!dict[file.parsedSlug]) {
                            // create group
                            group = new KalturaDropFolderFile();
                            group.parsedSlug = file.parsedSlug;
                            (<any>group).createdAt = file.createdAt;
                            (<KalturaDropFolderFileGroup>group).files = [];
                            dict[group.parsedSlug] = group;
                        } else {
                            group = dict[file.parsedSlug];
                            // update date if needed
                            if (group.createdAt > file.createdAt) {
                                (<any>group).createdAt = file.createdAt;
                            }
                        }

                        // add dff to files list
                        (<KalturaDropFolderFileGroup>group).files.push(file);

                        // if any file in the group is in waiting status, set the group to waiting:
                        if (file.status === KalturaDropFolderFileStatus.waiting) {
                            (<any>group).status = KalturaDropFolderFileStatus.waiting;
                        }
                    }
                });

                let wait: KalturaDropFolderFile;
                for (const slug in dict) {
                    if (dict.hasOwnProperty(slug) && slug !== parseFailedStr) {
                        if (dict[slug].status === KalturaDropFolderFileStatus.waiting) {
                            // we assume there's only one...
                            wait = dict[slug];
                        } else {
                            (<KalturaDropFolderFileGroup>dict[slug]).displayName = this._getDisplayName(dict[slug]);
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
                    (<KalturaDropFolderFileGroup>dict[parseFailedStr]).displayName = this._getDisplayName(dict[parseFailedStr]);
                    result.push(dict[parseFailedStr]);
                }

                return result;
            });
    }

    private _loadDropFoldersList(): Observable<any> {
        const dropFoldersListAction = new DropFolderListAction({
            filter: new KalturaDropFolderFilter({
                orderBy: KalturaDropFolderOrderBy.nameDesc,
                statusEqual: KalturaDropFolderStatus.enabled
            })
        });

        return this._kalturaClient.request(dropFoldersListAction)
            .cancelOnDestroy(this)
            .map(response => {
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
                            }
                        } else {
                            throw new Error(`invalid type provided, expected KalturaDropFolder, got ${typeof object}`);
                        }
                    });

                    return dropFoldersList;
                } else {
                    return [];
                }
            })
            .do(dropFoldersList => {
                this._dropFoldersList = dropFoldersList;
                this._dropFoldersListOptions = dropFoldersList.map(folder => ({ label: folder.name, value: folder.id }));
                this._selectedDropFolder = dropFoldersList.length ? dropFoldersList[0].id : null;
            })
            .switchMap(() => {
                if (this._selectedDropFolder === null) {
                    return Observable.of(null);
                }

                return this._loadDropFolder();
            });
    }

    private _prepare(): void {
        this._isLoading = true;
        this._loadDropFoldersList()
            .subscribe(
                (res) => {
                    this._isLoading = false;
                    this._dropFolderFiles = res;
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
            .subscribe(
                res => {
                    this._isLoading = false;
                    this._dropFolderFiles = res;
                    console.warn(res);
                }, error => {
                    this._isLoading = false;
                    // TODO handle retry
                });
    }
}

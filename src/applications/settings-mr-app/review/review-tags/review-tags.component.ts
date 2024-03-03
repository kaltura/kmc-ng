import {Component, EventEmitter, OnDestroy, OnInit, Output, Input} from '@angular/core';
import {AppLocalization} from '@kaltura-ng/mc-shared';
import {ISubscription} from 'rxjs/Subscription';
import {DatePipe} from 'app-shared/kmc-shared/date-format/date.pipe';
import {BrowserService} from 'app-shared/kmc-shell';

export interface TagItem {
    type: string,
    value: any,
    label: string,
    tooltip: string,
    dataFetchSubscription?: ISubscription
}

@Component({
    selector: 'k-review-tags',
    templateUrl: './review-tags.component.html',
    styleUrls: ['./review-tags.component.scss']

})
export class ReviewTagsComponent implements OnInit, OnDestroy {
    @Output() onTagRemoved = new EventEmitter<string>();
    @Output() onAllTagsRemoved = new EventEmitter();

    public _filterTags: TagItem[] = [];

    constructor(private _appLocalization: AppLocalization, private _browserService: BrowserService) {
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    public updateTags(query: any, customTooltip=''): void {
        this._syncTagOfFreetext(query);
        this._syncTagOfCreatedAt(query);
        this._syncTagOfActionAt(query);
        this._syncTagOfMediaType(query);
        this._syncTagOfOwner(query);
        this._syncTagOfDuration(query);
        this._syncTagOfStatus(query);
        this._syncTagOfRules(query, customTooltip);
    }

    private _syncTagOfFreetext(query: any): void {
        const previousItem = this._filterTags.findIndex(item => item.type === 'objectName');
        if (previousItem !== -1) {
            this._filterTags.splice(
                previousItem,
                1);
        }

        if (query['objectName']) {
            this._filterTags.push({
                type: 'objectName',
                value: query['objectName'],
                label: query['objectName'],
                tooltip: this._appLocalization.get(`applications.content.filters.freeText`)
            });
        }
    }

    private _syncTagOfCreatedAt(query: any): void {
        const previousItem = this._filterTags.findIndex(item => item.type === 'createdAt');
        if (previousItem !== -1) {
            this._filterTags.splice(previousItem, 1);
        }

        const {createdAtGreaterThanOrEqual, createdAtLessThanOrEqual} = query;
        if (createdAtGreaterThanOrEqual || createdAtLessThanOrEqual) {
            let tooltip = '';
            if (createdAtGreaterThanOrEqual && createdAtLessThanOrEqual) {
                tooltip = `${(new DatePipe(this._browserService)).transform(new Date(createdAtGreaterThanOrEqual).getTime(), 'longDateOnly')} - ${(new DatePipe(this._browserService)).transform(new Date(createdAtLessThanOrEqual).getTime(), 'longDateOnly')}`;
            } else if (createdAtGreaterThanOrEqual) {
                tooltip = `From ${(new DatePipe(this._browserService)).transform(new Date(createdAtGreaterThanOrEqual).getTime(), 'longDateOnly')}`;
            } else if (createdAtLessThanOrEqual) {
                tooltip = `Until ${(new DatePipe(this._browserService)).transform(new Date(createdAtLessThanOrEqual).getTime(), 'longDateOnly')}`;
            }
            this._filterTags.push({type: 'createdAt', value: null, label: 'Added between', tooltip});
        }
    }

    private _syncTagOfActionAt(query: any): void {
        const previousItem = this._filterTags.findIndex(item => item.type === 'actionAt');
        if (previousItem !== -1) {
            this._filterTags.splice(previousItem, 1);
        }

        const {plannedExecutionTimeLessThanOrEqual, plannedExecutionTimeGreaterThanOrEqual} = query;
        if (plannedExecutionTimeGreaterThanOrEqual || plannedExecutionTimeLessThanOrEqual) {
            let tooltip = '';
            if (plannedExecutionTimeGreaterThanOrEqual && plannedExecutionTimeLessThanOrEqual) {
                tooltip = `${(new DatePipe(this._browserService)).transform(new Date(plannedExecutionTimeGreaterThanOrEqual).getTime(), 'longDateOnly')} - ${(new DatePipe(this._browserService)).transform(new Date(plannedExecutionTimeLessThanOrEqual).getTime(), 'longDateOnly')}`;
            } else if (plannedExecutionTimeGreaterThanOrEqual) {
                tooltip = `From ${(new DatePipe(this._browserService)).transform(new Date(plannedExecutionTimeGreaterThanOrEqual).getTime(), 'longDateOnly')}`;
            } else if (plannedExecutionTimeLessThanOrEqual) {
                tooltip = `Until ${(new DatePipe(this._browserService)).transform(new Date(plannedExecutionTimeLessThanOrEqual).getTime(), 'longDateOnly')}`;
            }
            this._filterTags.push({type: 'actionAt', value: null, label: 'Action between', tooltip});
        }
    }

    private _syncTagOfMediaType(query: any): void {
        const previousItem = this._filterTags.findIndex(item => item.type === 'mediaType');
        if (previousItem !== -1) {
            this._filterTags.splice(previousItem, 1);
        }
        if (query.objectSubTypeIn) {
            let tooltip = '';
            if (query.objectSubTypeIn.indexOf("1") > -1) {
                tooltip = 'Video';
            }
            if (query.objectSubTypeIn.indexOf("2") > -1) {
                tooltip += ', Image';
            }
            if (query.objectSubTypeIn.indexOf("5") > -1) {
                tooltip += ', Audio';
            }
            if (query.objectSubTypeIn.indexOf("201") > -1) {
                tooltip += ', Live';
            }
            if (tooltip.indexOf(', ') === 0) {
                tooltip = tooltip.substring(2, tooltip.length);
            }
            this._filterTags.push({type: 'mediaType', value: null, label: 'Media Type', tooltip});
        }
    }

    private _syncTagOfOwner(query: any): void {
        const previousItem = this._filterTags.findIndex(item => item.type === 'owner');
        if (previousItem !== -1) {
            this._filterTags.splice(previousItem, 1);
        }
        if (query.ownerIdIn && query.ownerIdIn.length) {
            let tooltip = '';
            query.ownerIdIn.forEach(owner => tooltip += owner + ', ');
            if (tooltip.length) {
                tooltip = tooltip.substring(0, tooltip.length -2);
            }
            this._filterTags.push({type: 'owner', value: null, label: 'Owner', tooltip});
        }
    }

    private _syncTagOfStatus(query: any): void {
        const previousItem = this._filterTags.findIndex(item => item.type === 'status');
        if (previousItem !== -1) {
            this._filterTags.splice(previousItem, 1);
        }
        if (query.statusIn) {
            let tooltip = '';
            if (query.statusIn.indexOf("auto") > -1) {
                tooltip = 'Auto';
            }
            if (query.statusIn.indexOf("pendingApproval") > -1) {
                tooltip += ', Pending approval';
            }
            if (query.statusIn.indexOf("rejected") > -1) {
                tooltip += ', Rejected';
            }
            if (query.statusIn.indexOf("approved") > -1) {
                tooltip += ', Approved';
            }
            if (tooltip.indexOf(', ') === 0) {
                tooltip = tooltip.substring(2, tooltip.length);
            }
            this._filterTags.push({type: 'status', value: null, label: 'Approval status', tooltip});
        }
    }

    private _syncTagOfRules(query: any, customTooltip = ''): void {
        const previousItem = this._filterTags.findIndex(item => item.type === 'rules');
        if (previousItem !== -1) {
            this._filterTags.splice(previousItem, 1);
        }
        if (query.managedTasksProfileIdIn) {
            this._filterTags.push({type: 'rules', value: null, label: 'Rules', tooltip: customTooltip});
        }
    }

    private _syncTagOfDuration(query: any): void {
        let tooltip = '';
        const previousItem = this._filterTags.findIndex(item => item.type === 'duration');
        if (previousItem !== -1) {
            this._filterTags.splice(previousItem, 1);
        }
        if (typeof query.objectDurationLessThan !== "undefined" && typeof query.objectDurationGreaterThan !== "undefined") {
            tooltip = `Shorter than: ${query.objectDurationLessThan} seconds\nLonger than: ${query.objectDurationGreaterThan} seconds`;
        } else if (typeof query.objectDurationLessThan !== "undefined") {
            tooltip = `Shorter than: ${query.objectDurationLessThan} seconds`;
        } else if (typeof query.objectDurationGreaterThan !== "undefined"){
            tooltip = `Longer than: ${query.objectDurationGreaterThan} seconds`;
        }
        if (tooltip.length) {
            this._filterTags.push({type: 'duration', value: null, label: 'Duration', tooltip});
        }
    }

    public onTagsChange(event): void {
        // handle layout changes if needed
    }

    public removeTag(tag: any): void {
        const previousItem = this._filterTags.findIndex(item => item.type === tag.type);
        if (previousItem !== -1) {
            this._filterTags.splice(
                previousItem,
                1);
        }
        this.onTagRemoved.emit(tag.type);
    }

    public removeAllTags(): void {
        this._filterTags = [];
        this.onAllTagsRemoved.emit();
    }
}


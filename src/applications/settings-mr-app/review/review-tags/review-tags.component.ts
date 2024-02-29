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

    public updateTags(query: any): void {
        this._syncTagOfFreetext(query);
        this._syncTagOfCreatedAt(query);
        this._syncTagOfActionAt(query);
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


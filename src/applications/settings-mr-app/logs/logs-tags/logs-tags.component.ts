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
    selector: 'k-logs-tags',
    templateUrl: './logs-tags.component.html',
    styleUrls: ['./logs-tags.component.scss']

})
export class LogsTagsComponent implements OnInit, OnDestroy {
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
        this._syncTagOfCreatedAt(query);
        this._syncTagOfType(query);
        this._syncTagOfRules(query, customTooltip);
    }

    private _syncTagOfCreatedAt(query: any): void {
        const previousItem = this._filterTags.findIndex(item => item.type === 'createdAt');
        if (previousItem !== -1) {
            this._filterTags.splice(previousItem, 1);
        }

        const {requestedDateGreaterThanOrEqual, requestedDateLessThanOrEqual} = query;
        if (requestedDateGreaterThanOrEqual || requestedDateLessThanOrEqual) {
            let tooltip = '';
            if (requestedDateGreaterThanOrEqual && requestedDateLessThanOrEqual) {
                tooltip = `${(new DatePipe(this._browserService)).transform(new Date(requestedDateGreaterThanOrEqual).getTime(), 'longDateOnly')} - ${(new DatePipe(this._browserService)).transform(new Date(requestedDateLessThanOrEqual).getTime(), 'longDateOnly')}`;
            } else if (requestedDateGreaterThanOrEqual) {
                tooltip = `From ${(new DatePipe(this._browserService)).transform(new Date(requestedDateGreaterThanOrEqual).getTime(), 'longDateOnly')}`;
            } else if (requestedDateLessThanOrEqual) {
                tooltip = `Until ${(new DatePipe(this._browserService)).transform(new Date(requestedDateLessThanOrEqual).getTime(), 'longDateOnly')}`;
            }
            this._filterTags.push({type: 'createdAt', value: null, label: 'Date', tooltip});
        }
    }

    private _syncTagOfType(query: any): void {
        const previousItem = this._filterTags.findIndex(item => item.type === 'type');
        if (previousItem !== -1) {
            this._filterTags.splice(previousItem, 1);
        }
        if (query.typeIn) {
            let tooltip = '';
            if (query.typeIn.indexOf("watchProfileResults") > -1) {
                tooltip = this._appLocalization.get('applications.settings.mr.report.scan');
            }
            if (query.typeIn.indexOf("profileDryRun") > -1) {
                tooltip += `, ${this._appLocalization.get('applications.settings.mr.report.test')}`;
            }
            if (query.typeIn.indexOf("executionSummary") > -1) {
                tooltip += `, ${this._appLocalization.get('applications.settings.mr.report.action')}`;
            }
            if (tooltip.indexOf(', ') === 0) {
                tooltip = tooltip.substring(2, tooltip.length);
            }
            this._filterTags.push({type: 'type', value: null, label: 'Type', tooltip});
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


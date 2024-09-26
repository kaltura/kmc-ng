import { Component, OnDestroy, OnInit } from '@angular/core';
import {EntryCaptionsWidget, StreamContainer} from './entry-captions-widget.service';
import { ReachAppViewService, ReachPages } from 'app-shared/kmc-shared/kmc-views/details-views';
import {KMCPermissions} from 'app-shared/kmc-shared/kmc-permissions';
import {KalturaLiveStreamEntry, KalturaStreamContainer} from 'kaltura-ngx-client';
import {cancelOnDestroy} from '@kaltura-ng/kaltura-common';
import {SelectItem} from 'primeng/api';
import {LanguageOptionsService} from 'app-shared/kmc-shared/language-options';

export enum LiveCaptionsType {
    Reach = 0,
    UserIngested = 1
}

@Component({
    selector: 'kEntryLiveCaptions',
    templateUrl: './entry-live-captions.component.html',
    styleUrls: ['./entry-live-captions.component.scss'],
    providers: [LanguageOptionsService]
})
export class EntryLiveCaptions implements OnInit, OnDestroy {
    public _liveCaptionsType = LiveCaptionsType;
    public _captionsType = null;
    public _requestCaptionsAvailable = true;

    public _specialCharacters = false;
    public _containers: StreamContainer[] = [];
    public _addStreamDisabled = false;
    public _languages = [];
    public _protocols: SelectItem[] = [
        {
            'label': 'CEA-608',
            'value': 'CEA-608'
        },
        {
            'label': 'CEA-708',
            'value': 'CEA-708'
        }
    ];

    constructor(public _widgetService: EntryCaptionsWidget,
                private _languageOptions: LanguageOptionsService,
                private _reachAppViewService: ReachAppViewService) {
    }

    ngOnInit() {
        this._languages = this._languageOptions.get();
        this._widgetService.attachForm();
        this._widgetService.data$
            .pipe(cancelOnDestroy(this))
            .subscribe(entry => {
                this._requestCaptionsAvailable = this._reachAppViewService.isAvailable({ page: ReachPages.entry, entry });
                this._captionsType = entry.adminTags?.indexOf('prioritize_ingested_captions') > -1 ? LiveCaptionsType.UserIngested : LiveCaptionsType.Reach;
                this._specialCharacters = entry.adminTags?.indexOf('extract_closed_caption_feature') > -1;
                let streams = (entry as KalturaLiveStreamEntry).streams.filter(stream => stream.type === 'closedCaptions');
                if (streams?.length) {
                    this._containers = [];
                    streams = streams.sort((a, b) => a.id.localeCompare(b.id)); // sort by ID
                    streams.forEach(stream => {
                        this._containers.push({
                            id: stream.id,
                            protocol: stream.id.startsWith('CC') ? 'CEA-608' : 'CEA-708',
                            language: stream.language.toUpperCase(),
                            label: stream.label
                        })
                    })
                    this.setAddStreamDisabled();
                }
            });
    }

    ngOnDestroy() {
        this._widgetService.detachForm();
    }

    public onCaptionTypeChange(): void {
        this._widgetService.liveCaptions.adminTag = this._captionsType !== LiveCaptionsType.Reach ? 'prioritize_ingested_captions' : '';
        if (this._specialCharacters && this._widgetService.liveCaptions.adminTag.length) {
            this._widgetService.liveCaptions.adminTag += ',extract_closed_caption_feature';
        }
        this._widgetService.setDirty();
    }

    public onSpecialCharactersChange(): void {
        const specialCharacters = this._specialCharacters ? ['extract_closed_caption_feature'] : [];
        if (this._specialCharacters) {
            this._widgetService.liveCaptions.adminTag = this._widgetService.liveCaptions.adminTag.split(',').concat(['extract_closed_caption_feature']).join(',');
        } else {
            this._widgetService.liveCaptions.adminTag = this._widgetService.liveCaptions.adminTag.split(',').filter(tag => tag !== 'extract_closed_caption_feature').join(',');
        }
        this._widgetService.setDirty();
    }

    public _requestCaptions(): void {
        const entry = this._widgetService.data;
        this._reachAppViewService.open({ entry, page: ReachPages.entry });
    }

    public addStream() {
        const ccStreams = this._containers.filter(container => container.id.startsWith('CC'));
        const serviceStreams = this._containers.filter(container => container.id.startsWith('SERVICE'));
        const newContainer: StreamContainer = {
            id: ccStreams.length < 4 ? `CC${ccStreams.length + 1}` : `SERVICE${serviceStreams.length + 1}`,
            protocol: ccStreams.length < 4 ? 'CEA-608' : 'CEA-708',
            language: 'EN',
            label: 'English'
        }
        this._containers.push(newContainer);
        this.setAddStreamDisabled();
        this.onStreamUpdated();
    }

    public removeContainer(id: string): void {
        this._containers = this._containers.filter(container => container.id !== id);
        this._widgetService.setDirty();
        // update widget with the updated streams
        this.onStreamUpdated();
    }

    public onLanguageUpdated(container: StreamContainer): void {
        container.label = this._languages.find(language => language.value === container.language)?.label || container.label;
        this.onStreamUpdated();
    }

    public onStreamUpdated(): void {
        const ccStreams = this._containers.filter(container => container.protocol === 'CEA-608');
        const serviceStreams = this._containers.filter(container => container.protocol === 'CEA-708');
        // validation
        this._widgetService._protocolError = '';
        if (ccStreams.length > 4) {
            this._widgetService._protocolError = '608';
        } else if (serviceStreams.length > 63) {
            this._widgetService._protocolError = '708';
        }
        this._widgetService.validate();
        // update IDs
        let counter = 1;
        ccStreams.forEach(container => {
            container.id = `CC${counter}`;
            counter++;
        })
        serviceStreams.forEach(container => {
            container.id = `SERVICE${counter}`;
            counter++;
        })
        // update widget with the updated streams
        this.updateEntryStreams();
    }

    private updateEntryStreams(): void {
        // update widget with the correct streams
        this._widgetService.liveCaptions.streams = [];
        this._containers.forEach(container => this._widgetService.liveCaptions.streams.push(new KalturaStreamContainer({
            id: container.id,
            language: container.language.toLowerCase(),
            label: container.label,
            type: 'closedCaptions'
        })))
    }

    private setAddStreamDisabled(): void {
        const ccStreams = this._containers.filter(container => container.id.startsWith('CC'));
        const serviceStreams = this._containers.filter(container => container.id.startsWith('SERVICE'));
        this._addStreamDisabled = ccStreams.length > 3 && serviceStreams.length > 62;
    }

    protected readonly _kmcPermissions = KMCPermissions;
}


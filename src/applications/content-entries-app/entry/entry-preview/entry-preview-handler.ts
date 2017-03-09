import { Injectable, OnDestroy } from '@angular/core';
import { EntrySectionHandler } from '../../entry-store/entry-section-handler';
import { ISubscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EntryStore } from '../../entry-store/entry-store.service';
import { EntryLoaded, EntryLoading } from '../../entry-store/entry-sections-events';
import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import { KalturaRequest } from '@kaltura-ng2/kaltura-api';

import { AppConfig, AppAuthentication } from '@kaltura-ng2/kaltura-common';

@Injectable()
export class EntryPreviewHandler extends EntrySectionHandler
{
    private _eventSubscription : ISubscription;
    private _previewEntryId : BehaviorSubject<string> = new BehaviorSubject<string>(null);
    public previewEntryId$ : Observable<string> = this._previewEntryId.asObservable();

	public _landingPage: string;
	public _iFrameSrc: string;

    constructor(store : EntryStore,
                kalturaServerClient: KalturaServerClient,
                private appConfig: AppConfig,
                private appAuthentication: AppAuthentication)

    {
        super(store,kalturaServerClient);

        this._eventSubscription = store.events$.subscribe(
            event =>
            {
                if (event instanceof EntryLoading)
                {
                    this._previewEntryId.next(event.entryId);
	                this._landingPage = this.appAuthentication.appUser.partnerInfo.landingPage;
	                if (this._landingPage) {
		                this._landingPage.replace("{entryId}", event.entryId);
	                }

	                const UIConfID = this.appConfig.get('core.kaltura.previewUIConf');
	                const partnerID = this.appAuthentication.appUser.partnerId;
	                this._iFrameSrc = this.appConfig.get('core.kaltura.cdnUrl') + '/p/' + partnerID + '/sp/' + partnerID + '00/embedIframeJs/uiconf_id/' + UIConfID + '/partner_id/' + partnerID + '?iframeembed=true&flashvars[EmbedPlayer.SimulateMobile]=true&&flashvars[EmbedPlayer.EnableMobileSkin]=true&entry_id=' + event.entryId;

                }
            }
        );
    }

    public get sectionType() : EntrySectionTypes
    {
        return null;
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
    _resetSection()
    {
        this._eventSubscription.unsubscribe();
        this._previewEntryId.complete();
    }

    protected _onSectionLoading(data: {entryId: string; requests: KalturaRequest<any>[]}) {
        return undefined;
    }
}
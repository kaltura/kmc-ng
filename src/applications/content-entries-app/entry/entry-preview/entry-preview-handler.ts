import { Injectable, OnDestroy } from '@angular/core';
import {
    EntrySectionHandler, OnSectionLoadedArgs,
    OnEntryLoadingArgs
} from '../../entry-store/entry-section-handler';
import { ISubscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EntryStore } from '../../entry-store/entry-store.service';
import { EntryLoaded, EntryLoading } from '../../entry-store/entry-sections-events';
import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import { KalturaRequest } from '@kaltura-ng2/kaltura-api';

import { AppConfig, AppAuthentication } from '@kaltura-ng2/kaltura-common';

export interface PreviewEntryData{
    landingPage : string;
    iFrameSrc : string;
}

@Injectable()
export class EntryPreviewHandler extends EntrySectionHandler
{
    public landingPage : string;
    public iframeSrc : string;

    constructor(store : EntryStore,
                kalturaServerClient: KalturaServerClient,
                private appConfig: AppConfig,
                private appAuthentication: AppAuthentication)

    {
        super(store, kalturaServerClient);
    }

    public get sectionType() : EntrySectionTypes
    {
        return null;
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
    protected _onSectionReset()
    {
        this.landingPage = null;
        this.iframeSrc = null;
    }

    protected _onEntryLoading(data : OnEntryLoadingArgs) {
        const landingPage = this.appAuthentication.appUser.partnerInfo.landingPage;
        if (landingPage) {
            landingPage.replace("{entryId}", data.entryId);
        }
        this.landingPage = landingPage;

        const UIConfID = this.appConfig.get('core.kaltura.previewUIConf');
        const partnerID = this.appAuthentication.appUser.partnerId;
        this.iframeSrc = this.appConfig.get('core.kaltura.cdnUrl') + '/p/' + partnerID + '/sp/' + partnerID + '00/embedIframeJs/uiconf_id/' + UIConfID + '/partner_id/' + partnerID + '?iframeembed=true&flashvars[EmbedPlayer.SimulateMobile]=true&&flashvars[EmbedPlayer.EnableMobileSkin]=true&entry_id=' + data.entryId;
    }

    protected _onSectionLoaded(data : OnSectionLoadedArgs) {
      // do nothing
    }
}
import { Injectable, OnDestroy } from '@angular/core';
import {
    FormSectionHandler,
    OnDataLoadingArgs, ActivateArgs
} from '../../entry-store/form-section-handler';
import { ISubscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EntryStore } from '../../entry-store/entry-store.service';
import { EntryLoaded, EntryLoading } from '../../entry-store/entry-sections-events';
import { EntrySectionTypes } from '../../entry-store/entry-sections-types';
import { KalturaServerClient } from '@kaltura-ng2/kaltura-api';
import { KalturaRequest } from '@kaltura-ng2/kaltura-api';

import { AppConfig, AppAuthentication } from '@kaltura-ng2/kaltura-common';
import { FormSectionsManager } from '../../entry-store/form-sections-manager';

export interface PreviewEntryData{
    landingPage : string;
    iFrameSrc : string;
}

@Injectable()
export class EntryPreviewHandler extends FormSectionHandler
{
    public landingPage : string;
    public iframeSrc : string;

    constructor(manager : FormSectionsManager,
                kalturaServerClient: KalturaServerClient,
                private appConfig: AppConfig,
                private appAuthentication: AppAuthentication)

    {
        super(manager, kalturaServerClient);
    }

    public get sectionType() : EntrySectionTypes
    {
        return null;
    }

    /**
     * Do some cleanups if needed once the section is removed
     */
    protected reset()
    {
        this.landingPage = null;
        this.iframeSrc = null;
    }

    protected _onDataLoading(data : OnDataLoadingArgs) {
        const landingPage = this.appAuthentication.appUser.partnerInfo.landingPage;
        if (landingPage) {
            landingPage.replace("{entryId}", data.entryId);
        }
        this.landingPage = landingPage;

        const UIConfID = this.appConfig.get('core.kaltura.previewUIConf');
        const partnerID = this.appAuthentication.appUser.partnerId;
        this.iframeSrc = this.appConfig.get('core.kaltura.cdnUrl') + '/p/' + partnerID + '/sp/' + partnerID + '00/embedIframeJs/uiconf_id/' + UIConfID + '/partner_id/' + partnerID + '?iframeembed=true&flashvars[EmbedPlayer.SimulateMobile]=true&&flashvars[EmbedPlayer.EnableMobileSkin]=true&entry_id=' + data.entryId;
    }

    protected _activate(args : ActivateArgs) {
      // do nothing
    }
}
import { Injectable, OnDestroy } from '@angular/core';
import { KalturaClient } from 'kaltura-ngx-client';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { subApplicationsConfig } from 'config/sub-applications';
import { KalturaMediaEntry } from 'kaltura-ngx-client/api/types/KalturaMediaEntry';
import { KalturaSourceType } from 'kaltura-ngx-client/api/types/KalturaSourceType';
import { PreviewMetadataChangedEvent } from '../../preview-metadata-changed-event';
import { AppEventsService } from 'app-shared/kmc-shared';
import { EntryWidget } from '../entry-widget';

@Injectable()
export class EntryPreviewWidget extends EntryWidget implements OnDestroy
{
    public _iframeSrc : string;
    private _urlHash: number = 0;

    constructor(kalturaServerClient: KalturaClient, private appAuthentication: AppAuthentication, appEvents: AppEventsService) {
        super('entryPreview');


        appEvents.event(PreviewMetadataChangedEvent)
            .cancelOnDestroy(this)
            .subscribe(({entryId}) =>
            {
                if (this.data && this.data.id === entryId)
                {
                    this._iframeSrc = this._createUrl();
                }
            });
    }
    
    /**
     * Do some cleanups if needed once the section is removed
     */
    protected onReset()
    {
        // DEVELOPER NOTICE: don't reset _urlHash to support refresh after saving
    }

    ngOnDestroy()
    {}

    private _createUrl(): string {

        let result = "";

        // create preview embed code
        if (this.data) {
            const entryId = this.data.id;
            const sourceType = this.data.sourceType.toString();
            const isLive = (sourceType === KalturaSourceType.liveStream.toString() ||
                sourceType === KalturaSourceType.akamaiLive.toString() ||
                sourceType === KalturaSourceType.akamaiUniversalLive.toString() ||
                sourceType === KalturaSourceType.manualLiveStream.toString());

            const UIConfID = subApplicationsConfig.core.kaltura.previewUIConf;
            const partnerID = this.appAuthentication.appUser.partnerId;
            const ks = this.appAuthentication.appUser.ks || "";

            let flashVars = `flashvars[closedCaptions.plugin]=true&flashvars[ks]=${ks}`;
            if (isLive) {
                flashVars += '&flashvars[disableEntryRedirect]=true';
            }

            this._urlHash = this._urlHash + 1;

            result = `${subApplicationsConfig.core.kaltura.cdnUrl}/p/${partnerID}/sp/${partnerID}00/embedIframeJs/uiconf_id/${UIConfID}/partner_id/${partnerID}?iframeembed=true&${flashVars}&entry_id=${entryId}&hash=${this._urlHash}`;
        }

        return result;
    }
    protected onActivate(firstTimeActivating: boolean) {
	    this._iframeSrc = this._createUrl();
    }


}

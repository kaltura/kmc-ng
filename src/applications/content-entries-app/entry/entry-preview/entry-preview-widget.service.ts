import { Injectable, OnDestroy } from '@angular/core';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { environment } from 'app-environment';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { KalturaSourceType } from 'kaltura-typescript-client/types/KalturaSourceType';
import { PreviewMetadataChangedEvent } from '../../preview-metadata-changed-event';
import { AppEventsService } from 'app-shared/kmc-shared';
import { EntryWidget } from '../entry-widget';

@Injectable()
export class EntryPreviewWidget extends EntryWidget implements OnDestroy
{
    public iframeSrc : string;
    private _urlHash: number = 0;

    constructor(kalturaServerClient: KalturaClient, private appAuthentication: AppAuthentication, appEvents: AppEventsService) {
        super('entryPreview');


        appEvents.event(PreviewMetadataChangedEvent)
            .cancelOnDestroy(this)
            .subscribe(({entryId}) =>
            {
                if (this.data && this.data.id === entryId)
                {
                    this.iframeSrc = this._createUrl();
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

            const UIConfID = environment.core.kaltura.previewUIConf;
            const partnerID = this.appAuthentication.appUser.partnerId;
            const ks = this.appAuthentication.appUser.ks || "";

            let flashVars = `flashvars[closedCaptions.plugin]=true&flashvars[EmbedPlayer.SimulateMobile]=true&&flashvars[ks]=${ks}&flashvars[EmbedPlayer.EnableMobileSkin]=true`;
            if (isLive) {
                flashVars += '&flashvars[disableEntryRedirect]=true';
            }

            this._urlHash = this._urlHash + 1;
            result = `${environment.core.kaltura.cdnUrl}/p/${partnerID}/sp/${partnerID}00/embedIframeJs/uiconf_id/${UIConfID}/partner_id/${partnerID}?iframeembed=true&${flashVars}&entry_id=${entryId}&hash=${this._urlHash}`;
        }

        return result;
    }
    protected onActivate(firstTimeActivating: boolean) {
	    this.iframeSrc = this._createUrl();
    }


}

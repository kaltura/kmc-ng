import { Injectable } from '@angular/core';
import {
    EntryWidget
} from '../entry-widget';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { environment } from 'app-environment';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { KalturaSourceType } from 'kaltura-typescript-client/types/KalturaSourceType';

export interface PreviewEntryData{
    landingPage : string;
    iFrameSrc : string;
}

@Injectable()
export class EntryDetailsWidget extends EntryWidget
{
    public _landingPage : string;
    public iframeSrc : string;

    constructor(
                kalturaServerClient: KalturaClient,
                private appAuthentication: AppAuthentication)

    {
        super('entryDetails');
    }


    /**
     * Do some cleanups if needed once the section is removed
     */
    protected onReset()
    {

    }

    protected onActivate(firstTimeActivating: boolean) {
        const entry: KalturaMediaEntry = this.data;

	    this._landingPage = null;
	    this.iframeSrc = null;

        let landingPage = this.appAuthentication.appUser.partnerInfo.landingPage;
        if (landingPage) {
	        landingPage = landingPage.replace("{entryId}", entry.id);
	        if (landingPage.indexOf("http") !== 0){
	            landingPage = "http://" + landingPage;
            }
        }
        this._landingPage = landingPage;

        // create preview embed code
        const sourceType = entry.sourceType.toString();
        const isLive = (sourceType === KalturaSourceType.liveStream.toString() ||
        sourceType === KalturaSourceType.akamaiLive.toString() ||
        sourceType === KalturaSourceType.akamaiUniversalLive.toString() ||
        sourceType === KalturaSourceType.manualLiveStream.toString());

        const UIConfID = environment.core.kaltura.previewUIConf;
        const partnerID = this.appAuthentication.appUser.partnerId;
	    const ks = this.appAuthentication.appUser.ks || "";

	    let flashVars = `flashvars[closedCaptions.plugin]=true&flashvars[EmbedPlayer.SimulateMobile]=true&&flashvars[ks]=${ks}&flashvars[EmbedPlayer.EnableMobileSkin]=true`;
	    if (isLive){
	        flashVars += '&flashvars[disableEntryRedirect]=true';
        }

        this.iframeSrc = `${environment.core.kaltura.cdnUrl}/p/${partnerID}/sp/${partnerID}00/embedIframeJs/uiconf_id/${UIConfID}/partner_id/${partnerID}?iframeembed=true&${flashVars}&entry_id=${entry.id}`;
    }


}

import { Injectable } from '@angular/core';
import {
    EntryFormWidget
} from '../entry-form-widget';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { environment } from 'app-environment';

export interface PreviewEntryData{
    landingPage : string;
    iFrameSrc : string;
}

@Injectable()
export class EntryPreviewHandler extends EntryFormWidget
{
    public _landingPage : string;
    public iframeSrc : string;

    constructor(
                kalturaServerClient: KalturaClient,
                private appAuthentication: AppAuthentication)

    {
        super('entryPreview');
    }


    /**
     * Do some cleanups if needed once the section is removed
     */
    protected _onReset()
    {

    }

    protected _onDataLoading(dataId : any) {
	    this._landingPage = null;
	    this.iframeSrc = null;

        let landingPage = this.appAuthentication.appUser.partnerInfo.landingPage;
        if (landingPage) {
	        landingPage = landingPage.replace("{entryId}", dataId);
        }
        this._landingPage = landingPage;

        const UIConfID = environment.core.kaltura.previewUIConf;
        const partnerID = this.appAuthentication.appUser.partnerId;
	    const ks = this.appAuthentication.appUser.ks || "";
        this.iframeSrc = `${environment.core.kaltura.cdnUrl}/p/${partnerID}/sp/${partnerID}00/embedIframeJs/uiconf_id/${UIConfID}/partner_id/${partnerID}?iframeembed=true&flashvars[closedCaptions.plugin]=true&flashvars[EmbedPlayer.SimulateMobile]=true&&flashvars[ks]=${ks}&flashvars[EmbedPlayer.EnableMobileSkin]=true&entry_id=${dataId}`;
    }

    protected _onActivate(firstTimeActivating: boolean) {
      // do nothing
    }
}

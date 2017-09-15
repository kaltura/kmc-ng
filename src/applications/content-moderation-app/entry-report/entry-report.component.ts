import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { environment } from 'app-environment';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { KalturaSourceType } from 'kaltura-typescript-client/types/KalturaSourceType';

@Component({
	selector: 'kEntryReport',
	templateUrl: './entry-report.component.html',
	styleUrls: ['./entry-report.component.scss']
})
export class EntryReportComponent implements OnInit, OnDestroy {
  @Input() parentPopupWidget: PopupWidgetComponent;
  iframeSrc : string = "http://cdnapi.kaltura.com/p/2288171/sp/228817100/embedIframeJs/uiconf_id/38524931/partner_id/2288171?iframeembed=true&flashvars[closedCaptions.plugin]=true&flashvars[EmbedPlayer.SimulateMobile]=true&&flashvars[ks]=djJ8MjI4ODE3MXy7ZEOeJZ6JI-Whlij2xzVaW8D8Nn9J_ji-FECxBz9iLIeh1cclSKl85YvbTTUW2nfmVRcTjkKrpLR3VVFLajvqH2atyVu_mXzrhpvjrj049HWICvOroFnhh8NCF_7PI2hgyyAHj-tMJmYLCPglFCZq&flashvars[EmbedPlayer.EnableMobileSkin]=true&entry_id=1_yskuq0ef";

	constructor(
    private _appAuthentication: AppAuthentication
  ) {}

  closePopup(){
    if (this.parentPopupWidget){
      this.parentPopupWidget.close();
    }
  }

	ngOnInit() {
    /*const entry: KalturaMediaEntry = this.data;

    const UIConfID = environment.core.kaltura.previewUIConf;
    const partnerID = this._appAuthentication.appUser.partnerId;
    const ks = this._appAuthentication.appUser.ks || "";

    // create preview embed code
    const sourceType = entry.sourceType.toString();
    const isLive = (sourceType === KalturaSourceType.liveStream.toString() ||
    sourceType === KalturaSourceType.akamaiLive.toString() ||
    sourceType === KalturaSourceType.akamaiUniversalLive.toString() ||
    sourceType === KalturaSourceType.manualLiveStream.toString());

    let flashVars = `flashvars[closedCaptions.plugin]=true&flashvars[EmbedPlayer.SimulateMobile]=true&&flashvars[ks]=${ks}&flashvars[EmbedPlayer.EnableMobileSkin]=true`;
    if (isLive){
      flashVars += '&flashvars[disableEntryRedirect]=true';
    }
    this.iframeSrc = `${environment.core.kaltura.cdnUrl}/p/${partnerID}/sp/${partnerID}00/embedIframeJs/uiconf_id/${UIConfID}/partner_id/${partnerID}?iframeembed=true&${flashVars}&entry_id=${entry.id}`;*/
  }

	ngOnDestroy() {}
}


import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { AppAuthentication, BrowserService, PartnerPackageTypes } from 'app-shared/kmc-shell';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';

@Component({
    selector: 'kKMCDashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit {
    @ViewChild('whatsNew') private _whatsNewWin: PopupWidgetComponent;

    constructor(private _appAuthentication: AppAuthentication,
                private _browserService: BrowserService) {
    }

    private _showWhatsNew(): void {
        const isRegisteredUser = this._appAuthentication.appUser.partnerInfo.partnerPackage !== PartnerPackageTypes.PartnerPackageFree;
        const whatsNewShown = this._browserService.getFromLocalStorage('whatsNewShown') || false;
        if (isRegisteredUser && !whatsNewShown) {
            setTimeout(() => {
                this._browserService.setInLocalStorage('whatsNewShown', true);
                this._whatsNewWin.open();
            }, 200);
        }
    }

    closeWin(): void {
        this._whatsNewWin.close();
    }

    ngAfterViewInit() {
        this._showWhatsNew();
    }
}

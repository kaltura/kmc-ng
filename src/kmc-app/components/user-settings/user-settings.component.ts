import {Component, Input} from '@angular/core';
import {AppAuthentication, BrowserService, PartnerPackageTypes} from 'app-shared/kmc-shell';
import {kmcAppConfig} from '../../kmc-app-config';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui';
import {AnalyticsNewMainViewService} from "app-shared/kmc-shared/kmc-views";
import {Router} from "@angular/router";

@Component({
    selector: 'kKMCUserSettings',
    templateUrl: './user-settings.component.html',
    styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent {
    @Input() parentPopup: PopupWidgetComponent;
    public _languages = [];
    public _dateFormats = [
        {value: 'month-day-year', label: 'MM/DD/YYYY'},
        {value: 'day-month-year', label: 'DD/MM/YYYY'},
    ];
    public _selectedLanguage = 'en';
    public _selectedDateFormat = this.browserService.getFromLocalStorage('kmc_date_format') || 'month-day-year';
    public userInitials: string;
    public partnerInfo: string[];

    public isSelfServe = false;
    public isFreeTrial = false;
    public isPayingCustomer = false;
    public creditLeft = 0; // TODO [selfServe]: get credit value on load for free trial
    public creditBalance = 0; // TODO [selfServe]: get credit balance value on load for paying customers

    constructor(public _userAuthentication: AppAuthentication,
                private _analyticsNewMainViewService: AnalyticsNewMainViewService,
                private browserService: BrowserService,
                private _router: Router) {
        kmcAppConfig.locales.forEach(locale => {
            this._languages.push({label: locale.label, value: locale.id});
        });

        const currentLang = this.browserService.getFromLocalStorage('kmc_lang');
        if (currentLang && currentLang.length) {
            const lang = this._languages.find((lang) => {
                return lang.value === currentLang
            });
            if (lang) {
                this._selectedLanguage = lang.value;
            }
        }

        const info = this._userAuthentication.appUser.partnerInfo;
        this.isSelfServe = info.isSelfServe;
        this.isFreeTrial = info.partnerPackage ===  PartnerPackageTypes.PartnerPackageFree;
        this.isPayingCustomer = true;//info.partnerPackage ===  PartnerPackageTypes.PartnerPackagePaid;

        if (this._userAuthentication.appUser?.fullName) {
            this.userInitials = this._userAuthentication.appUser.fullName.toUpperCase().split(' ').slice(0, 2).map(s => s[0]).join('');
        }
        if (this._userAuthentication.appUser?.partnerInfo?.name) {
            this.partnerInfo = info.name.split('-').slice(0, 2);
        }
    }

    openUsageDashboard(): void {
        if (this.isSelfServe && this._analyticsNewMainViewService.isAvailable()) {
            this._router.navigate(['analytics/overview']);
            this.parentPopup.close();
        }
    }

    openKPF(): void {
        // TODO [selfServe]: get KPF URL from config and open in a new tab
        alert("openKPF");
    }

    startPlan(): void {
        // TODO [selfServe]:  open start plan link in a new tab
        alert("startPlan");
    }

    buyCredit(): void {
        // TODO [selfServe]:  open buy credit link in a new tab
        alert("buyCredit");
    }

    logout() {
        this._userAuthentication.logout();
    }

    onLangSelected(event) {
        this.browserService.setInLocalStorage('kmc_lang', event.value);
        this._userAuthentication.reload();
    }

    onDateFormatSelected(event: { value: string }): void {
        this.browserService.setInLocalStorage('kmc_date_format', event.value);
        this._userAuthentication.reload();
    }

}

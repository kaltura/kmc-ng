import {Component, Input, OnInit} from '@angular/core';
import {AppAuthentication, BrowserService, PartnerPackageTypes} from 'app-shared/kmc-shell';
import {kmcAppConfig} from '../../kmc-app-config';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui';
import {AnalyticsNewMainViewService} from "app-shared/kmc-shared/kmc-views";
import {Router} from "@angular/router";
import {KPFLoginRedirects, KPFService} from "app-shared/kmc-shell/providers/kpf.service";
import {AppLocalization} from "@kaltura-ng/mc-shared";

@Component({
    selector: 'kKMCUserSettings',
    templateUrl: './user-settings.component.html',
    styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit{
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
    public credits = '';

    constructor(public _userAuthentication: AppAuthentication,
                private _analyticsNewMainViewService: AnalyticsNewMainViewService,
                private _appLocalization: AppLocalization,
                private browserService: BrowserService,
                private _kpfService: KPFService,
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
        this.isPayingCustomer = info.partnerPackage ===  PartnerPackageTypes.PartnerPackagePaid || info.partnerPackage ===  PartnerPackageTypes.PartnerPackagePAYG;

        if (this._userAuthentication.appUser?.fullName) {
            this.userInitials = this._userAuthentication.appUser.fullName.toUpperCase().split(' ').slice(0, 2).map(s => s[0]).join('');
        }
        if (this._userAuthentication.appUser?.partnerInfo?.name) {
            this.partnerInfo = info.name.split('-').slice(0, 2);
        }
    }

    ngOnInit(): void {
        this._kpfService.getCredits().subscribe(credit => {
            this.credits = credit;
        });
    }

    public openUsageDashboard(): void {
        if (this.isSelfServe && this._analyticsNewMainViewService.isAvailable()) {
            this._router.navigate(['analytics/overview']);
            this.parentPopup.close();
        }
    }

    public startPlan(): void {
        this._kpfService.openKPF().subscribe(success => {
            this._handleKPFOpenResult(success);
        }, error => {
            this._handleKPFConnectionError(error);
        });
    }

    public buyCredit(): void {
        this._kpfService.openKPF(KPFLoginRedirects.upgrade).subscribe(success => {
            this._handleKPFOpenResult(success);
        }, error => {
            this._handleKPFConnectionError(error);
        });
    }

    public updatePayment(): void {
        this._kpfService.openKPF(KPFLoginRedirects.billing).subscribe(success => {
            this._handleKPFOpenResult(success);
        }, error => {
            this._handleKPFConnectionError(error);
        });
    }

    private _handleKPFOpenResult(openedSuccessfully): void {
        if (!openedSuccessfully) {
            this._handleKPFConnectionError();
        };
    }

    private _handleKPFConnectionError(error = null): void {
        this.browserService.showToastMessage({
            severity: 'error',
            detail: this._appLocalization.get('selfServe.error')
        });
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

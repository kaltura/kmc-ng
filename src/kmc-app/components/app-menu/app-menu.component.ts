import {Component, ElementRef, OnDestroy, OnInit, AfterViewInit, Renderer2, ViewChild} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {
    AppAnalytics,
    AppAuthentication, AppBootstrap,
    AppUserStatus,
    BrowserService,
    PartnerPackageTypes
} from 'app-shared/kmc-shell';
import {buildBaseUri, serverConfig} from 'config/server';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui';
import {KmcLoggerConfigurator} from 'app-shared/kmc-shell/kmc-logs/kmc-logger-configurator';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';
import {AnalyticsNewMainViewService, KMCAppMenuItem, KmcMainViewsService} from 'app-shared/kmc-shared/kmc-views';
import {ContextualHelpLink, ContextualHelpService} from 'app-shared/kmc-shared/contextual-help/contextual-help.service';
import {globalConfig} from 'config/global';
import {cancelOnDestroy} from '@kaltura-ng/kaltura-common';
import {AppEventsService} from 'app-shared/kmc-shared';
import {HideMenuEvent, ShowMenuEvent, ResetMenuEvent, UpdateMenuEvent} from 'app-shared/kmc-shared/events';
import {KalturaPartnerStatus} from 'kaltura-ngx-client';
import { KPFLoginRedirects, KPFService } from "app-shared/kmc-shell/providers/kpf.service";
import {AppLocalization} from "@kaltura-ng/mc-shared";
import {KMCPermissions, KMCPermissionsService} from 'app-shared/kmc-shared/kmc-permissions';
import {PubSubServiceType} from '@unisphere/runtime';

@Component({
    selector: 'kKMCAppMenu',
    templateUrl: './app-menu.component.html',
    styleUrls: ['./app-menu.component.scss'],
    providers: [
        KalturaLogger.createLogger('AppMenuComponent')
    ]

})
export class AppMenuComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('helpmenu', {static: true}) private _helpmenu: PopupWidgetComponent;
    @ViewChild('supportPopup', {static: true}) private _supportPopup: PopupWidgetComponent;
    @ViewChild('leftMenu', {static: true}) private leftMenu: ElementRef;
    private _appCachedVersionToken = 'kmc-cached-app-version';
    private unisphereRuntime: any = null;
    private unisphereCallbackUnsubscribe:  () => void = null;

    public _showChangelog = false;
    public _helpMenuOpened = false;
    public _powerUser = false;
    public _userManualLinkExists = !!serverConfig.externalLinks.kaltura && !!serverConfig.externalLinks.kaltura.userManual;
    public _kmcOverviewLinkExists = !!serverConfig.externalLinks.kaltura && !!serverConfig.externalLinks.kaltura.kmcOverview;
    public _mediaManagementLinkExists = !!serverConfig.externalLinks.kaltura && !!serverConfig.externalLinks.kaltura.mediaManagement;
    public _supportLinkExists = !!serverConfig.externalLinks.kaltura && !!serverConfig.externalLinks.kaltura.customerCare && !!serverConfig.externalLinks.kaltura.customerPortal;
    public _supportLegacyExists = false;
    public _showStartPlan = false;
    public _isFreeTrial = false;
    public _showNotificationsBar = false;
    public _contextualHelp: ContextualHelpLink[] = [];
    public menuID = 'kmc'; // used when switching menus to Analytics menu or future application menus
    public _isMultiAccount = false;
    public _appUserStatus: AppUserStatus = null;
    public _connectingToKPF = false;
    public hideMainMenu = false;
    public _agentsEnabled = false;

    menuConfig: KMCAppMenuItem[];
    leftMenuConfig: KMCAppMenuItem[];
    rightMenuConfig: KMCAppMenuItem[];
    selectedMenuItem: KMCAppMenuItem;
    showSubMenu = true;

    public _customerCareLink = this._supportLinkExists ? serverConfig.externalLinks.kaltura.customerCare : '';
    public _customerPortalLink = this._supportLinkExists ? serverConfig.externalLinks.kaltura.customerPortal : '';
    public userInitials: string;

    constructor(public _kmcLogs: KmcLoggerConfigurator,
                private _contextualHelpService: ContextualHelpService,
                private _appPermissions: KMCPermissionsService,
                private _bootstrapService: AppBootstrap,
                public _userAuthentication: AppAuthentication,
                private _kmcMainViews: KmcMainViewsService,
                private _appLocalization: AppLocalization,
                private router: Router,
                private renderer: Renderer2,
                private _appEvents: AppEventsService,
                private _browserService: BrowserService,
                private _analytics: AppAnalytics,
                private _kpfService: KPFService,
                private _analyticsNewMainViewService: AnalyticsNewMainViewService) {

        _contextualHelpService.contextualHelpData$
            .pipe(cancelOnDestroy(this))
            .subscribe(data => {
                this._contextualHelp = data;
            });

        router.events
            .pipe(cancelOnDestroy(this))
            .subscribe((event) => {
                if (event instanceof NavigationEnd) {
                    this.setSelectedRoute(event.urlAfterRedirects);
                }
            });
        this.menuConfig = this._kmcMainViews.getMenu();
        this._isMultiAccount = this._analyticsNewMainViewService.isMultiAccount();
        this.leftMenuConfig = this.menuConfig.filter((item: KMCAppMenuItem) => {
            return item.position === 'left';
        });
        this.rightMenuConfig = this.menuConfig.filter((item: KMCAppMenuItem) => {
            return item.position === 'right';
        });
        if (router.navigated) {
            this.setSelectedRoute(router.routerState.snapshot.url);
        }

        this._powerUser = this._browserService.getInitialQueryParam('mode') === 'poweruser';
        if (this._userAuthentication.appUser?.fullName) {
            this.userInitials = this._userAuthentication.appUser.fullName.toUpperCase().split(' ').slice(0, 2).map(s => s[0]).join('');
        }

        const partnerInfo = this._userAuthentication.appUser.partnerInfo;
        if (partnerInfo.partnerPackage ===  PartnerPackageTypes.PartnerPackageFree) {
            this._isFreeTrial = true;
            this._appUserStatus = partnerInfo.status === KalturaPartnerStatus.active ? AppUserStatus.FreeTrialActive : AppUserStatus.FreeTrialBlocked;
        } else if (partnerInfo.partnerPackage ===  PartnerPackageTypes.PartnerPackagePaid || partnerInfo.partnerPackage ===  PartnerPackageTypes.PartnerPackagePAYG) {
            this._appUserStatus = partnerInfo.status === KalturaPartnerStatus.active ? AppUserStatus.PaidActive : AppUserStatus.PaidBlocked;
        }
        this._showStartPlan = partnerInfo.isSelfServe && this._appUserStatus ===  AppUserStatus.FreeTrialActive && !partnerInfo.isChildAccount;
        this._showNotificationsBar = partnerInfo.isSelfServe && !partnerInfo.isChildAccount && (this._appUserStatus ===  AppUserStatus.FreeTrialBlocked || this._appUserStatus ===  AppUserStatus.PaidBlocked);
        this._agentsEnabled = this._appPermissions.hasPermission(KMCPermissions.FEATURE_AGENTS_FRAMEWORK_PERMISSION);
    }

    ngOnInit() {
        const cachedVersion = this._browserService.getFromLocalStorage(this._appCachedVersionToken);
        this._showChangelog = cachedVersion !== globalConfig.client.appVersion;
        this._appEvents.event(UpdateMenuEvent)
            .pipe(cancelOnDestroy(this))
            .subscribe((event) => {
                if (event.position === 'left') {
                    this.replaceMenu(event.menuID, event.menu);
                }
            });

        this._appEvents.event(ResetMenuEvent)
            .pipe(cancelOnDestroy(this))
            .subscribe((event) => {
                const menu = this.menuConfig.filter((item: KMCAppMenuItem) => {
                    return item.position === 'left';
                });
                this.replaceMenu('kmc', menu);
            });

        this._appEvents.event(HideMenuEvent)
            .pipe(cancelOnDestroy(this))
            .subscribe((event) => {
                this.showSubMenu = false;
                this.hideMainMenu = true;
            });

        this._appEvents.event(ShowMenuEvent)
            .pipe(cancelOnDestroy(this))
            .subscribe((event) => {
                this.showSubMenu = true;
                this.hideMainMenu = false;
            });

        if (this._agentsEnabled) {
            this._bootstrapService.unisphereWorkspace$
                .pipe(cancelOnDestroy(this))
                .subscribe(unisphereWorkspace => {
                        if (unisphereWorkspace) {
                            this.unisphereRuntime = unisphereWorkspace.getRuntime('unisphere.widget.agents', 'manager');
                            this.unisphereCallbackUnsubscribe = unisphereWorkspace.getService<PubSubServiceType>('unisphere.service.pub-sub')?.subscribe('unisphere.event.module.agents.message-host-app', (data) => {
                                const {action, entryId} = data.payload;
                                switch (action) {
                                    case 'entry':
                                        // navigate to entry
                                        this.unisphereRuntime?.closeDrawer(); // close widget
                                        this.router.navigateByUrl('/content/entries/entry/' + entryId);
                                        break;
                                }
                            })
                        }
                    },
                    error => {
                        console.error('Error initializing Unisphere workspace', error);
                    })
        }
    }

    ngAfterViewInit(){
        // remove script node if exists
        const script: any = document.getElementById("kalturaChecklistScript");
        if (script !== null) {
            script.parentNode.removeChild(script);
        }
        const s: any = document.createElement('script');
        s.src = `${serverConfig.externalServices.checklistEndpoint.scriptUri}/checklist.js`;
        s.id = "kalturaChecklistScript";
        s.async = false;
        s.onload = () => {
            const c = new window["Checklist"]();
            c.init({
                apiUrl: serverConfig.externalServices.checklistEndpoint.uri,
                button_location_id: "announcements",
                integrateWithUnisphere: true,
                kaltura_application: serverConfig.externalServices.checklistEndpoint.checklistItem,
                ks : this._userAuthentication.appUser.ks,
                vars : {
                    hostControlButtonMargin: true,
                    whatsNewIcon: `${serverConfig.externalServices.checklistEndpoint.scriptUri}/assets/gift-lightBlue.svg`,
                    whatsNewLabel: ""
                }
            });
            c.run();
        }
        document.head.appendChild(s);
    }

    private replaceMenu(menuID: string, menu: KMCAppMenuItem[]): void {
        this.renderer.setStyle(this.leftMenu.nativeElement, 'opacity', 0);
        this.renderer.setStyle(this.leftMenu.nativeElement, 'marginLeft', '100px');
        setTimeout(() => {
            this.leftMenuConfig = menu;
            this.renderer.setStyle(this.leftMenu.nativeElement, 'opacity', 1);
            this.renderer.setStyle(this.leftMenu.nativeElement, 'marginLeft', '0px');
            this.setSelectedRoute(this.router.routerState.snapshot.url);
            this.menuID = menuID;
        }, 300);
    }

    setSelectedRoute(path) {
        if (this.menuConfig) {
            this.selectedMenuItem = this.leftMenuConfig.find(item => item.isActiveView(path));
            if (!this.selectedMenuItem) {
                this.selectedMenuItem = this.rightMenuConfig.find(item => item.isActiveView(path));
            }
            this.showSubMenu = this.selectedMenuItem && this.selectedMenuItem.children && this.selectedMenuItem.children.length > 0;
        } else {
            this.selectedMenuItem = null;
            this.showSubMenu = false;
        }
    }

    openHelpLink(key) {
        let link = '';
        switch (key) {
            case 'manual':
                link = serverConfig.externalLinks.kaltura.userManual;
                break;
            case 'kmcOverview':
                this._analytics.trackClickEvent('KMC_overview');
                link = serverConfig.externalLinks.kaltura.kmcOverview;
                break;
            case 'mediaManagement':
                link = serverConfig.externalLinks.kaltura.mediaManagement;
                break;
            case 'legacy':
                link = buildBaseUri('/index.php/kmc');
                break;
        }
        if (link.length > 0) {
            this._browserService.openLink(link, {}, '_blank');
        }
        this._helpmenu.close();
    }

    openSupport() {
        this._supportPopup.open();
        this._helpmenu.close();
    }

    navigateToDefault() {
        this.router.navigateByUrl('/content/entries');
    }


    ngOnDestroy() {
        if (this.unisphereCallbackUnsubscribe) {
            this.unisphereCallbackUnsubscribe();
            this.unisphereCallbackUnsubscribe = null;
        }
    }

    public openAgents(): void {
        if (this._agentsEnabled && this.unisphereRuntime) {
            this.unisphereRuntime.openDrawer();
        }
    }

    public _changelogPopupOpened(): void {
        this._showChangelog = false;
        this._browserService.setInLocalStorage(this._appCachedVersionToken, globalConfig.client.appVersion);
    }

    public startPlan(): void {
        this._connectingToKPF = true;
        this._kpfService.openKPF(KPFLoginRedirects.upgrade).subscribe(success => {
            this._handleKPFOpenResult(success);
        }, error => {
            this._handleKPFConnectionError(error);
        });
    }

    public updatePayment(): void {
        this._connectingToKPF = true;
        this._kpfService.openKPF(KPFLoginRedirects.billing).subscribe(success => {
            this._handleKPFOpenResult(success);
        }, error => {
            this._handleKPFConnectionError(error);
        });
    }

    private _handleKPFOpenResult(openedSuccessfully): void {
        this._connectingToKPF = false;
        if (!openedSuccessfully) {
            this._handleKPFConnectionError();
        };
    }

    private _handleKPFConnectionError(error = null): void {
        this._connectingToKPF = false;
        this._browserService.showToastMessage({
            severity: 'error',
            detail: this._appLocalization.get('selfServe.error')
        });
    }
}

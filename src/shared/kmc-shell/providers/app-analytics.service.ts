import { Injectable } from '@angular/core';
import { KalturaClient } from 'kaltura-ngx-client';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AppAuthentication } from "../auth/app-authentication.service";
import { serverConfig } from "config/server";
import { HttpClient } from "@angular/common/http";
import { globalConfig } from "config/global";

export enum EventType
{
    ButtonClicked = 10002,
    PageLoad = 10003
}

export enum ApplicationType
{
    KMC = 0,
    Analytics = 13
}

export enum PageType
{
    View = 1,
    Create = 2,
    Edit = 3,
    Participate = 4,
    List = 5,
    Analytics = 6,
    Admin = 7,
    Error = 8,
    Login = 9,
    Registration = 10,
    Custom = 11,
}

export enum ButtonType
{
    Create = 1,
    Filter = 2,
    Search = 3,
    Export = 4,
    Navigate = 5,
    Schedule = 6,
    Insert = 7,
    Choose = 8,
    Launch = 9,
    Open = 10,
    Send = 11,
    Invite = 12,
    Close = 13,
    Save = 14,
    Expand = 15,
    Collapse = 16,
    Edit = 17,
    Delete = 18,
    Browse = 19,
    Load = 20,
    Add = 21,
    Menu = 22,
    Register = 23,
    Login = 24,
    Link = 25,
    Toggle = 26,
    Thumbnail = 27,
    Download = 28,
    Share = 29
}

@Injectable()
export class AppAnalytics {

    private _logger: KalturaLogger;
    private _enabled = false;
    private _analyticsBaseUrl = '';

    constructor(private kalturaServerClient: KalturaClient,
                private _appAuthentication: AppAuthentication,
                private _http: HttpClient,
                private router: Router,
                logger: KalturaLogger) {
        this._logger = logger.subLogger('AppAnalytics');
    }

    public init(): void {
        this._logger.info('init app analytics');
        // init analytics base URL
        this._analyticsBaseUrl = serverConfig?.analyticsServer?.uri?.length ? serverConfig.analyticsServer.uri : '';
        if (this._analyticsBaseUrl.length > 0 && this._analyticsBaseUrl.indexOf('http') !== 0) {
            this._analyticsBaseUrl = 'https://' + this._analyticsBaseUrl;
        }
        // enable analytics only if base URL was set correctly
        this._enabled = this._analyticsBaseUrl.length > 0;

        if (this._enabled) {
            this.registerPageLoadEvents();
        }
    }

    private registerPageLoadEvents(): void {
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event) => {
                switch ((event as NavigationEnd).urlAfterRedirects) {
                    case '/login':
                        this.trackEvent(EventType.PageLoad, PageType.Login, 'KMC_login_page');
                        break;
                    case '/content/entries/list':
                        this.trackEvent(EventType.PageLoad, PageType.List, 'KMC_content_entries_list');
                        break;
                    case '/content/moderation/list':
                        this.trackEvent(EventType.PageLoad, PageType.List, 'KMC_content_moderation_list');
                        break;
                    case '/content/playlists/list':
                        this.trackEvent(EventType.PageLoad, PageType.List, 'KMC_content_playlist_list');
                        break;
                    case '/content/syndication/list':
                        this.trackEvent(EventType.PageLoad, PageType.List, 'KMC_content_syndication_list');
                        break;
                   case '/content/bulk/list':
                        this.trackEvent(EventType.PageLoad, PageType.List, 'KMC_content_bulk_upload_list');
                        break;
                    case '/content/categories/list':
                        this.trackEvent(EventType.PageLoad, PageType.List, 'KMC_content_categories_list');
                        break;
                    case '/administration/users/list':
                        this.trackEvent(EventType.PageLoad, PageType.Admin, 'Administration_users');
                        break;
                    case '/administration/roles/list':
                        this.trackEvent(EventType.PageLoad, PageType.Admin, 'Administration_roles');
                        break;
                    case '/settings/authentication/list':
                        this.trackEvent(EventType.PageLoad, PageType.List, 'KMC_authentication_profiles');
                        break;
                }
            });
    }

    public trackClickEvent(buttonName: string, eventVar3 = null): void {
        let buttonType: ButtonType;
        switch (buttonName) {
            case 'Create':
            case 'Generate_SIP_user':
            case 'authentication_newSAMLProfile':
            case 'Generate_passphrase_encryption':
                buttonType = ButtonType.Create;
                break;
            case 'Change_account':
            case 'Bulk_actions':
            case 'SAML_selectProvider':
            case 'SAML_selectKalturaAttribute':
            case 'SAML_NameID':
                buttonType = ButtonType.Choose;
                break;
            case 'Change_log':
                buttonType = ButtonType.Browse;
                break;
            case 'KMC_overview':
            case 'Login':
            case 'Login_with_SSO':
            case 'authenticationTab':
            case 'Sign_up':
                buttonType = ButtonType.Navigate;
                break;
            case 'Refine':
            case 'Filter_categories':
            case 'Bulk_upload_dates_filter':
                buttonType = ButtonType.Filter;
                break;
            case 'Search_entries':
                buttonType = ButtonType.Search;
                break;
            case 'Add_playlist':
            case 'Add_category':
            case 'Add_user':
            case 'Add_role':
            case 'Captions_enrich':
            case 'SAML_addKalturaAttribute':
            case 'SAML_addCustomAttribute':
                buttonType = ButtonType.Add;
                break;
            case 'View_analytics':
            case 'Real-time_analytics':
            case 'Webcast_analytics':
                buttonType = ButtonType.Open;
                break;
            case 'Share_Embed':
                buttonType = ButtonType.Launch;
                break;
            case 'Delete':
            case 'Bulk_delete':
            case 'authentication_deleteProfile':
                buttonType = ButtonType.Delete;
                break;
           case 'authentication_editProfile':
                buttonType = ButtonType.Edit;
                break;
           case 'authentication_cancelProfileCreation':
           case 'SAML_cancelProfileEdit':
                buttonType = ButtonType.Close;
                break;
           case 'SAML_createProfile':
           case 'SAML_SaveProfileEdit':
                buttonType = ButtonType.Save;
                break;
           case 'SAML_createConfigGuideClick':
           case 'SAML_editConfigGuideClick':
                buttonType = ButtonType.Link;
                break;
           case 'SAML_downloadMetadataXML':
           case 'SAML_downloadMetadataURL':
                buttonType = ButtonType.Download;
                break;
           case 'SAML_showAdvancedSettings':
                buttonType = ButtonType.Expand;
                break;
           case 'SAML_hideAdvancedSettings':
                buttonType = ButtonType.Collapse;
                break;
           case 'SAML_createNewGroups':
           case 'SAML_removeFromExistingGroups':
           case 'SAML_signSamlRequest':
           case 'SAML_Encrypt':
           case 'SAML_syncAllUserGroups':
                buttonType = ButtonType.Toggle;
                break;
        }
        if (buttonType) {
            this.trackEvent(EventType.ButtonClicked, buttonType, buttonName, eventVar3);
        }
    }

    private trackEvent(eventType: EventType, eventVar1: ButtonType | PageType, eventVar2: string, eventVar3: string = null): void {
        if (!this._enabled) {
            return;
        }
        const ks = this._appAuthentication.appUser ? this._appAuthentication.appUser.ks : null;
        const pid = this._appAuthentication.appUser ? this._appAuthentication.appUser.partnerId.toString() :  null;

        // check for entry ID in URL
        const urlParts = this.router.url.split('/');
        const entryIndex = urlParts.indexOf('entry') + 1;
        const entryId =  entryIndex > 0 && urlParts.length >= entryIndex ? urlParts[entryIndex] : null;

        // build track event url and payload
        let url = `${this._analyticsBaseUrl}/api_v3/index.php?service=analytics&action=trackEvent`;
        let payload = {};
        if (eventType === EventType.PageLoad) {
            payload = {
                eventType,
                pageType: eventVar1,
                pageName: eventVar2
            };
        } else {
            payload = {
                eventType,
                buttonType: eventVar1,
                buttonName: eventVar2
            };
            if (eventVar3) {
                payload['buttonValue'] = eventVar3;
            }
        }
        Object.assign(payload, {
            kalturaApplication: ApplicationType.KMC,
            kalturaApplicationVer: globalConfig.client.appVersion
        });
        if (pid) {
            Object.assign(payload, { partnerId: pid });
        }
        if (entryId) {
            Object.assign(payload, { entryId });
        }
        if (ks) {
            Object.assign(payload, { ks });
        }
        // send tracking event
        this._http.post(url, payload).subscribe(); // no need to handle response
    }
}

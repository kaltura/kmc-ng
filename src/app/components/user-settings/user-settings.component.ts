import { Component } from '@angular/core';
import { BrowserService } from 'app-shared/kmc-shell';
import { AppAuthentication, AppUser, PartnerPackageTypes, AppNavigator } from '@kaltura-ng/kaltura-common';
import { environment } from 'app-environment';
import { Md5 } from 'ts-md5/dist/md5';

@Component({
	selector: 'kKMCUserSettings',
	templateUrl: './user-settings.component.html',
	styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent {
	timeoutID: number = null;
	public _userContext: AppUser;
	public _languages = [{label: "English", value: "en"}, {label: "Deutsch", value: "de"}, {label: "Español", value: "es"}, {label: "Français", value: "fr"}, {label: "日本語", value: "lp"}];
	public _selectedLanguage = "English";

	constructor(private userAuthentication: AppAuthentication, private appNavigator: AppNavigator, private browserService: BrowserService) {
		this._userContext = userAuthentication.appUser;
	}

	logout() {
		this.userAuthentication.logout();
		//this.appNavigator.navigateToLogout();
		document.location.reload();
	}

	openUserManual() {
		this.browserService.openLink(environment.core.externalLinks.USER_MANUAL, {}, '_blank');
	}

	openSupport() {
		// check if this is a paying partner. If so - open support form. If not - redirect to general support. Use MD5 to pass as a parameter.
		let payingCustomer: boolean = this._userContext.partnerInfo.partnerPackage === PartnerPackageTypes.PartnerPackagePaid;
		let params = {
			'type': Md5.hashStr(payingCustomer.toString()),
			'pid': this._userContext.partnerId
		};

		// TODO [kmc] Open support in a modal window over KMC and not in _blank
		this.browserService.openLink(environment.core.externalLinks.SUPPORT, params, '_blank');
	}

	onLangSelected(event){
		console.log("Change language to: " + event.value);
	}

}

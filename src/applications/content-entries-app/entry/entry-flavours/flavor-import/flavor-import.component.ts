import { Component, Input, AfterViewInit, OnDestroy } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui';
import { KalturaValidators } from '@kaltura-ng/kaltura-ui';
import { Flavor } from '../flavor';


@Component({
	selector: 'kFlavorImport',
	templateUrl: './flavor-import.component.html',
	styleUrls: ['./flavor-import.component.scss']
})
export class FlavorImport implements AfterViewInit, OnDestroy {

	@Input() currentFlavor: Flavor;
	@Input() parentPopupWidget: PopupWidgetComponent;

	private _parentPopupStateChangeSubscribe: ISubscription;

	public _validationErrorMsg: string = "";
	public _flavorURL: string = "";

	constructor(private _appLocalization: AppLocalization) {}

	ngAfterViewInit() {
		if (this.parentPopupWidget) {
			this._parentPopupStateChangeSubscribe = this.parentPopupWidget.state$
				.subscribe(event => {
					if (event.state === PopupWidgetStates.Open) {
						this._flavorURL = "";
						this._validationErrorMsg = "";
					}
				});
		}
	}

	_validate(){
    this._validationErrorMsg = !(KalturaValidators.isUrlValid(this._flavorURL) || !this._flavorURL.length) ? this._appLocalization.get('applications.content.entryDetails.flavours.urlInvalid') : '';
	}

	_onChange(){
		if (this._validationErrorMsg.length){
			this._validate();
		}
	}

	_saveAndClose(){
		let context = {}; // pass selected file or file URL to the parent component via the popup widget close context
		if (this._validationErrorMsg === "" && this._flavorURL.length){
			context['flavorUrl'] = this._flavorURL;
		}
		this.parentPopupWidget.close(context);
	}

	ngOnDestroy() {
		this._parentPopupStateChangeSubscribe.unsubscribe();
	}

}


import { Component, Input, AfterViewInit, OnDestroy } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
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

	constructor(private _appLocalization: AppLocalization) {

	}

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
		if (/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(this._flavorURL) || !this._flavorURL.length){
			this._validationErrorMsg = "";
		}else{
			this._validationErrorMsg = this._appLocalization.get('applications.content.entryDetails.flavours.urlInvalid');
		}
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


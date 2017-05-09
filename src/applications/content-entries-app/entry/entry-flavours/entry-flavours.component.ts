import { Component, ViewChild, AfterViewInit,OnInit, OnDestroy } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { FileDialogComponent } from '@kaltura-ng2/kaltura-ui';
import { KalturaFlavorAssetStatus, KalturaMediaEntry, KalturaMediaType } from '@kaltura-ng2/kaltura-api/types';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng2/kaltura-ui/popup-widget/popup-widget.component';
import { Menu, MenuItem } from 'primeng/primeng';
import { EntryFlavoursHandler, Flavor } from './entry-flavours-handler';

@Component({
    selector: 'kEntryFlavours',
    templateUrl: './entry-flavours.component.html',
    styleUrls: ['./entry-flavours.component.scss']
})
export class EntryFlavours implements AfterViewInit, OnInit, OnDestroy {

	@ViewChild('drmPopup') drmPopup: PopupWidgetComponent;
	@ViewChild('previewPopup') previewPopup: PopupWidgetComponent;
	@ViewChild('importPopup') importPopup: PopupWidgetComponent;
	@ViewChild('actionsmenu') private actionsMenu: Menu;
	@ViewChild('fileDialog') private fileDialog: FileDialogComponent;
	public _actions: MenuItem[] = [];

	public _selectedFlavor: Flavor;
	public _uploadFilter: string = "";
    public _loadingError = null;

	private _importPopupStateChangeSubscribe: ISubscription;

    constructor(public _handler: EntryFlavoursHandler, private _appLocalization: AppLocalization) {
    }

    ngOnInit() {
    }

	openActionsMenu(event: any, flavor: Flavor): void{
		if (this.actionsMenu){
			this._actions = [];
			this._uploadFilter = this._setUploadFilter(this._handler.data);
			if (this._handler.sourceAvailabale && (flavor.id === '' || (flavor.id !== '' && flavor.status === KalturaFlavorAssetStatus.deleted.toString()))){
				this._actions.push({label: this._appLocalization.get('applications.content.entryDetails.flavours.actions.convert'), command: (event) => {this.actionSelected("convert");}});
			}
			if ((flavor.isSource && this.isSourceReady(flavor)) || ( !flavor.isSource && flavor.id !== '' &&
					(flavor.status === KalturaFlavorAssetStatus.exporting.toString() || flavor.status === KalturaFlavorAssetStatus.ready.toString() ))){
				this._actions.push({label: this._appLocalization.get('applications.content.entryDetails.flavours.actions.delete'), command: (event) => {this.actionSelected("delete");}});
				this._actions.push({label: this._appLocalization.get('applications.content.entryDetails.flavours.actions.download'), command: (event) => {this.actionSelected("download");}});
			}
			if ((flavor.isSource && (this.isSourceReady(flavor) || flavor.status === KalturaFlavorAssetStatus.deleted.toString()))||
					flavor.id === "" || (flavor.id !== "" && (flavor.status === KalturaFlavorAssetStatus.deleted.toString() ||
					flavor.status === KalturaFlavorAssetStatus.error.toString() || flavor.status === KalturaFlavorAssetStatus.notApplicable.toString() ||
					flavor.status === KalturaFlavorAssetStatus.exporting.toString() || flavor.status === KalturaFlavorAssetStatus.ready.toString()))
			){
				this._actions.push({label: this._appLocalization.get('applications.content.entryDetails.flavours.actions.upload'), command: (event) => {this.actionSelected("upload");}});
				this._actions.push({label: this._appLocalization.get('applications.content.entryDetails.flavours.actions.import'), command: (event) => {this.actionSelected("import");}});
			}
			if ((flavor.isSource && this.isSourceReady(flavor) && flavor.isWeb) ||
					(flavor.id !== "" && flavor.isWeb && (flavor.status === KalturaFlavorAssetStatus.exporting.toString() || flavor.status === KalturaFlavorAssetStatus.ready.toString()))){
				this._actions.push({label: this._appLocalization.get('applications.content.entryDetails.flavours.actions.preview'), command: (event) => {this.actionSelected("preview");}});
			}
			if (this._handler.sourceAvailabale && !flavor.isSource && (flavor.status === KalturaFlavorAssetStatus.error.toString() || flavor.status === KalturaFlavorAssetStatus.exporting.toString() ||
				flavor.status === KalturaFlavorAssetStatus.ready.toString() || flavor.status === KalturaFlavorAssetStatus.notApplicable.toString())){
				this._actions.push({label: this._appLocalization.get('applications.content.entryDetails.flavours.actions.reconvert'), command: (event) => {this.actionSelected("reconvert");}});
			}
			if (flavor.isWidevine){
				this._actions.push({label: this._appLocalization.get('applications.content.entryDetails.flavours.actions.drm'), command: (event) => {this.actionSelected("drm");}});
			}
			if (this._actions.length) {
				this._selectedFlavor = flavor;
				this.actionsMenu.toggle(event);
			}
		}
	}

	private isSourceReady(flavor: Flavor): boolean{
		return (flavor.isSource && flavor.status !== KalturaFlavorAssetStatus.converting.toString() && flavor.status !== KalturaFlavorAssetStatus.waitForConvert.toString() &&
			flavor.status !== KalturaFlavorAssetStatus.queued.toString() && flavor.status !== KalturaFlavorAssetStatus.importing.toString() &&
			flavor.status !== KalturaFlavorAssetStatus.validating.toString());
	}

	private actionSelected(action: string): void{
		switch (action){
			case "delete":
				this._handler.deleteFlavor(this._selectedFlavor);
				break;
			case "download":
				this._handler.downloadFlavor(this._selectedFlavor);
				break;
			case "upload":
				this.fileDialog.open();
				break;
			case "import":
				this.importPopup.open();
				break;
			case "convert":
				this._handler.convertFlavor(this._selectedFlavor);
				break;
			case "reconvert":
				this._handler.reconvertFlavor(this._selectedFlavor);
				break;
			case "preview":
				this.previewPopup.open();
				break;
			case "drm":
				this.drmPopup.open();
				break;
		}
	}

	private _setUploadFilter(entry: KalturaMediaEntry): string{
		let filter = "";
		if (entry.mediaType.toString() === KalturaMediaType.video.toString()){
			filter = "video/*";
		}
		if (entry.mediaType.toString() === KalturaMediaType.audio.toString()){
			filter = "audio/*";
		}
		return filter;
	}

	public _onFileSelected(selectedFiles: FileList) {
		if (selectedFiles && selectedFiles.length) {
			const fileData: File = selectedFiles[0];
			this._handler.uploadFlavor(this._selectedFlavor, fileData);
		}
	}

    ngOnDestroy() {
	    this._importPopupStateChangeSubscribe.unsubscribe();
    }


    ngAfterViewInit() {
	    if (this.importPopup) {
		    this._importPopupStateChangeSubscribe = this.importPopup.state$
			    .subscribe(event => {
				    if (event.state === PopupWidgetStates.Close) {
					    if (event.context && event.context.flavorUrl){
						    this._handler.importFlavor(this._selectedFlavor, event.context.flavorUrl);
					    }
				    }
			    });
	    }
    }

    _onLoadingAction(actionKey: string) {
        if (actionKey === 'retry') {
			this._handler._fetchFlavors();
        }
    }
}


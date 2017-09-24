import { Component, ViewChild, AfterViewInit,OnInit, OnDestroy } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { FileDialogComponent } from '@kaltura-ng/kaltura-ui';
import { KalturaFlavorAssetStatus } from 'kaltura-typescript-client/types/KalturaFlavorAssetStatus';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { KalturaMediaType } from 'kaltura-typescript-client/types/KalturaMediaType';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { Menu, MenuItem } from 'primeng/primeng';
import { EntryFlavoursHandler } from './entry-flavours-handler';
import { Flavor } from './flavor';
import { EntryFormManager } from '../entry-form-manager';

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
	public _handler: EntryFlavoursHandler;

	private _importPopupStateChangeSubscribe: ISubscription;

	constructor(private _entryFormManager : EntryFormManager, private _appLocalization: AppLocalization) {
    }

    ngOnInit() {
		this._handler = this._entryFormManager.attachWidget(EntryFlavoursHandler);
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
			filter = ".flv,.asf,.qt,.mov,.mpg,.avi,.wmv,.mp4,.3gp,.f4v,.m4v";
		}
		if (entry.mediaType.toString() === KalturaMediaType.audio.toString()){
			filter = ".flv,.asf,.qt,.mov,.mpg,.avi,.wmv,.mp3,.wav";
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
	    this.actionsMenu.hide();
	    this._importPopupStateChangeSubscribe.unsubscribe();

		this._entryFormManager.detachWidget(this._handler);

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
}


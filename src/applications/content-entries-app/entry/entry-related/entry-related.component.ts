import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { EntryRelatedHandler } from './entry-related-handler';
import { KalturaAttachmentType, KalturaAttachmentAsset, KalturaEntryStatus } from 'kaltura-typescript-client/types/all';
import { PopupWidgetComponent } from '@kaltura-ng2/kaltura-ui/popup-widget/popup-widget.component';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { SelectItem, Menu, MenuItem } from 'primeng/primeng';
import { EntryFormManager } from '../entry-form-manager';

@Component({
    selector: 'kEntryRelated',
    templateUrl: './entry-related.component.html',
    styleUrls: ['./entry-related.component.scss']
})
export class EntryRelated implements OnInit, OnDestroy{

    public _loading = false;
    public _loadingError = null;

	@ViewChild('actionsmenu') private actionsMenu: Menu;
	@ViewChild('editPopup') public editPopup: PopupWidgetComponent;
	public _currentFile: KalturaAttachmentAsset;
	public _handler : EntryRelatedHandler;
	public _fileTypes: SelectItem[] = [
		{"label": this._appLocalization.get('applications.content.entryDetails.related.document'), "value": KalturaAttachmentType.document},
		{"label": this._appLocalization.get('applications.content.entryDetails.related.media'), "value": KalturaAttachmentType.media},
		{"label": this._appLocalization.get('applications.content.entryDetails.related.text'), "value": KalturaAttachmentType.text},
	];

	public _actions: MenuItem[] = [];

	constructor(private _entryFormManager : EntryFormManager,
				private _appLocalization: AppLocalization) {
    }

    ngOnDestroy()
	{
		this.actionsMenu.hide();
		this._entryFormManager.detachWidget(this._handler);

	}

	ngOnInit() {

		this._handler = this._entryFormManager.attachWidget(EntryRelatedHandler);

		this._actions = [
			{label: this._appLocalization.get('applications.content.entryDetails.related.edit'), command: (event) => {this.actionSelected("edit");}},
			{label: this._appLocalization.get('applications.content.entryDetails.related.download'), command: (event) => {this.actionSelected("download");}},
			{label: this._appLocalization.get('applications.content.entryDetails.related.delete'), command: (event) => {this.actionSelected("delete");}},
			{label: this._appLocalization.get('applications.content.entryDetails.related.preview'), command: (event) => {this.actionSelected("preview");}}
		];
	}

	openActionsMenu(event: any, file: KalturaAttachmentAsset): void{
		if (this.actionsMenu){
			// save the selected file for usage in the actions menu
			this._currentFile = file;
			//disable Edit action for files that are not in "ready" state
			if (file.status && file.status.toString() !== KalturaEntryStatus.ready.toString()){
				this._actions[0].disabled = true;
			}
			// disable edit, download and preview for added files that were not saved to the server yet (don't have status)
			this._actions[0].disabled = (file.status === undefined);
			this._actions[1].disabled = (file.status === undefined);
			this._actions[3].disabled = (file.status === undefined);
			this.actionsMenu.toggle(event);
		}
	}

	private actionSelected(action: string): void{
		switch (action){
			case "edit":
				this.editPopup.open();
				break;
			case "delete":
				this._handler._removeFile(this._currentFile);
				break;
			case "download":
				this._handler.downloadFile(this._currentFile);
				break;
			case "preview":
				this._handler.previewFile(this._currentFile);
				break;
		}
	}


	// TODO [kmcng] waiting for the new primeng
	// add [rowTrackBy]="_relatedTableRowTrackBy"
	// public _relatedTableRowTrackBy(rowData) : any
	// {
	// 	return rowData.id || rowData.tempId;
	// }

	public _relatedTableRowStyle(rowData, rowIndex): string{
		return rowData.uploading ? "uploading" : rowData.uploadFailure ? "uploadFailure" : '';
	}

    _onLoadingAction(actionKey: string): void {
        if (actionKey === 'retry') {

        }
    }


}


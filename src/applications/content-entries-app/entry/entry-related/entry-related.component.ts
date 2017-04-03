import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { EntryRelatedHandler } from './entry-related-handler';
import { KalturaAttachmentType, KalturaAttachmentAsset, KalturaEntryStatus } from '@kaltura-ng2/kaltura-api/types';
import { PopupWidgetComponent } from '@kaltura-ng2/kaltura-ui/popup-widget/popup-widget.component';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { SelectItem, Menu, MenuItem } from 'primeng/primeng';

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

	public _fileTypes: SelectItem[] = [
		{"label": this._appLocalization.get('applications.content.entryDetails.related.document'), "value": KalturaAttachmentType.Document},
		{"label": this._appLocalization.get('applications.content.entryDetails.related.media'), "value": KalturaAttachmentType.Media},
		{"label": this._appLocalization.get('applications.content.entryDetails.related.text'), "value": KalturaAttachmentType.Text},
	];

	public _actions: MenuItem[] = [];

    constructor(public _handler : EntryRelatedHandler,
				private _appLocalization: AppLocalization) {
    }

    ngOnDestroy()
	{

	}

	ngOnInit() {
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
			if (file.status.toString() !== KalturaEntryStatus.Ready.toString()){
				this._actions[0].disabled = true;
			}
			this.actionsMenu.toggle(event);
		}
	}

	private actionSelected(action: string): void{
		switch (action){
			case "edit":
				this.editPopup.open();
				break;
			case "delete":
				this._handler.removeFile(this._currentFile);
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
		return rowData.uploadToken ? "uoloading" : '';
	}

    _onLoadingAction(actionKey: string): void {
        if (actionKey === 'retry') {

        }
    }


}


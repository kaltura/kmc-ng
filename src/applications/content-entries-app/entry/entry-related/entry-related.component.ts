import { Component, OnInit, HostListener, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { EntryRelatedHandler } from './entry-related-handler';
import { KalturaAttachmentType, KalturaAttachmentAsset, KalturaEntryStatus } from '@kaltura-ng2/kaltura-api/types';
import { PopupWidgetComponent } from '@kaltura-ng2/kaltura-ui/popup-widget/popup-widget.component';
import { AppLocalization } from '@kaltura-ng2/kaltura-common';
import { SelectItem, Menu, MenuItem } from 'primeng/primeng';
import { UploadManagement } from '@kaltura-ng2/kaltura-common/upload-management';
import { KalturaOVPFile } from '@kaltura-ng2/kaltura-common/upload-management/kaltura-ovp';

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
				private _appLocalization: AppLocalization,
				private _uploadManagement : UploadManagement) {
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

		this._uploadManagement.trackedFiles
			.cancelOnDestroy(this)
			.subscribe(
				(filesStatus =>
				{
					console.warn('TODO [kmcng]: check for relevant upload files');
				})
			);
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
				this._handler._deleteFile(this._currentFile.id);
				break;
			case "download":
				this._handler._downloadFile(this._currentFile.id);
				break;
			case "preview":
				this._handler._previewFile(this._currentFile.id);
				break;
		}
	}

    _onLoadingAction(actionKey: string): void {
        if (actionKey === 'retry') {

        }
    }


	@ViewChild('fileUploader')
	private _fileUploader : ElementRef;
    private _handlFileDialogOnClose = false;
    _openFileSelect(event) : void{
    	event.preventDefault();
    	event.stopPropagation();

    	this._fileUploader.nativeElement.click();
    	this._handlFileDialogOnClose = true;
	}

	@HostListener("window:focus")
	_handleFileDialogClosed()
	{
		if (this._handlFileDialogOnClose) {
			this._handlFileDialogOnClose = false;

			const file = this._fileUploader.nativeElement.files.length ? this._fileUploader.nativeElement.files[0] : null;
			if (file)
			{
				this._uploadManagement.newUpload(new KalturaOVPFile(file))
					.subscribe((response) =>
				{
					console.log(response);
				},
					(error) =>
				{
					console.error(error);
				});
			}
		}
	}


}


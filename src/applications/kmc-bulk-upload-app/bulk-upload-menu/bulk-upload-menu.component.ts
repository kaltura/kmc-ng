import { Component, ViewChild } from '@angular/core';
import { FileDialogComponent } from '@kaltura-ng/kaltura-ui';
import { BulkUploadMenuService, BulkUploadTypes } from './bulk-upload-menu.service';

@Component({
  selector: 'kKMCBulkUploadMenu',
  templateUrl: './bulk-upload-menu.component.html',
  styleUrls: ['./bulk-upload-menu.component.scss'],
  providers: [BulkUploadMenuService]
})
export class BulkUploadMenuComponent {
  @ViewChild('fileDialog') fileDialog: FileDialogComponent;

  private _selectedType: BulkUploadTypes;

  public _bulkUploadTypes = BulkUploadTypes;
  public _allowedExtensions = '';
  public _showFileDialog = true;

  constructor(private _menuService: BulkUploadMenuService) {
  }

  // force reload fileDialog component to apply dynamically added filter
  private _openFileDialog() {
    this._showFileDialog = false;
    this._showFileDialog = true;
    setTimeout(() => this.fileDialog.open(), 0);
  }

  public _selectFiles(files): void {
    this._menuService.upload(files, this._selectedType);
  }

  public _invokeFileSelection(type: BulkUploadTypes) {
    this._selectedType = type;
    this._allowedExtensions = this._menuService.getAllowedExtension(type);
    this._openFileDialog();
  }
}

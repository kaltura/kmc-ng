import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { KalturaFlavorParams } from 'kaltura-ngx-client/api/types/KalturaFlavorParams';

@Component({
  selector: 'kTranscodingProfileFalvorsTable',
  templateUrl: './transcoding-profile-flavors-table.component.html',
  styleUrls: ['./transcoding-profile-flavors-table.component.scss']
})
export class TranscodingProfileFlavorsTableComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() selectedFlavors: KalturaFlavorParams[] = [];

  @Input()
  set flavors(data: any[]) {
    if (!this._deferredLoading) {
      this._flavors = [];
      this._cdRef.detectChanges();
      this._flavors = data;
      this._cdRef.detectChanges();
    } else {
      this._deferredFlavors = data;
    }
  }

  @Output() selectedFlavorsChange = new EventEmitter<KalturaFlavorParams[]>();
  @Output() editFlavor = new EventEmitter<KalturaFlavorParams>();

  private _deferredFlavors: KalturaFlavorParams[];
  public _flavors: KalturaFlavorParams[] = [];
  public _emptyMessage: string;
  public _deferredLoading = true;

  constructor(private _appLocalization: AppLocalization,
              private _cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.assignEmptyMessage();
  }

  ngAfterViewInit() {
    if (this._deferredLoading) {
      /* Use timeout to allow the DOM to render before setting the data to the datagrid.
         This prevents the screen from hanging during datagrid rendering of the data.*/
      setTimeout(() => {
        this._deferredLoading = false;
        this._flavors = this._deferredFlavors;
        this._deferredFlavors = null;
      }, 0);
    }
  }

  ngOnDestroy() {
  }

  public _onSelectionChange(event: KalturaFlavorParams[]): void {
    this.selectedFlavorsChange.emit(event);
  }

  public assignEmptyMessage(): void {
    this._emptyMessage = this._appLocalization.get('applications.content.playlistDetails.errors.addAtLeastOneMedia');
  }

  public _editFlavor(flavor: KalturaFlavorParams): void {
    const isSelected = this.selectedFlavors.indexOf(flavor) !== -1;
    if (isSelected) {
      this.editFlavor.emit(flavor);
    }
  }
}


import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { KalturaClient } from 'kaltura-ngx-client';
import { BaseEntryGetAction } from 'kaltura-ngx-client';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { KalturaUtils } from '@kaltura-ng/kaltura-common';
import { AppLocalization } from '@kaltura-ng/mc-shared';
import { KalturaMediaEntry } from 'kaltura-ngx-client';
import { LinkedEntriesControl } from 'app-shared/kmc-shared/dynamic-metadata-form/linked-entries-control';
import { BrowserService } from 'app-shared/kmc-shell';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui';
import { FriendlyHashId } from '@kaltura-ng/kaltura-common';

export interface LinkedMediaEntry extends KalturaMediaEntry {
  selectionId?: string;
}

@Component({
  selector: 'k-linked-entries',
  templateUrl: './linked-entries.component.html',
  styleUrls: ['./linked-entries.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: LinkedEntriesComponent,
    multi: true
  }]
})
export class LinkedEntriesComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() control: LinkedEntriesControl;
  @Input() form: FormGroup;
  @Input() profileName: string;

  @ViewChild('addEntries') entriesSelector: PopupWidgetComponent;

  private _innerValue: string[] = [];
  private _selectionIdGenerator = new FriendlyHashId();

  public _blockerMessage: AreaBlockerMessage;
  public _showLoader = false;
  public _selectedEntries: LinkedMediaEntry[] = [];
  public _entries: Partial<LinkedMediaEntry>[] = [];
  public _isReady = false;
  public _addBtnTitle: string;

  private onTouchedCallback: () => void = () => {
  };
  private onChangeCallback: (_: any) => void = () => {
  };

  constructor(private _kalturaClient: KalturaClient,
              private _browserService: BrowserService,
              private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    this._isReady = true;

    if (this.control) {
      this._addBtnTitle = this.control.allowMultipleEntries
        ? this._appLocalization.get('applications.content.entryDetails.metadata.addEntries')
        : this._appLocalization.get('applications.content.entryDetails.metadata.addEntry');
    }
  }

  ngOnDestroy() {
  }

  private _updateEntries(): void {
    if (this._innerValue && this._innerValue.length) {
      this._blockerMessage = null;
      this._showLoader = true;

      const requests = this._innerValue.map(entryId => new BaseEntryGetAction({ entryId }));

      this._kalturaClient.multiRequest(requests)
        .subscribe(
          responses => {
            const missingEntryIds = [];
            if (responses.hasErrors() && !responses.every(({ error }) => !error || error.code === 'ENTRY_ID_NOT_FOUND')) {
              this._blockerMessage = new AreaBlockerMessage({
                message: this._appLocalization.get('applications.content.entryDetails.errors.entriesLoadError'),
                buttons: [{
                  label: this._appLocalization.get('applications.content.entryDetails.errors.retry'),
                  action: () => {
                    this._updateEntries();
                  }
                }]
              });
            } else {
              this._entries = [];

              responses.forEach((response, index) => {
                if (response.error && response.error.code === 'ENTRY_ID_NOT_FOUND') {
                  missingEntryIds.push(this._innerValue[index]); // TODO [kmcng] replace with args value after client lib fixed
                } else {
                  this._entries.push({
                    id: response.result.id,
                    selectionId: this._generateUniqueSelectionId(),
                    name: response.result.name,
                    thumbnailUrl: response.result.thumbnailUrl
                  });
                }
              });

              if (missingEntryIds.length > 0) {
                this._browserService.alert({
                  header: this._appLocalization.get(
                    'applications.content.entryDetails.metadata.customDataError',
                    [this.profileName]
                  ),
                  message: this._appLocalization.get(
                    'applications.content.entryDetails.metadata.missingEntriesWarning',
                    [missingEntryIds.join(', ')]
                  ),
                  accept: () => this._propogateChanges()
                });
              }
              this._showLoader = false;
            }
          }
        );
    }
  }

  private _propogateChanges(): void {
    this._innerValue = (this._entries || []).map(entry => entry.id);
    this.onChangeCallback(this._innerValue);
  }

  private _generateUniqueSelectionId(): string {
    return this._selectionIdGenerator.generateUnique(this._entries.map(item => item.selectionId));
  }

  private _extendWithSelectionId(entries: KalturaMediaEntry[]): LinkedMediaEntry[] {
    return entries.map(entry => {
      (<LinkedMediaEntry>entry).selectionId = this._generateUniqueSelectionId();

      return (<LinkedMediaEntry>entry);
    });
  }

  // Set touched on blur
  public onBlur(): void {
    this.onTouchedCallback();
  }

  // From ControlValueAccessor interface
  public writeValue(value: any): void {
    if (value !== this._innerValue) {
      this._innerValue = value || [];
      this._updateEntries();
    }
  }

  // From ControlValueAccessor interface
  public registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  // From ControlValueAccessor interface
  public registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }

  public _deleteEntry(entry: KalturaMediaEntry): void {
    this._clearSelection();
    this._entries.splice(this._entries.indexOf(entry), 1);
    this._propogateChanges();
  }


  public _moveUpSelections(): void {
    if (KalturaUtils.moveUpItems(this._entries, this._selectedEntries)) {
      this._propogateChanges();
    }
  }

  public _moveDownSelections(): void {
    if (KalturaUtils.moveDownItems(this._entries, this._selectedEntries)) {
      this._propogateChanges();
    }
  }

  public _deleteSelections(): void {
    if (this._selectedEntries && this._selectedEntries.length) {
      this._selectedEntries.forEach(selectedEntry => {
        const selectedEntryIndex = this._entries.indexOf(selectedEntry);

        if (selectedEntryIndex >= 0) {
          this._entries.splice(selectedEntryIndex, 1);
        }
      });

      this._clearSelection();
      this._propogateChanges();
    }
  }

  public _clearSelection(): void {
    this._selectedEntries = [];
  }

  public _addEntries(entries: KalturaMediaEntry[]): void {
    this._entries = this._extendWithSelectionId(entries);
    this._propogateChanges();
  }

  public _openEntriesSelector(): void {
    if (!this.control.allowMultipleEntries && this._entries.length > 0) {
      this._browserService.confirm({
        message: this._appLocalization.get('applications.content.entryDetails.metadata.replaceLinkedEntry'),
        accept: () => this.entriesSelector.open()
      });
    } else {
      this.entriesSelector.open();
    }
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { KalturaMediaEntry } from 'kaltura-ngx-client';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'kEditDistributionProfileMetadata',
  templateUrl: './edit-distribution-profile-metadata.component.html',
  styleUrls: ['./edit-distribution-profile-metadata.component.scss']
})
export class EditDistributionProfileMetadataComponent implements OnInit {
  @Input() entry: KalturaMediaEntry;

  public _metadataForm: FormGroup;
  public _nameField: AbstractControl;
  public _descriptionField: AbstractControl;
  public _tagsField: AbstractControl;

  constructor(private _fb: FormBuilder) {
    this._buildForm();
  }

  ngOnInit() {
    if (this.entry) {
      this._metadataForm.setValue({
        name: this.entry.name,
        description: this.entry.description || '',
        tags: (this.entry.tags ? this.entry.tags.split(',').map(item => item.trim()) : null)
      });
    }
  }

  private _buildForm(): void {
    this._metadataForm = this._fb.group({
      name: '',
      description: '',
      tags: null
    });

    this._nameField = this._metadataForm.controls['name'];
    this._descriptionField = this._metadataForm.controls['description'];
    this._tagsField = this._metadataForm.controls['tags'];
    this._metadataForm.disable();
  }
}


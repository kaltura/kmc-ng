import { Component, Input, OnInit } from '@angular/core';
import { ExtendedKalturaDistributionThumbDimensions } from '../../edit-distribution-profile.component';

@Component({
  selector: 'kEditDistributionProfileThumbnailItem',
  templateUrl: './thumbnail-item.component.html',
  styleUrls: ['./thumbnail-item.component.scss']
})
export class EditDistributionProfileThumbnailItemComponent implements OnInit {
  @Input() thumbnail: ExtendedKalturaDistributionThumbDimensions | null;

  private _entryThumbnails: {
    size: number,
    url: string;
    id: string
  }[] = [];

  public _showNextButton = false;
  public _currentThumbnailIndex = 0;
  public _currentThumbnail: {
    size: number,
    url: string;
    id: string
  } = null;

  ngOnInit() {
    if (!this.thumbnail || !this.thumbnail.entryThumbnails || !this.thumbnail.entryThumbnails.length) {
      this._currentThumbnail = null;
      return;
    }

    this._entryThumbnails = this.thumbnail.entryThumbnails;

    this._showNextButton = this._entryThumbnails.length > 1;
    this._currentThumbnail = this._entryThumbnails[0];
    this._currentThumbnailIndex = 0;
  }

  public _nextThumbnail(): void {
    const nextIndex = this._currentThumbnailIndex + 1;
    const maxIndex = this._entryThumbnails.length - 1;
    this._currentThumbnailIndex = nextIndex > maxIndex ? 0 : nextIndex;
    this._currentThumbnail = this._entryThumbnails[this._currentThumbnailIndex];
  }
}


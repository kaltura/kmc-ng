import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { environment } from 'app-environment';

@Component({
    selector: 'kAdditionalFilters',
    templateUrl: './additional-filters.component.html',
    styleUrls: ['./additional-filters.component.scss']
})
export class AdditionalFiltersComponent{
  _createdAtDateRange: string = environment.modules.dropFolders.createdAtDateRange;
	@Input() parentPopupWidget: PopupWidgetComponent;
	@Input() _createdAfter: Date;
	@Input() _createdBefore: Date;
	@Output() createdChanged = new EventEmitter<any>();

   constructor() {}

	public _onCreatedChanged() : void
	{
		if (this._createdAfter || this._createdBefore) {
			this._updateDates();
		}
	}

	public _clearCreatedComponents() : void {
    if(this._createdAfter || this._createdBefore) {
      this._createdAfter = null;
      this._createdBefore = null;
      this._updateDates();
    }
	}

	public _close(){
		if (this.parentPopupWidget){
			this.parentPopupWidget.close();
		}
	}

	// emitting the createdAfter and createdBefore values
	public _updateDates() : void {
		this.createdChanged.emit({
			'createdAfter': this._createdAfter,
			'createdBefore': this._createdBefore
		});
	}
}

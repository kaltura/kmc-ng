import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PopupWidgetComponent } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { environment } from 'app-environment';

@Component({
    selector: 'kDatesFilters',
    templateUrl: './dates-filters.component.html',
    styleUrls: ['./dates-filters.component.scss']
})
export class DatesFiltersComponent{
  _createdAtDateRange: string = environment.modules.dropFolders.createdAtDateRange;
	@Input() parentPopupWidget: PopupWidgetComponent;
	@Input() _createdAfter: number;
	@Input() _createdBefore: number;
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

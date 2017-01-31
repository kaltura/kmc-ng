import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TreeSelectionModes } from '@kaltura-ng2/kaltura-primeng-ui/tree-selection';

@Component({
    selector: 'kCategoriesFilterPrefs',
    templateUrl: './categories-filter-preferences.component.html',
    styleUrls: ['./categories-filter-preferences.component.scss']
})
export class CategoriesFilterPrefsComponent{

    @Input() selectionMode: TreeSelectionModes;
    @Output() selectionModeChange:EventEmitter<TreeSelectionModes> = new EventEmitter<TreeSelectionModes>();

    // expose enum to the template
    public _TreeSelectionModes = TreeSelectionModes;

    constructor() {
    }

    prefChange(){
        // use timeout to allow data binding to update showChildren before emitting the change event and saving to local storage
        setTimeout(()=>{
            this.selectionModeChange.emit(this.selectionMode);
        },0);
    }
}


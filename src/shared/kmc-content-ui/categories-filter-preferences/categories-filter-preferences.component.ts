import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'kCategoriesFilterPrefs',
    templateUrl: './categories-filter-preferences.component.html',
    styleUrls: ['./categories-filter-preferences.component.scss']
})
export class CategoriesFilterPrefsComponent{

    @Input() showChildren: boolean;
    @Output() showChildrenChange:EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor() {
    }

    prefChange(){
        // use timeout to allow data binding to update showChildren before emitting the change event and saving to local storage
        setTimeout(()=>{
            this.showChildrenChange.emit(this.showChildren);
        },0);
    }
}


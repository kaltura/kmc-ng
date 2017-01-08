import { Component, Input, Output, EventEmitter} from '@angular/core';
import {BrowserService} from "../../kmc-shell/providers/browser.service";

@Component({
    selector: 'kCategoriesFilterPrefs',
    templateUrl: './categories-filter-preferences.component.html',
    styleUrls: ['./categories-filter-preferences.component.scss']
})
export class CategoriesFilterPrefsComponent{

    @Input() showChildren: string;
    @Output() showChildrenChange:EventEmitter<string> = new EventEmitter<string>();

    constructor(public browserService: BrowserService) {
    }

    prefChange(){
        // use timeout to allow data binding to update showChildren before emitting the change event and saving to local storage
        setTimeout(()=>{
            this.showChildrenChange.emit(this.showChildren);
            this.browserService.setInLocalStorage("categoriesTree.autoSelectChildren", this.showChildren);
        },0)

    }

}


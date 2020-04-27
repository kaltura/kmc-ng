import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Dropdown } from 'primeng/dropdown/dropdown';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DomHandler } from 'primeng/dom/domhandler';
import { ObjectUtils } from 'primeng/utils/objectutils';

export const DROPDOWN_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SearchableDropdownComponent),
    multi: true
};

@Component({
    selector: 'kSearchableDropdown',
    templateUrl: 'searchable-dropdown.component.html',
    styleUrls: ['searchable-dropdown.component.scss'],
    animations: [
        trigger('overlayAnimation', [
            state('void', style({
                transform: 'translateY(5%)',
                opacity: 0
            })),
            state('visible', style({
                transform: 'translateY(0)',
                opacity: 1
            })),
            transition('void => visible', animate('225ms ease-out')),
            transition('visible => void', animate('195ms ease-in'))
        ])
    ],
    host: {
        '[class.ui-inputwrapper-filled]': 'filled',
        '[class.ui-inputwrapper-focus]': 'focused'
    },
    providers: [DomHandler, ObjectUtils, DROPDOWN_VALUE_ACCESSOR]
})

export class SearchableDropdownComponent extends Dropdown {
    @Input() loading: boolean;
    @Input() minLength: number;

    @Output() customSearch = new EventEmitter<string>();

    public onFilter(event): void {
        const inputValue = event.target.value;
        if (!inputValue || !inputValue.length) { // clear filter
            this.filterValue = null;
            this.optionsToDisplay = this.options;
            this.customSearch.emit(this.filterValue);
            this.optionsChanged = true;
        } else if (!this.minLength || inputValue.length >= this.minLength) {
            this.filterValue = inputValue;
            this.customSearch.emit(this.filterValue);
            this.optionsChanged = true;
        }
    }

    public _onItemClick(event, option): void {
        event.option = option;
        super.onItemClick(event);
    }
}

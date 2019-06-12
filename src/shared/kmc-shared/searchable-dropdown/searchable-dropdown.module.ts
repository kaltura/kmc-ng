import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownModule as PrimeDropdownModule } from 'primeng/primeng';
import { SearchableDropdownComponent } from './searchable-dropdown.component';

@NgModule({
    imports: [
        CommonModule,
        PrimeDropdownModule,
    ],
    declarations: [
        SearchableDropdownComponent,
    ],
    exports: [
        SearchableDropdownComponent,
    ],
    providers: []
})
export class SearchableDropdownModule {

}

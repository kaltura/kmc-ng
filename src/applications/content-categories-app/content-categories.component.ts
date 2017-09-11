import { CategoriesService } from './categories/categories.service';
import { Component } from '@angular/core';

@Component({
    selector: 'kCategories',
    templateUrl: './content-categories.component.html',
    styleUrls: ['./content-categories.component.scss'],
    providers: [CategoriesService]
})

export class ContentCategoriesComponent {
}
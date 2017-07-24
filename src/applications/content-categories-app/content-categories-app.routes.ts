import { Route } from '@angular/router';

import { ContentCategoriesComponent } from './content-categories.component';
import { CategoriesListComponent } from './categories/categories-list.component';
import { CategoryComponent } from './category/category.component';

export const routing: Route[] = [
	{
		path: '', component: ContentCategoriesComponent,
		children: [
			{ path: '', redirectTo: 'list', pathMatch: 'full' },
			{ path: 'list', component: CategoriesListComponent },
			{
				path: 'category/:id', component: CategoryComponent,
				data: {
					entryRoute: true
				}
			}
		]
	},
];

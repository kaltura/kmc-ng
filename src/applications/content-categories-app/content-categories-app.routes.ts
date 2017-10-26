import { CategoryCanDeactivate } from './category/category-can-deactivate.service';
import { CategoryEntitlementsComponent } from './category/category-entitlements/category-entitlements.component';
import { CategoryMetadataComponent } from './category/category-metadata/category-metadata.component';
import { CategoryWidgetKeys } from './category/category-widget-keys';
import { CategorySubcategoriesComponent } from './category/category-subcategories/category-subcategories.component';
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
				path: 'category/:id', canDeactivate: [CategoryCanDeactivate], component: CategoryComponent,
				data: {
					categoryRoute: true
				},
				children: [
					{ path: '', redirectTo: 'metadata', pathMatch: 'full' },
					{ path: 'metadata', component: CategoryMetadataComponent, data: { sectionKey: CategoryWidgetKeys.Metadata } },
					{ path: 'entitlements', component: CategoryEntitlementsComponent, data: { sectionKey: CategoryWidgetKeys.Entitlements } },
					{ path: 'subcategories', component: CategorySubcategoriesComponent, data: { CategoryWidgetKeys: CategoryWidgetKeys.SubCategories } },
				]
			}
		]
	},
];

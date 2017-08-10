import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'app-environment';


@Pipe({name: 'kMaxCategories'})
export class MaxCategoriesPipe implements PipeTransform {
  constructor() {
  }

  transform(value: number): number {
  	const maxCategories = environment.categoriesShared.MAX_CATEGORIES;
    return value >  maxCategories ? maxCategories : value;
  }
}

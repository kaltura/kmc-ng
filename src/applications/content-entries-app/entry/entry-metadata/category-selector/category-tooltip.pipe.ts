import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'kCategoryTooltip'})
export class CategoryTooltip implements PipeTransform {
    constructor() {
    }

    transform(value: string[]): string {
        if (value instanceof Array)
        {
            return value.join(' > ');
        }else
        {
            return value;
        }
    }
}

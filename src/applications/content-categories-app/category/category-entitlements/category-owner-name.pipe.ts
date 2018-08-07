import {Pipe, PipeTransform} from '@angular/core';
import {KalturaUser} from 'kaltura-ngx-client';

@Pipe({ name: 'kCategoryOwnerName' })
export class CategoryOwnerNamePipe implements PipeTransform {
  constructor() {
  }

  transform(value: KalturaUser): string {
    return value.email || value.id;
  }
}

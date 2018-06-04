import {Injectable} from '@angular/core';
import {CategoryWidget} from '../category-widget';
import {KalturaLogger} from '@kaltura-ng/kaltura-logger';

@Injectable()
export class CategoryDetailsWidget extends CategoryWidget {
  constructor(logger: KalturaLogger) {
    super('categoryDetails', logger);
  }

  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset(): void {
  }
}

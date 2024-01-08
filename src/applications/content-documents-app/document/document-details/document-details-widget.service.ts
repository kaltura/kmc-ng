import { Injectable } from '@angular/core';
import { DocumentWidget } from '../document-widget';
import { KalturaLogger } from '@kaltura-ng/kaltura-logger';

@Injectable()
export class DocumentDetailsWidget extends DocumentWidget {
  constructor(logger: KalturaLogger) {
    super('documentDetails', logger);
  }

  /**
   * Do some cleanups if needed once the section is removed
   */
  protected onReset(): void {
  }
}

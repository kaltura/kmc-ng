import { Component } from '@angular/core';
import { MultiAccountStoreService } from './multi-account-store/multi-account-store.service';
import { KalturaLogger, KalturaLoggerName } from '@kaltura-ng/kaltura-logger';

@Component({
  selector: 'kMultiAccount',
  templateUrl: './administration-multi-account.component.html',
  styleUrls: ['./administration-multi-account.component.scss'],
  providers: [
      MultiAccountStoreService,
    KalturaLogger.createLogger('AdministrationMultiAccount')
  ]
})

export class AdministrationMultiAccountComponent {
}

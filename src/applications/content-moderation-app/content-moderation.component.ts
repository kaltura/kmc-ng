import { Component } from '@angular/core';
import {
    EntriesManualExecutionModeToken, EntriesStore,
    EntriesStorePaginationCacheToken
} from 'app-shared/content-shared/entries/entries-store/entries-store.service';
import { ModerationsListService } from './entries/moderations-list.service';

@Component({
  selector: 'kModeration',
  templateUrl: './content-moderation.component.html',
  styleUrls: ['./content-moderation.component.scss'],
  providers: [
      ModerationsListService,
        EntriesStore,
      { provide: EntriesManualExecutionModeToken, useValue: true},
    { provide: EntriesStorePaginationCacheToken, useValue: 'moderation-entries-list' }
  ]
})
export class ContentModerationComponent {
}


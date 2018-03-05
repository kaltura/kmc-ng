import { Component } from '@angular/core';
import { EntriesStore, EntriesStorePaginationCacheToken } from 'app-shared/content-shared/entries/entries-store/entries-store.service';

@Component({
  selector: 'kModeration',
  templateUrl: './content-moderation.component.html',
  styleUrls: ['./content-moderation.component.scss'],
  providers: [
    EntriesStore,
    { provide: EntriesStorePaginationCacheToken, useValue: 'moderation-entries-list' }
  ]
})
export class ContentModerationComponent {
}


import { EntriesListComponent } from './entries-list.component';
import { EntriesTableComponent } from './entries-table.component';
import { EntryReportComponent } from '../entry-report/entry-report.component';
import { ModerationPipe } from '../pipes/moderation.pipe';
import { FlagTypePipe } from '../pipes/flagType.pipe';

export const EntriesComponentsList = [
  EntriesListComponent,
  EntriesTableComponent,
  EntryReportComponent,
  ModerationPipe,
  FlagTypePipe
];

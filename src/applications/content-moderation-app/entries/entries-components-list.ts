import { EntryReportComponent } from '../entry-report/entry-report.component';
import { ModerationPipe } from '../pipes/moderation.pipe';
import { FlagTypePipe } from '../pipes/flagType.pipe';
import { EntriesListHolderComponent } from './entries-list-holder.component';

export const EntriesComponentsList = [
  EntriesListHolderComponent,
  EntryReportComponent,
  ModerationPipe,
  FlagTypePipe
];

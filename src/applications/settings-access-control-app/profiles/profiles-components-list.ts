import { ProfilesTableComponent } from './profiles-table/profiles-table.component';
import { ProfilesListComponent } from './profiles-list/profiles-list.component';
import { CountryFromCodePipe } from './pipes/country-from-code.pipe';
import { EditProfileComponent } from './edit-profile/edit-profile.component';

export const ProfilesComponentsList = [
  ProfilesTableComponent,
  ProfilesListComponent,
  EditProfileComponent,
  CountryFromCodePipe
];

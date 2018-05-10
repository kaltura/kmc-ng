import {EntryMetadata} from './entry-metadata/entry-metadata.component';
import {EntryThumbnails} from './entry-thumbnails/entry-thumbnails.component';
import {EntryThumbnailCapture} from './entry-thumbnails/entry-thumbnails-capture.component';
import {EntryAccessControl} from './entry-access-control/entry-access-control.component';
import {EntryScheduling} from './entry-scheduling/entry-scheduling.component';
import {EntryFlavours} from './entry-flavours/entry-flavours.component';
import {DRMDetails} from './entry-flavours/drm-details/drm-details.component';
import {FlavorPreview} from './entry-flavours/flavor-preview/flavor-preview.component';
import {FlavorImport} from './entry-flavours/flavor-import/flavor-import.component';
import {EntryCaptions} from './entry-captions/entry-captions.component';
import {EntryCaptionsEdit} from './entry-captions/entry-captions-edit.component';
import {EntryLive} from './entry-live/entry-live.component';
import {EntryRelated} from './entry-related/entry-related.component';
import {EntryRelatedEdit} from './entry-related/entry-related-edit.component';
import {EntryClips} from './entry-clips/entry-clips.component';
import {EntryUsers} from './entry-users/entry-users.component';
import {EntrySectionsList} from './entry-sections-list/entry-sections-list.component';
import {EntryComponent} from './entry.component';
import {EntryPreview} from './entry-preview/entry-preview.component';
import {EntryDetails} from './entry-details/entry-details.component';
import {JumpToSection} from './entry-metadata/jump-to-section.component';
import {CategoriesSelector} from './entry-metadata/category-selector/categories-selector.component';
import {TagsPipe} from './entry-flavours/tags.pipe';

import {EntryDistributionComponent } from './entry-distribution/entry-distribution.component';
import { UndistributedProfileComponent } from './entry-distribution/undistributed-profile/undistributed-profile.component';
import { DistributedProfileComponent } from './entry-distribution/distributed-profile/distributed-profile.component';
import { DistributionStatusPipe } from './entry-distribution/pipes/distribution-status.pipe';
import { DistributedProfileErrorInfoComponent } from './entry-distribution/distributed-profile-error-info/distributed-profile-error-info.component';
import { DistributedProfileErrorsComponent } from './entry-distribution/distributed-profile-errors/distributed-profile-errors.component';
import { EditDistributionProfileComponent } from './entry-distribution/edit-distribution-profile/edit-distribution-profile.component';
import { DistributionProviderTypeIconPipe } from './entry-distribution/pipes/distribution-provider-type-icon.pipe';
import { EditDistributionProfileFlavorsComponent } from './entry-distribution/edit-distribution-profile/edit-distribution-profile-flavors/edit-distribution-profile-flavors.component';
import { EditDistributionProfileMetadataComponent } from './entry-distribution/edit-distribution-profile/edit-distribution-profile-metadata/edit-distribution-profile-metadata.component';
import { EditDistributionProfileThumbnailsComponent } from './entry-distribution/edit-distribution-profile/edit-distribution-profile-thumbnails/edit-distribution-profile-thumbnails.component';
import { EditDistributionProfileThumbnailItemComponent } from './entry-distribution/edit-distribution-profile/edit-distribution-profile-thumbnails/thumbnail-item/thumbnail-item.component';
import {EntryAdvertisementsComponent} from './entry-advertisements/entry-advertisements.component';
import {EntryEditorComponent} from './entry-editor/entry-editor.component';



export const EntryComponentsList = [
    CategoriesSelector,
    DRMDetails,
    EntryAccessControl,
    EntryCaptions,
    EntryCaptionsEdit,
    EntryClips,
    EntryAdvertisementsComponent,
    EntryComponent,
    EntryFlavours,
    EntryLive,
    EntryMetadata,
    EntryPreview,
    EntryDetails,
    EntryRelated,
    EntryRelatedEdit,
    EntryScheduling,
    EntrySectionsList,
    EntryThumbnails,
    EntryThumbnailCapture,
    EntryUsers,
    FlavorImport,
    FlavorPreview,
    JumpToSection,
    TagsPipe,
    EntryDistributionComponent,
    DistributedProfileComponent,
    UndistributedProfileComponent,
    DistributionStatusPipe,
    DistributedProfileErrorsComponent,
    DistributedProfileErrorInfoComponent,
    EditDistributionProfileComponent,
    DistributionProviderTypeIconPipe,
    EditDistributionProfileFlavorsComponent,
    EditDistributionProfileMetadataComponent,
    EditDistributionProfileThumbnailsComponent,
    EditDistributionProfileThumbnailItemComponent,
    EntryEditorComponent
];

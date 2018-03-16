export interface AppPermission {
  value: string;
  label: string;
  isAdvancedGroup?: boolean;
  dependsOnFeature?: string;
  items?: AppPermission[];
  disabled?: boolean;
}

export const APP_PERMISSIONS: AppPermission[] = [
  {
    value: 'CONTENT_INGEST_BASE',
    label: 'Content Ingestion',
    isAdvancedGroup: false,
    items: [
      {
        value: 'CONTENT_INGEST_BULK_UPLOAD',
        label: 'Import Files & Bulk Upload',
        disabled: true
      },
      {
        value: 'CONTENT_INGEST_REMOTE_STORAGE',
        label: 'Set Link to Files on Remote Storage',
        dependsOnFeature: 'FEATURE_REMOTE_STORAGE_INGEST'
      },
      {
        value: 'dropFolder.CONTENT_INGEST_DROP_FOLDER_MATCH',
        label: 'Match Media Files from Drop Folder',
        dependsOnFeature: 'CONTENT_INGEST_DROP_FOLDER_MATCH'
      },
      {
        value: 'CONTENT_INGEST_EXTERNAL_SEARCH',
        label: 'Import from Web',
      },
      {
        value: 'CONTENT_INGEST_WEBCAM',
        label: 'Record from Webcam',
      },
      {
        value: 'CONTENT_INGEST_ORPHAN_VIDEO',
        label: 'Prepare Vvalueeo Entry',
      },
      {
        value: 'CONTENT_INGEST_ORPHAN_AUDIO',
        label: 'Prepare Audio Entry',
      },
      {
        value: 'LIVE_STREAM_ADD',
        label: 'Prepare Live Stream Entry',
        dependsOnFeature: 'FEATURE_LIVE_STREAM'
      },
    ]
  },
  {
    value: 'CONTENT_MANAGE_BASE',
    label: 'Content Management',
    isAdvancedGroup: true,
    items: [
      {
        value: 'CONTENT_MANAGE_METADATA',
        label: 'Modify Metadata'
      },
      {
        value: 'CONTENT_INGEST_REFERENCE_MODIFY',
        label: 'View / Modify Reference value'
      },
      {
        value: 'CONTENT_MANAGE_ASSIGN_CATEGORIES',
        label: 'Modify Entry\'s Category'
      },
      {
        value: 'CONTENT_MANAGE_THUMBNAIL',
        label: 'Modify Thumbnail'
      },
      {
        value: 'CONTENT_MANAGE_SCHEDULE',
        label: 'Modify Scheduling'
      },
      {
        value: 'CONTENT_MANAGE_ACCESS_CONTROL',
        label: 'Modify Access Control'
      },
      {
        value: 'CONTENT_MANAGE_CUSTOM_DATA',
        label: 'Modify Custom Data',
        dependsOnFeature: 'CONTENT_MANAGE_CUSTOM_DATA'
      },
      {
        value: 'CONTENT_MANAGE_ENTRY_USERS',
        label: 'Modify Entry\'s User Settings',
        dependsOnFeature: 'FEATURE_END_USER_MANAGE'
      },
      {
        value: 'CONTENT_MANAGE_DELETE',
        label: 'Delete Content'
      },
      {
        value: 'CONTENT_MANAGE_EMBED_CODE',
        label: 'Grab Embed Code'
      },
      {
        value: 'CONTENT_INGEST_INTO_ORPHAN',
        label: 'Add Media to an Entry'
      },
      {
        value: 'CONTENT_INGEST_INTO_READY',
        label: 'Replace Entry\'s Media',
        dependsOnFeature: 'FEATURE_ENTRY_REPLACEMENT'
      },
      {
        value: 'CONTENT_INGEST_REPLACE',
        label: 'Approve Media Replacement',
        dependsOnFeature: 'FEATURE_ENTRY_REPLACEMENT_APPROVAL'
      },
      {
        value: 'CONTENT_MANAGE_RECONVERT',
        label: 'Manage Flavors'
      },
      {
        value: 'CONTENT_INGEST_CLIP_MEDIA',
        label: 'Clipping',
        dependsOnFeature: 'FEATURE_CLIP_MEDIA'
      },
      {
        value: 'CONTENT_MANAGE_EDIT_CATEGORIES',
        label: 'Edit Categories'
      },
      {
        value: 'CONTENT_MANAGE_CATEGORY_USERS',
        label: 'Edit Category\'s Entitlement Settings',
        dependsOnFeature: 'FEATURE_ENTITLEMENT'
      },
      {
        value: 'LIVE_STREAM_UPDATE',
        label: 'Update Live Stream',
        dependsOnFeature: 'FEATURE_LIVE_STREAM'
      },
      {
        value: 'CONTENT_MANAGE_DOWNLOAD',
        label: 'Download Files'
      },
      {
        value: 'cuePoint.MANAGE',
        label: 'Edit Entry Advertisement',
        dependsOnFeature: 'ADCUEPOINT_PLUGIN_PERMISSION'
      },
      {
        value: 'CAPTION_MODIFY',
        label: 'Edit Entry Captions',
        dependsOnFeature: 'CAPTION_PLUGIN_PERMISSION'
      },
      {
        value: 'ATTACHMENT_MODIFY',
        label: 'Edit Related Files',
        dependsOnFeature: 'ATTACHMENT_PLUGIN_PERMISSION'
      }
    ]
  },
  {
    value: 'BULK_LOG_BASE',
    label: 'Bulk Upload Log',
    isAdvancedGroup: true,
    items: [
      {
        value: 'BULK_LOG_DOWNLOAD',
        label: 'Download Bulk Upload Files'
      },
      {
        value: 'BULK_LOG_DELETE',
        label: 'Delete Bulk Upload Items'
      }
    ]
  },
  {
    value: 'CONTENT_MODERATE_BASE',
    label: 'Content Moderation',
    isAdvancedGroup: true,
    items: [
      {
        value: 'CONTENT_MODERATE_APPROVE_REJECT',
        label: 'Approve/Reject Content'
      },
      {
        value: 'CONTENT_MODERATE_METADATA',
        label: 'Moderate Metadata'
      },
      {
        value: 'CONTENT_MODERATE_CUSTOM_DATA',
        label: 'Moderate Custom Metadata',
        dependsOnFeature: 'METADATA_PLUGIN_PERMISSION'
      }
    ]
  },
  {
    value: 'PLAYLIST_BASE',
    label: 'Playlist Management',
    isAdvancedGroup: true,
    items: [
      {
        value: 'PLAYLIST_ADD',
        label: 'Create Playlists'
      },
      {
        value: 'PLAYLIST_UPDATE',
        label: 'Modify Playlists'
      },
      {
        value: 'PLAYLIST_DELETE',
        label: 'Delete Playlists'
      },
      {
        value: 'PLAYLIST_EMBED_CODE',
        label: 'Grab Playlist Embed Code'
      }
    ]
  },
  {
    value: 'SYNDICATION_BASE',
    label: 'Syndication Management',
    isAdvancedGroup: true,
    items: [
      {
        value: 'SYNDICATION_ADD',
        label: 'Create Syndication Feeds'
      },
      {
        value: 'SYNDICATION_UPDATE',
        label: 'Modify Syndication Feeds'
      },
      {
        value: 'SYNDICATION_DELETE',
        label: 'Delete Syndication Feeds'
      }
    ]
  },
  {
    value: 'CONTENT_MANAGE_DISTRIBUTION_BASE',
    label: 'Content Distribution',
    isAdvancedGroup: true,
    dependsOnFeature: 'CONTENTDISTRIBUTION_PLUGIN_PERMISSION',
    items: [
      {
        value: 'CONTENT_MANAGE_DISTRIBUTION_WHERE',
        label: 'Select Distribution Points',
        dependsOnFeature: 'CONTENT_MANAGE_DISTRIBUTION_WHERE'
      },
      {
        value: 'CONTENT_MANAGE_DISTRIBUTION_SEND',
        label: 'Distribute',
        dependsOnFeature: 'CONTENTDISTRIBUTION_PLUGIN_PERMISSION'
      },
      {
        value: 'CONTENT_MANAGE_DISTRIBUTION_REMOVE',
        label: 'Remove Distributed Content',
        dependsOnFeature: 'CONTENTDISTRIBUTION_PLUGIN_PERMISSION'
      }
    ]
  },
  {
    value: 'dropFolder.CONTENT_INGEST_DROP_FOLDER_BASE',
    label: 'Drop Folders Control',
    isAdvancedGroup: true,
    dependsOnFeature: 'DROPFOLDER_PLUGIN_PERMISSION',
    items: [
      {
        value: 'dropFolder.CONTENT_INGEST_DROP_FOLDER_DELETE',
        label: 'Delete Files',
        dependsOnFeature: 'DROPFOLDER_PLUGIN_PERMISSION'
      }
    ]
  },
  {
    value: 'STUDIO_BASE',
    label: 'Studio',
    isAdvancedGroup: true,
    items: [
      {
        value: 'STUDIO_ADD_UICONF',
        label: 'Create Players'
      },
      {
        value: 'STUDIO_UPDATE_UICONF',
        label: 'Modify Players'
      },
      {
        value: 'STUDIO_DELETE_UICONF',
        label: 'Delete Players'
      },
      {
        value: 'STUDIO_SELECT_CONTENT',
        label: 'Select Player Content'
      }
    ]
  },
  {
    value: 'ADVERTISING_UPDATE_SETTINGS',
    label: 'Set Advertising Settings',
    dependsOnFeature: 'FEATURE_VAST'
  },
  {
    value: 'ANALYTICS_BASE',
    label: 'Video Analytics',
    dependsOnFeature: 'FEATURE_ANALYTICS_TAB'
  },
  {
    value: 'ACCOUNT_BASE',
    label: 'Account Settings',
    isAdvancedGroup: true,
    items: [
      {
        value: 'ACCOUNT_UPDATE_SETTINGS',
        label: 'Modify Account Settings'
      }
    ]
  },
  {
    value: 'INTEGRATION_BASE',
    label: 'Integration Settings',
    isAdvancedGroup: true,
    items: [
      {
        value: 'INTEGRATION_UPDATE_SETTINGS',
        label: 'Modify Integration Settings'
      }
    ]
  },
  {
    value: 'ACCESS_CONTROL_BASE',
    label: 'Access Control Settings',
    isAdvancedGroup: true,
    items: [
      {
        value: 'ACCESS_CONTROL_ADD',
        label: 'Create Access Control Profiles'
      },
      {
        value: 'ACCESS_CONTROL_UPDATE',
        label: 'Modify Access Control Profiles'
      },
      {
        value: 'ACCESS_CONTROL_DELETE',
        label: 'Delete Access Control Profiles'
      }
    ]
  },
  {
    value: 'TRANSCODING_BASE',
    label: 'Transcoding Settings',
    isAdvancedGroup: true,
    items: [
      {
        value: 'TRANSCODING_ADD',
        label: 'Create Transcoding Profiles'
      },
      {
        value: 'TRANSCODING_UPDATE',
        label: 'Modify Transcoding Profiles'
      },
      {
        value: 'TRANSCODING_DELETE',
        label: 'Delete Transcoding Profiles'
      }
    ]
  },
  {
    value: 'CUSTOM_DATA_PROFILE_BASE',
    label: 'Custom Metadata Settings',
    isAdvancedGroup: true,
    dependsOnFeature: 'METADATA_PLUGIN_PERMISSION',
    items: [
      {
        value: 'CUSTOM_DATA_PROFILE_ADD',
        label: 'Add Custom Metadata Schemas',
        dependsOnFeature: 'METADATA_PLUGIN_PERMISSION'
      },
      {
        value: 'CUSTOM_DATA_PROFILE_UPDATE',
        label: 'Modify Custom Metadata Schemas',
        dependsOnFeature: 'METADATA_PLUGIN_PERMISSION'
      },
      {
        value: 'CUSTOM_DATA_PROFILE_DELETE',
        label: 'Delete Custom Metadata Schemas',
        dependsOnFeature: 'METADATA_PLUGIN_PERMISSION'
      }
    ]
  },
  {
    value: 'ADMIN_BASE',
    label: 'Administration',
    isAdvancedGroup: false,
    items: [
      {
        value: 'ADMIN_USER_ADD',
        label: 'Create Users'
      },
      {
        value: 'ADMIN_USER_UPDATE',
        label: 'Modify Users'
      },
      {
        value: 'ADMIN_USER_DELETE',
        label: 'Delete Users'
      },
      {
        value: 'ADMIN_ROLE_ADD',
        label: 'Create Roles'
      },
      {
        value: 'ADMIN_ROLE_UPDATE',
        label: 'Modify Roles'
      },
      {
        value: 'ADMIN_ROLE_DELETE',
        label: 'Delete Roles'
      },
      {
        value: 'ADMIN_USER_BULK',
        label: 'End-User Bulk Upload',
        dependsOnFeature: 'FEATURE_END_USER_MANAGE'
      }
    ]
  },
];

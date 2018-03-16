export interface AppPermission {
  id: string;
  label: string;
  isAdvancedGroup?: boolean;
  dependsOnFeature?: string;
  items?: AppPermission[];
}

export const APP_PERMISSIONS: AppPermission[] = [
  {
    id: 'CONTENT_INGEST_BASE',
    label: 'Content Ingestion',
    isAdvancedGroup: false,
    items: [
      {
        id: 'CONTENT_INGEST_BULK_UPLOAD',
        label: 'Import Files & Bulk Upload',
      },
      {
        id: 'CONTENT_INGEST_REMOTE_STORAGE',
        label: 'Set Link to Files on Remote Storage',
        dependsOnFeature: 'FEATURE_REMOTE_STORAGE_INGEST'
      },
      {
        id: 'dropFolder.CONTENT_INGEST_DROP_FOLDER_MATCH',
        label: 'Match Media Files from Drop Folder',
        dependsOnFeature: 'CONTENT_INGEST_DROP_FOLDER_MATCH'
      },
      {
        id: 'CONTENT_INGEST_EXTERNAL_SEARCH',
        label: 'Import from Web',
      },
      {
        id: 'CONTENT_INGEST_WEBCAM',
        label: 'Record from Webcam',
      },
      {
        id: 'CONTENT_INGEST_ORPHAN_VIDEO',
        label: 'Prepare Video Entry',
      },
      {
        id: 'CONTENT_INGEST_ORPHAN_AUDIO',
        label: 'Prepare Audio Entry',
      },
      {
        id: 'LIVE_STREAM_ADD',
        label: 'Prepare Live Stream Entry',
        dependsOnFeature: 'FEATURE_LIVE_STREAM'
      },
    ]
  },
  {
    id: 'CONTENT_MANAGE_BASE',
    label: 'Content Management',
    isAdvancedGroup: true,
    items: [
      {
        id: 'CONTENT_MANAGE_METADATA',
        label: 'Modify Metadata'
      },
      {
        id: 'CONTENT_INGEST_REFERENCE_MODIFY',
        label: 'View / Modify Reference ID'
      },
      {
        id: 'CONTENT_MANAGE_ASSIGN_CATEGORIES',
        label: 'Modify Entry\'s Category'
      },
      {
        id: 'CONTENT_MANAGE_THUMBNAIL',
        label: 'Modify Thumbnail'
      },
      {
        id: 'CONTENT_MANAGE_SCHEDULE',
        label: 'Modify Scheduling'
      },
      {
        id: 'CONTENT_MANAGE_ACCESS_CONTROL',
        label: 'Modify Access Control'
      },
      {
        id: 'CONTENT_MANAGE_CUSTOM_DATA',
        label: 'Modify Custom Data',
        dependsOnFeature: 'CONTENT_MANAGE_CUSTOM_DATA'
      },
      {
        id: 'CONTENT_MANAGE_ENTRY_USERS',
        label: 'Modify Entry\'s User Settings',
        dependsOnFeature: 'FEATURE_END_USER_MANAGE'
      },
      {
        id: 'CONTENT_MANAGE_DELETE',
        label: 'Delete Content'
      },
      {
        id: 'CONTENT_MANAGE_EMBED_CODE',
        label: 'Grab Embed Code'
      },
      {
        id: 'CONTENT_INGEST_INTO_ORPHAN',
        label: 'Add Media to an Entry'
      },
      {
        id: 'CONTENT_INGEST_INTO_READY',
        label: 'Replace Entry\'s Media',
        dependsOnFeature: 'FEATURE_ENTRY_REPLACEMENT'
      },
      {
        id: 'CONTENT_INGEST_REPLACE',
        label: 'Approve Media Replacement',
        dependsOnFeature: 'FEATURE_ENTRY_REPLACEMENT_APPROVAL'
      },
      {
        id: 'CONTENT_MANAGE_RECONVERT',
        label: 'Manage Flavors'
      },
      {
        id: 'CONTENT_INGEST_CLIP_MEDIA',
        label: 'Clipping',
        dependsOnFeature: 'FEATURE_CLIP_MEDIA'
      },
      {
        id: 'CONTENT_MANAGE_EDIT_CATEGORIES',
        label: 'Edit Categories'
      },
      {
        id: 'CONTENT_MANAGE_CATEGORY_USERS',
        label: 'Edit Category\'s Entitlement Settings',
        dependsOnFeature: 'FEATURE_ENTITLEMENT'
      },
      {
        id: 'LIVE_STREAM_UPDATE',
        label: 'Update Live Stream',
        dependsOnFeature: 'FEATURE_LIVE_STREAM'
      },
      {
        id: 'CONTENT_MANAGE_DOWNLOAD',
        label: 'Download Files'
      },
      {
        id: 'cuePoint.MANAGE',
        label: 'Edit Entry Advertisement',
        dependsOnFeature: 'ADCUEPOINT_PLUGIN_PERMISSION'
      },
      {
        id: 'CAPTION_MODIFY',
        label: 'Edit Entry Captions',
        dependsOnFeature: 'CAPTION_PLUGIN_PERMISSION'
      },
      {
        id: 'ATTACHMENT_MODIFY',
        label: 'Edit Related Files',
        dependsOnFeature: 'ATTACHMENT_PLUGIN_PERMISSION'
      }
    ]
  },
  {
    id: 'BULK_LOG_BASE',
    label: 'Bulk Upload Log',
    isAdvancedGroup: true,
    items: [
      {
        id: 'BULK_LOG_DOWNLOAD',
        label: 'Download Bulk Upload Files'
      },
      {
        id: 'BULK_LOG_DELETE',
        label: 'Delete Bulk Upload Items'
      }
    ]
  },
  {
    id: 'CONTENT_MODERATE_BASE',
    label: 'Content Moderation',
    isAdvancedGroup: true,
    items: [
      {
        id: 'CONTENT_MODERATE_APPROVE_REJECT',
        label: 'Approve/Reject Content'
      },
      {
        id: 'CONTENT_MODERATE_METADATA',
        label: 'Moderate Metadata'
      },
      {
        id: 'CONTENT_MODERATE_CUSTOM_DATA',
        label: 'Moderate Custom Metadata',
        dependsOnFeature: 'METADATA_PLUGIN_PERMISSION'
      }
    ]
  },
  {
    id: 'PLAYLIST_BASE',
    label: 'Playlist Management',
    isAdvancedGroup: true,
    items: [
      {
        id: 'PLAYLIST_ADD',
        label: 'Create Playlists'
      },
      {
        id: 'PLAYLIST_UPDATE',
        label: 'Modify Playlists'
      },
      {
        id: 'PLAYLIST_DELETE',
        label: 'Delete Playlists'
      },
      {
        id: 'PLAYLIST_EMBED_CODE',
        label: 'Grab Playlist Embed Code'
      }
    ]
  },
  {
    id: 'SYNDICATION_BASE',
    label: 'Syndication Management',
    isAdvancedGroup: true,
    items: [
      {
        id: 'SYNDICATION_ADD',
        label: 'Create Syndication Feeds'
      },
      {
        id: 'SYNDICATION_UPDATE',
        label: 'Modify Syndication Feeds'
      },
      {
        id: 'SYNDICATION_DELETE',
        label: 'Delete Syndication Feeds'
      }
    ]
  },
  {
    id: 'CONTENT_MANAGE_DISTRIBUTION_BASE',
    label: 'Content Distribution',
    isAdvancedGroup: true,
    dependsOnFeature: 'CONTENTDISTRIBUTION_PLUGIN_PERMISSION',
    items: [
      {
        id: 'CONTENT_MANAGE_DISTRIBUTION_WHERE',
        label: 'Select Distribution Points',
        dependsOnFeature: 'CONTENT_MANAGE_DISTRIBUTION_WHERE'
      },
      {
        id: 'CONTENT_MANAGE_DISTRIBUTION_SEND',
        label: 'Distribute',
        dependsOnFeature: 'CONTENTDISTRIBUTION_PLUGIN_PERMISSION'
      },
      {
        id: 'CONTENT_MANAGE_DISTRIBUTION_REMOVE',
        label: 'Remove Distributed Content',
        dependsOnFeature: 'CONTENTDISTRIBUTION_PLUGIN_PERMISSION'
      }
    ]
  },
  {
    id: 'dropFolder.CONTENT_INGEST_DROP_FOLDER_BASE',
    label: 'Drop Folders Control',
    isAdvancedGroup: true,
    dependsOnFeature: 'DROPFOLDER_PLUGIN_PERMISSION',
    items: [
      {
        id: 'dropFolder.CONTENT_INGEST_DROP_FOLDER_DELETE',
        label: 'Delete Files',
        dependsOnFeature: 'DROPFOLDER_PLUGIN_PERMISSION'
      }
    ]
  },
  {
    id: 'STUDIO_BASE',
    label: 'Studio',
    isAdvancedGroup: true,
    items: [
      {
        id: 'STUDIO_ADD_UICONF',
        label: 'Create Players'
      },
      {
        id: 'STUDIO_UPDATE_UICONF',
        label: 'Modify Players'
      },
      {
        id: 'STUDIO_DELETE_UICONF',
        label: 'Delete Players'
      },
      {
        id: 'STUDIO_SELECT_CONTENT',
        label: 'Select Player Content'
      }
    ]
  },
  {
    id: 'ADVERTISING_UPDATE_SETTINGS',
    label: 'Set Advertising Settings',
    dependsOnFeature: 'FEATURE_VAST'
  },
  {
    id: 'ANALYTICS_BASE',
    label: 'Video Analytics',
    dependsOnFeature: 'FEATURE_ANALYTICS_TAB'
  },
  {
    id: 'ACCOUNT_BASE',
    label: 'Account Settings',
    isAdvancedGroup: true,
    items: [
      {
        id: 'ACCOUNT_UPDATE_SETTINGS',
        label: 'Modify Account Settings'
      }
    ]
  },
  {
    id: 'INTEGRATION_BASE',
    label: 'Integration Settings',
    isAdvancedGroup: true,
    items: [
      {
        id: 'INTEGRATION_UPDATE_SETTINGS',
        label: 'Modify Integration Settings'
      }
    ]
  },
  {
    id: 'ACCESS_CONTROL_BASE',
    label: 'Access Control Settings',
    isAdvancedGroup: true,
    items: [
      {
        id: 'ACCESS_CONTROL_ADD',
        label: 'Create Access Control Profiles'
      },
      {
        id: 'ACCESS_CONTROL_UPDATE',
        label: 'Modify Access Control Profiles'
      },
      {
        id: 'ACCESS_CONTROL_DELETE',
        label: 'Delete Access Control Profiles'
      }
    ]
  },
  {
    id: 'TRANSCODING_BASE',
    label: 'Transcoding Settings',
    isAdvancedGroup: true,
    items: [
      {
        id: 'TRANSCODING_ADD',
        label: 'Create Transcoding Profiles'
      },
      {
        id: 'TRANSCODING_UPDATE',
        label: 'Modify Transcoding Profiles'
      },
      {
        id: 'TRANSCODING_DELETE',
        label: 'Delete Transcoding Profiles'
      }
    ]
  },
  {
    id: 'CUSTOM_DATA_PROFILE_BASE',
    label: 'Custom Metadata Settings',
    isAdvancedGroup: true,
    dependsOnFeature: 'METADATA_PLUGIN_PERMISSION',
    items: [
      {
        id: 'CUSTOM_DATA_PROFILE_ADD',
        label: 'Add Custom Metadata Schemas',
        dependsOnFeature: 'METADATA_PLUGIN_PERMISSION'
      },
      {
        id: 'CUSTOM_DATA_PROFILE_UPDATE',
        label: 'Modify Custom Metadata Schemas',
        dependsOnFeature: 'METADATA_PLUGIN_PERMISSION'
      },
      {
        id: 'CUSTOM_DATA_PROFILE_DELETE',
        label: 'Delete Custom Metadata Schemas',
        dependsOnFeature: 'METADATA_PLUGIN_PERMISSION'
      }
    ]
  },
  {
    id: 'ADMIN_BASE',
    label: 'Administration',
    isAdvancedGroup: false,
    items: [
      {
        id: 'ADMIN_USER_ADD',
        label: 'Create Users'
      },
      {
        id: 'ADMIN_USER_UPDATE',
        label: 'Modify Users'
      },
      {
        id: 'ADMIN_USER_DELETE',
        label: 'Delete Users'
      },
      {
        id: 'ADMIN_ROLE_ADD',
        label: 'Create Roles'
      },
      {
        id: 'ADMIN_ROLE_UPDATE',
        label: 'Modify Roles'
      },
      {
        id: 'ADMIN_ROLE_DELETE',
        label: 'Delete Roles'
      },
      {
        id: 'ADMIN_USER_BULK',
        label: 'End-User Bulk Upload',
        dependsOnFeature: 'FEATURE_END_USER_MANAGE'
      }
    ]
  },
];

import { KMCPermissions } from 'app-shared/kmc-shared/kmc-permissions/kmc-permissions';

export interface RolePermission {
  name: string;
  value: KMCPermissions;
  label: string;
  isAdvancedGroup?: boolean;
  items?: RolePermission[];
  disabled?: boolean;
  noChildren?: boolean;
}

export const ROLE_PERMISSIONS: RolePermission[] = [
  {
    value: KMCPermissions.CONTENT_INGEST_BASE,
    name: 'CONTENT_INGEST_BASE',
    label: 'Content Ingestion',
    isAdvancedGroup: false,
    items: [
        {
            value: KMCPermissions.CONTENT_INGEST_UPLOAD,
            name: 'CONTENT_INGEST_UPLOAD',
            label: 'Upload from Desktop'
        },
      {
        value: KMCPermissions.CONTENT_INGEST_BULK_UPLOAD,
        name: 'CONTENT_INGEST_BULK_UPLOAD',
        label: 'Import Files & Bulk Upload'
      },
      {
        value: KMCPermissions.CONTENT_INGEST_REMOTE_STORAGE,
        name: 'CONTENT_INGEST_REMOTE_STORAGE',
        label: 'Set Link to Files on Remote Storage'
      },
      {
        value: KMCPermissions.DROPFOLDER_CONTENT_INGEST_DROP_FOLDER_MATCH,
        name: 'dropFolder.CONTENT_INGEST_DROP_FOLDER_MATCH',
        label: 'Match Media Files from Drop Folder'
      },
      {
        value: KMCPermissions.CONTENT_INGEST_EXTERNAL_SEARCH,
        name: 'CONTENT_INGEST_EXTERNAL_SEARCH',
        label: 'Import from Web',
      },
      {
        value: KMCPermissions.CONTENT_INGEST_WEBCAM,
        name: 'CONTENT_INGEST_WEBCAM',
        label: 'Record from Webcam',
      },
      {
        value: KMCPermissions.CONTENT_INGEST_ORPHAN_VIDEO,
        name: 'CONTENT_INGEST_ORPHAN_VIDEO',
        label: 'Prepare Video Entry',
      },
      {
        value: KMCPermissions.CONTENT_INGEST_ORPHAN_AUDIO,
        name: 'CONTENT_INGEST_ORPHAN_AUDIO',
        label: 'Prepare Audio Entry',
      },
      {
        value: KMCPermissions.LIVE_STREAM_ADD,
        name: 'LIVE_STREAM_ADD',
        label: 'Prepare Live Stream Entry'
      },
    ]
  },
  {
    value: KMCPermissions.CONTENT_MANAGE_BASE,
    name: 'CONTENT_MANAGE_BASE',
    label: 'Content Management',
    isAdvancedGroup: true,
    items: [
      {
        value: KMCPermissions.CONTENT_MANAGE_METADATA,
        name: 'CONTENT_MANAGE_METADATA',
        label: 'Modify Metadata'
      },
      {
        value: KMCPermissions.CONTENT_INGEST_REFERENCE_MODIFY,
        name: 'CONTENT_INGEST_REFERENCE_MODIFY',
        label: 'View / Modify Reference name'
      },
      {
        value: KMCPermissions.CONTENT_MANAGE_ASSIGN_CATEGORIES,
        name: 'CONTENT_MANAGE_ASSIGN_CATEGORIES',
        label: 'Modify Entry\'s Category'
      },
      {
        value: KMCPermissions.CONTENT_MANAGE_THUMBNAIL,
        name: 'CONTENT_MANAGE_THUMBNAIL',
        label: 'Modify Thumbnail'
      },
      {
        value: KMCPermissions.CONTENT_MANAGE_SCHEDULE,
        name: 'CONTENT_MANAGE_SCHEDULE',
        label: 'Modify Scheduling'
      },
      {
        value: KMCPermissions.CONTENT_MANAGE_ACCESS_CONTROL,
        name: 'CONTENT_MANAGE_ACCESS_CONTROL',
        label: 'Modify Access Control'
      },
      {
        value: KMCPermissions.CONTENT_MANAGE_CUSTOM_DATA,
        name: 'CONTENT_MANAGE_CUSTOM_DATA',
        label: 'Modify Custom Data'
      },
      {
        value: KMCPermissions.CONTENT_MANAGE_ENTRY_USERS,
        name: 'CONTENT_MANAGE_ENTRY_USERS',
        label: 'Modify Entry\'s User Settings'
      },
      {
        value: KMCPermissions.CONTENT_MANAGE_DELETE,
        name: 'CONTENT_MANAGE_DELETE',
        label: 'Delete Content'
      },
      {
        value: KMCPermissions.CONTENT_MANAGE_EMBED_CODE,
        name: 'CONTENT_MANAGE_EMBED_CODE',
        label: 'Grab Embed Code'
      },
      {
        value: KMCPermissions.CONTENT_INGEST_INTO_ORPHAN,
        name: 'CONTENT_INGEST_INTO_ORPHAN',
        label: 'Add Media to an Entry'
      },
      {
        value: KMCPermissions.CONTENT_INGEST_INTO_READY,
        name: 'CONTENT_INGEST_INTO_READY',
        label: 'Replace Entry\'s Media'
      },
      {
        value: KMCPermissions.CONTENT_INGEST_REPLACE,
        name: 'CONTENT_INGEST_REPLACE',
        label: 'Approve Media Replacement'
      },
      {
        value: KMCPermissions.CONTENT_MANAGE_RECONVERT,
        name: 'CONTENT_MANAGE_RECONVERT',
        label: 'Manage Flavors'
      },
      {
        value: KMCPermissions.CONTENT_INGEST_CLIP_MEDIA,
        name: 'CONTENT_INGEST_CLIP_MEDIA',
        label: 'Clipping'
      },
      {
        value: KMCPermissions.CONTENT_MANAGE_EDIT_CATEGORIES,
        name: 'CONTENT_MANAGE_EDIT_CATEGORIES',
        label: 'Edit Categories'
      },
      {
        value: KMCPermissions.CONTENT_MANAGE_CATEGORY_USERS,
        name: 'CONTENT_MANAGE_CATEGORY_USERS',
        label: 'Edit Category\'s Entitlement Settings'
      },
      {
        value: KMCPermissions.LIVE_STREAM_UPDATE,
        name: 'LIVE_STREAM_UPDATE',
        label: 'Update Live Stream'
      },
      {
        value: KMCPermissions.CONTENT_MANAGE_DOWNLOAD,
        name: 'CONTENT_MANAGE_DOWNLOAD',
        label: 'Download Files'
      },
      {
        value: KMCPermissions.CUEPOINT_MANAGE,
        name: 'cuePoint.MANAGE',
        label: 'Edit Entry Advertisement'
      },
      {
        value: KMCPermissions.CAPTION_MODIFY,
        name: 'CAPTION_MODIFY',
        label: 'Edit Entry Captions'
      },
      {
        value: KMCPermissions.ATTACHMENT_MODIFY,
        name: 'ATTACHMENT_MODIFY',
        label: 'Edit Related Files'
      }
    ]
  },
  {
    value: KMCPermissions.BULK_LOG_BASE,
    name: 'BULK_LOG_BASE',
    label: 'Bulk Upload Log',
    isAdvancedGroup: true,
    items: [
      {
        value: KMCPermissions.BULK_LOG_DOWNLOAD,
        name: 'BULK_LOG_DOWNLOAD',
        label: 'Download Bulk Upload Files'
      },
      {
        value: KMCPermissions.BULK_LOG_DELETE,
        name: 'BULK_LOG_DELETE',
        label: 'Delete Bulk Upload Items'
      }
    ]
  },
  {
    value: KMCPermissions.CONTENT_MODERATE_BASE,
    name: 'CONTENT_MODERATE_BASE',
    label: 'Content Moderation',
    isAdvancedGroup: true,
    items: [
      {
        value: KMCPermissions.CONTENT_MODERATE_APPROVE_REJECT,
        name: 'CONTENT_MODERATE_APPROVE_REJECT',
        label: 'Approve/Reject Content'
      },
      {
        value: KMCPermissions.CONTENT_MODERATE_METADATA,
        name: 'CONTENT_MODERATE_METADATA',
        label: 'Moderate Metadata'
      },
      {
        value: KMCPermissions.CONTENT_MODERATE_CUSTOM_DATA,
        name: 'CONTENT_MODERATE_CUSTOM_DATA',
        label: 'Moderate Custom Metadata'
      }
    ]
  },
  {
    value: KMCPermissions.PLAYLIST_BASE,
    name: 'PLAYLIST_BASE',
    label: 'Playlist Management',
    isAdvancedGroup: true,
    items: [
      {
        value: KMCPermissions.PLAYLIST_ADD,
        name: 'PLAYLIST_ADD',
        label: 'Create Playlists'
      },
      {
        value: KMCPermissions.PLAYLIST_UPDATE,
        name: 'PLAYLIST_UPDATE',
        label: 'Modify Playlists'
      },
      {
        value: KMCPermissions.PLAYLIST_DELETE,
        name: 'PLAYLIST_DELETE',
        label: 'Delete Playlists'
      },
      {
        value: KMCPermissions.PLAYLIST_EMBED_CODE,
        name: 'PLAYLIST_EMBED_CODE',
        label: 'Grab Playlist Embed Code'
      }
    ]
  },
  {
    value: KMCPermissions.SYNDICATION_BASE,
    name: 'SYNDICATION_BASE',
    label: 'Syndication Management',
    isAdvancedGroup: true,
    items: [
      {
        value: KMCPermissions.SYNDICATION_ADD,
        name: 'SYNDICATION_ADD',
        label: 'Create Syndication Feeds'
      },
      {
        value: KMCPermissions.SYNDICATION_UPDATE,
        name: 'SYNDICATION_UPDATE',
        label: 'Modify Syndication Feeds'
      },
      {
        value: KMCPermissions.SYNDICATION_DELETE,
        name: 'SYNDICATION_DELETE',
        label: 'Delete Syndication Feeds'
      }
    ]
  },
  {
    value: KMCPermissions.CONTENT_MANAGE_DISTRIBUTION_BASE,
    name: 'CONTENT_MANAGE_DISTRIBUTION_BASE',
    label: 'Content Distribution',
    isAdvancedGroup: true,
    items: [
      {
        value: KMCPermissions.CONTENT_MANAGE_DISTRIBUTION_WHERE,
        name: 'CONTENT_MANAGE_DISTRIBUTION_WHERE',
        label: 'Select Distribution Points'
      },
      {
        value: KMCPermissions.CONTENT_MANAGE_DISTRIBUTION_SEND,
        name: 'CONTENT_MANAGE_DISTRIBUTION_SEND',
        label: 'Distribute'
      },
      {
        value: KMCPermissions.CONTENT_MANAGE_DISTRIBUTION_REMOVE,
        name: 'CONTENT_MANAGE_DISTRIBUTION_REMOVE',
        label: 'Remove Distributed Content'
      }
    ]
  },
  {
    value: KMCPermissions.DROPFOLDER_CONTENT_INGEST_DROP_FOLDER_BASE,
    name: 'dropFolder.CONTENT_INGEST_DROP_FOLDER_BASE',
    label: 'Drop Folders Control',
    isAdvancedGroup: true,
    items: [
      {
        value: KMCPermissions.DROPFOLDER_CONTENT_INGEST_DROP_FOLDER_DELETE,
        name: 'dropFolder.CONTENT_INGEST_DROP_FOLDER_DELETE',
        label: 'Delete Files'
      }
    ]
  },
  {
    value: KMCPermissions.STUDIO_BASE,
    name: 'STUDIO_BASE',
    label: 'Studio',
    isAdvancedGroup: true,
    items: [
      {
        value: KMCPermissions.STUDIO_ADD_UICONF,
        name: 'STUDIO_ADD_UICONF',
        label: 'Create Players'
      },
      {
        value: KMCPermissions.STUDIO_UPDATE_UICONF,
        name: 'STUDIO_UPDATE_UICONF',
        label: 'Modify Players'
      },
      {
        value: KMCPermissions.STUDIO_DELETE_UICONF,
        name: 'STUDIO_DELETE_UICONF',
        label: 'Delete Players'
      },
      {
        value: KMCPermissions.STUDIO_SELECT_CONTENT,
        name: 'STUDIO_SELECT_CONTENT',
        label: 'Select Player Content'
      }
    ]
  },
  {
    value: KMCPermissions.ADVERTISING_UPDATE_SETTINGS,
    name: 'ADVERTISING_UPDATE_SETTINGS',
    label: 'Set Advertising Settings',
    noChildren: true
  },
  {
    value: KMCPermissions.ANALYTICS_BASE,
    name: 'ANALYTICS_BASE',
    label: 'Video Analytics',
    noChildren: true
  },
  {
    value: KMCPermissions.ACCOUNT_BASE,
    name: 'ACCOUNT_BASE',
    label: 'Account Settings',
    isAdvancedGroup: true,
    items: [
      {
        value: KMCPermissions.ACCOUNT_UPDATE_SETTINGS,
        name: 'ACCOUNT_UPDATE_SETTINGS',
        label: 'Modify Account Settings'
      }
    ]
  },
  {
    value: KMCPermissions.INTEGRATION_BASE,
    name: 'INTEGRATION_BASE',
    label: 'Integration Settings',
    isAdvancedGroup: true,
    items: [
      {
        value: KMCPermissions.INTEGRATION_UPDATE_SETTINGS,
        name: 'INTEGRATION_UPDATE_SETTINGS',
        label: 'Modify Integration Settings'
      }
    ]
  },
  {
    value: KMCPermissions.ACCESS_CONTROL_BASE,
    name: 'ACCESS_CONTROL_BASE',
    label: 'Access Control Settings',
    isAdvancedGroup: true,
    items: [
      {
        value: KMCPermissions.ACCESS_CONTROL_ADD,
        name: 'ACCESS_CONTROL_ADD',
        label: 'Create Access Control Profiles'
      },
      {
        value: KMCPermissions.ACCESS_CONTROL_UPDATE,
        name: 'ACCESS_CONTROL_UPDATE',
        label: 'Modify Access Control Profiles'
      },
      {
        value: KMCPermissions.ACCESS_CONTROL_DELETE,
        name: 'ACCESS_CONTROL_DELETE',
        label: 'Delete Access Control Profiles'
      }
    ]
  },
  {
    value: KMCPermissions.TRANSCODING_BASE,
    name: 'TRANSCODING_BASE',
    label: 'Transcoding Settings',
    isAdvancedGroup: true,
    items: [
      {
        value: KMCPermissions.TRANSCODING_ADD,
        name: 'TRANSCODING_ADD',
        label: 'Create Transcoding Profiles'
      },
      {
        value: KMCPermissions.TRANSCODING_UPDATE,
        name: 'TRANSCODING_UPDATE',
        label: 'Modify Transcoding Profiles'
      },
      {
        value: KMCPermissions.TRANSCODING_DELETE,
        name: 'TRANSCODING_DELETE',
        label: 'Delete Transcoding Profiles'
      }
    ]
  },
  {
    value: KMCPermissions.CUSTOM_DATA_PROFILE_BASE,
    name: 'CUSTOM_DATA_PROFILE_BASE',
    label: 'Custom Metadata Settings',
    isAdvancedGroup: true,
    items: [
      {
        value: KMCPermissions.CUSTOM_DATA_PROFILE_ADD,
        name: 'CUSTOM_DATA_PROFILE_ADD',
        label: 'Add Custom Metadata Schemas'
      },
      {
        value: KMCPermissions.CUSTOM_DATA_PROFILE_UPDATE,
        name: 'CUSTOM_DATA_PROFILE_UPDATE',
        label: 'Modify Custom Metadata Schemas'
      },
      {
        value: KMCPermissions.CUSTOM_DATA_PROFILE_DELETE,
        name: 'CUSTOM_DATA_PROFILE_DELETE',
        label: 'Delete Custom Metadata Schemas'
      }
    ]
  },
  {
    value: KMCPermissions.ADMIN_BASE,
    name: 'ADMIN_BASE',
    label: 'Administration',
    isAdvancedGroup: true,
    items: [
      {
        value: KMCPermissions.ADMIN_USER_ADD,
        name: 'ADMIN_USER_ADD',
        label: 'Create Users'
      },
      {
        value: KMCPermissions.ADMIN_USER_UPDATE,
        name: 'ADMIN_USER_UPDATE',
        label: 'Modify Users'
      },
      {
        value: KMCPermissions.ADMIN_USER_DELETE,
        name: 'ADMIN_USER_DELETE',
        label: 'Delete Users'
      },
      {
        value: KMCPermissions.ADMIN_ROLE_ADD,
        name: 'ADMIN_ROLE_ADD',
        label: 'Create Roles'
      },
      {
        value: KMCPermissions.ADMIN_ROLE_UPDATE,
        name: 'ADMIN_ROLE_UPDATE',
        label: 'Modify Roles'
      },
      {
        value: KMCPermissions.ADMIN_ROLE_DELETE,
        name: 'ADMIN_ROLE_DELETE',
        label: 'Delete Roles'
      },
      {
        value: KMCPermissions.ADMIN_USER_BULK,
        name: 'ADMIN_USER_BULK',
        label: 'End-User Bulk Upload'
      }
    ]
  },
];


export interface KmcAppConfig {
  storageNamespace: string;
  kalturaServer: {
      expiry: number;
      privileges: string;
  },
  locales: {
    id: string;
    label: string;
  }[];
}


export const kmcAppConfig: KmcAppConfig = {
  'storageNamespace': 'kmc-ng',
  'kalturaServer': {
      "expiry": 86400,
      "privileges": "disableentitlement"
  },
  'locales': [
    {
      'id': 'en',
      'label': 'English'
    },
    {
      'id': 'de',
      'label': 'Deutsch'
    },
    {
      'id': 'es',
      'label': 'Español'
    },
    {
      'id': 'fr',
      'label': 'Français'
    },
    {
      'id': 'ja',
      'label': '日本語'
    }
  ]
};

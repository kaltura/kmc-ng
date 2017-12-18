export const DefaultFiltersList: {
  name: string;
  label: string;
  items: { id: string, name: string }[]
}[] = [
  {
    name: 'uploadedItem',
    label: 'Uploaded items',
    items: [
      { id: '1', name: 'Entries' },
      { id: '2', name: 'Categories' },
      { id: '3', name: 'End Users' },
      { id: '4', name: 'End-User Entitlements' }

    ]
  },
  {
    name: 'status',
    label: 'Statuses',
    items: [
      { id: '5', name: 'Finished successfully' },
      { id: '12', name: 'Finished with errors' },
      { id: '6,10', name: 'Failed' },
      { id: '0,1,2,3,4,7,8,9,11', name: 'All other statuses' }
    ]
  }
];

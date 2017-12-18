export const DefaultFiltersList: {
  name: string;
  label: string;
  items: { value: string, label: string }[]
}[] = [
  {
    name: 'uploadedItem',
    label: 'Uploaded items',
    items: [
      { value: '1', label: 'Entries' },
      { value: '2', label: 'Categories' },
      { value: '3', label: 'End Users' },
      { value: '4', label: 'End-User Entitlements' }
    ]
  },
  {
    name: 'status',
    label: 'Statuses',
    items: [
      { value: '5', label: 'Finished successfully' },
      { value: '12', label: 'Finished with errors' },
      { value: '6,10', label: 'Failed' },
      { value: '0,1,2,3,4,7,8,9,11', label: 'All other statuses' }
    ]
  }
];

export const DefaultFiltersList: {
  name: string;
  label: string;
  items: { value: string, label: string }[]
}[] = [
  {
    name: 'uploadedItem',
    label: 'uploadedItems',
    items: [
      { value: '1', label: 'entries' },
      { value: '2', label: 'categories' },
      { value: '3', label: 'endUsers' },
      { value: '4', label: 'endUserEntitlements' }
    ]
  },
  {
    name: 'status',
    label: 'statuses',
    items: [
      { value: '5', label: 'successFinish' },
      { value: '12', label: 'errorFinish' },
      { value: '6,10', label: 'failed' },
      { value: '0,1,2,3,4,7,8,9,11', label: 'otherStatuses' }
    ]
  }
];

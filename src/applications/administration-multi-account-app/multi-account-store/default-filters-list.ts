export const DefaultFiltersList: {
  name: string;
  label: string; // localization token, don't forget to localize it!
  items: { value: string, label: string }[]
}[] = [
  {
    name: 'status',
    label: 'allStatuses',
    items: [
      { value: '1', label: 'active' },
      { value: '2', label: 'blocked' },
      { value: '3', label: 'removed' }
    ]
  }
];

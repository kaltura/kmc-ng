export const DefaultFiltersList: {
  name: string;
  label: string;
  items: { value: string, label: string }[]
}[] = [
  {
    name: 'status',
    label: 'All statuses',
    items: [
      { value: '14', label: 'Parsed from XML' },
      { value: '1,15', label: 'Uploading' },
      { value: '2', label: 'Pending' },
      { value: '3', label: 'Waiting for related files' },
      { value: '8', label: 'Waiting for matched entry' },
      { value: '13', label: 'Processing' },
      { value: '11', label: 'Downloading' },
      { value: '4', label: 'Done' },
      { value: '9', label: 'Error' },
      { value: '12', label: 'Download failed' },
      { value: '10', label: 'Delete failed' }
    ]
  }
];

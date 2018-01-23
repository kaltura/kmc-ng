export const DefaultFiltersList: {
  name: string;
  label: string; // localization token, don't forget to localize it!
  items: { value: string, label: string }[]
}[] = [
  {
    name: 'status',
    label: 'allStatuses',
    items: [
      { value: '14', label: 'parsedFromXml' },
      { value: '1,15', label: 'uploading' },
      { value: '2', label: 'pending' },
      { value: '3', label: 'waitingForRelatedFiles' },
      { value: '8', label: 'waitingForMatchedEntry' },
      { value: '13', label: 'processing' },
      { value: '11', label: 'downloading' },
      { value: '4', label: 'done' },
      { value: '9', label: 'error' },
      { value: '12', label: 'downloadFailed' },
      { value: '10', label: 'deleteFailed' }
    ]
  }
];

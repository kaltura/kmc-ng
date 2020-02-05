import { KalturaVendorServiceTurnAroundTime, KalturaVendorServiceType } from 'kaltura-ngx-client';

export const DefaultFiltersList: {
  name: string;
  label: string;
  items: { value: number | string, label: string }[]
}[] = [
  {
    name: 'service',
    label: 'service',
    items: [
      { value: KalturaVendorServiceType.human, label: 'human' },
      { value: KalturaVendorServiceType.machine, label: 'machine' }
    ]
  },
  {
    name: 'tat',
    label: 'tat',
    items: [
      { value: `${KalturaVendorServiceTurnAroundTime.bestEffort}`, label: 'turnAroundTime.bestEffort' },
      { value: `${KalturaVendorServiceTurnAroundTime.eightHours}`, label: 'turnAroundTime.eightHours' },
      { value: `${KalturaVendorServiceTurnAroundTime.fiveDays}`, label: 'turnAroundTime.fiveDays' },
      { value: `${KalturaVendorServiceTurnAroundTime.fortyEightHours}`, label: 'turnAroundTime.fortyEightHours' },
      { value: `${KalturaVendorServiceTurnAroundTime.fourDays}`, label: 'turnAroundTime.fourDays' },
      { value: `${KalturaVendorServiceTurnAroundTime.immediate}`, label: 'turnAroundTime.immediate' },
      { value: `${KalturaVendorServiceTurnAroundTime.sixHours}`, label: 'turnAroundTime.sixHours' },
      { value: `${KalturaVendorServiceTurnAroundTime.tenDays}`, label: 'turnAroundTime.tenDays' },
      { value: `${KalturaVendorServiceTurnAroundTime.thirtyMinutes}`, label: 'turnAroundTime.thirtyMinutes' },
      { value: `${KalturaVendorServiceTurnAroundTime.threeHours}`, label: 'turnAroundTime.threeHours' },
      { value: `${KalturaVendorServiceTurnAroundTime.twelveHours}`, label: 'turnAroundTime.twelveHours' },
      { value: `${KalturaVendorServiceTurnAroundTime.twentyFourHours}`, label: 'turnAroundTime.twentyFourHours' },
      { value: `${KalturaVendorServiceTurnAroundTime.twoHours}`, label: 'turnAroundTime.twoHours' }
    ]
  }
];

export interface ManualLive {
  name: string
  description: string,
  hlsStreamUrl: string,
  backupHlsStreamUrl: string,
  dashStreamUrl: string,
  backupDashStreamUrl: string,
  useAkamaiHdProtocol: boolean,
  previewMode: boolean
}

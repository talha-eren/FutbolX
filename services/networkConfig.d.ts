declare module '@/services/networkConfig' {
  interface NetworkConfig {
    MANUAL_BACKEND_IP: string;
    BACKEND_PORT?: number;
    getImageUrl: (path: string | undefined) => string;
    getVideoUrl: (item: any) => string;
  }
  
  export function getApiUrl(endpoint?: string): Promise<string>;
  export function testBackendConnection(): Promise<boolean>;
  
  const networkConfig: NetworkConfig;
  export default networkConfig;
} 
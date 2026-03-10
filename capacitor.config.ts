import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.promptmarketplace.app',
  appName: 'Prompt4life',
  webDir: 'out',
  server: {
    url: 'https://prompt-marketplace-d4txkenhh-merleesys-projects.vercel.app',
    cleartext: true
  }
};

export default config;

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.promptmarketplace.app',
  appName: 'Prompt4life',
  webDir: 'out',
  server: {
    url: 'https://prompt-marketplace-kohl.vercel.app',
    cleartext: true,
    allowNavigation: [
      "*.vercel.app",
      "*.supabase.co"
    ]
  }
};

export default config;

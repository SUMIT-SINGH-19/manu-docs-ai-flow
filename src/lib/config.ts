// Configuration service for API credentials and settings
export interface AppConfig {
  // Supabase
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  
  // AI Services
  ai: {
    provider: 'openai' | 'anthropic' | 'gemini' | 'custom' | 'mock';
    openai?: {
      apiKey: string;
      model: string;
    };
    anthropic?: {
      apiKey: string;
      model: string;
    };
    gemini?: {
      apiKey: string;
      model: string;
    };
    custom?: {
      endpoint: string;
      apiKey?: string;
    };
  };
  
  // WhatsApp Services
  whatsapp: {
    provider: 'twilio' | 'gupshup' | '360dialog' | 'direct' | 'mock';
    twilio?: {
      accountSid: string;
      authToken: string;
      whatsappNumber: string;
    };
    gupshup?: {
      apiKey: string;
      appName: string;
    };
    dialog360?: {
      apiKey: string;
      channelId: string;
    };
    direct?: {
      targetNumber: string;
    };
  };
  
  // PDF Generation
  pdf: {
    provider: 'client' | 'service';
    service?: {
      endpoint: string;
      apiKey: string;
    };
  };
  
  // App Settings
  app: {
    environment: 'development' | 'staging' | 'production';
    maxUploadsPerHour: number;
    maxFileSizeMB: number;
    maxFilesPerSession: number;
    sessionTimeoutHours: number;
    fileRetentionHours: number;
  };
  
  // Feature Flags
  features: {
    aiProcessing: boolean;
    whatsappDelivery: boolean;
    pdfGeneration: boolean;
    fileCleanup: boolean;
  };
}

class ConfigService {
  private config: AppConfig;

  constructor() {
    this.config = this.loadConfig();
    this.validateConfig();
  }

  private loadConfig(): AppConfig {
    return {
      supabase: {
        url: import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321',
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key',
        serviceRoleKey: import.meta.env.SUPABASE_SERVICE_ROLE_KEY
      },
      
      ai: {
        provider: (import.meta.env.VITE_AI_PROVIDER as any) || 'mock',
        openai: {
          apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
          model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4'
        },
        anthropic: {
          apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
          model: import.meta.env.VITE_ANTHROPIC_MODEL || 'claude-3-sonnet-20240229'
        },
        gemini: {
          apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
          model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash'
        },
        custom: {
          endpoint: import.meta.env.VITE_CUSTOM_AI_ENDPOINT || '',
          apiKey: import.meta.env.VITE_CUSTOM_AI_API_KEY
        }
      },
      
      whatsapp: {
        provider: (import.meta.env.VITE_WHATSAPP_PROVIDER as any) || 'mock',
        twilio: {
          accountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID || '',
          authToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN || '',
          whatsappNumber: import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'
        },
        gupshup: {
          apiKey: import.meta.env.VITE_GUPSHUP_API_KEY || '',
          appName: import.meta.env.VITE_GUPSHUP_APP_NAME || ''
        },
        dialog360: {
          apiKey: import.meta.env.VITE_360DIALOG_API_KEY || '',
          channelId: import.meta.env.VITE_360DIALOG_CHANNEL_ID || ''
        },
        direct: {
          targetNumber: import.meta.env.VITE_WHATSAPP_TARGET_NUMBER || ''
        }
      },
      
      pdf: {
        provider: (import.meta.env.VITE_PDF_PROVIDER as any) || 'client',
        service: {
          endpoint: import.meta.env.VITE_PDF_SERVICE_ENDPOINT || '',
          apiKey: import.meta.env.VITE_PDF_SERVICE_API_KEY || ''
        }
      },
      
      app: {
        environment: (import.meta.env.VITE_APP_ENV as any) || 'development',
        maxUploadsPerHour: parseInt(import.meta.env.VITE_MAX_UPLOADS_PER_HOUR) || 20,
        maxFileSizeMB: parseInt(import.meta.env.VITE_MAX_FILE_SIZE_MB) || 10,
        maxFilesPerSession: parseInt(import.meta.env.VITE_MAX_FILES_PER_SESSION) || 5,
        sessionTimeoutHours: parseInt(import.meta.env.VITE_SESSION_TIMEOUT_HOURS) || 24,
        fileRetentionHours: parseInt(import.meta.env.VITE_FILE_RETENTION_HOURS) || 24
      },
      
      features: {
        aiProcessing: import.meta.env.VITE_ENABLE_AI_PROCESSING !== 'false',
        whatsappDelivery: import.meta.env.VITE_ENABLE_WHATSAPP_DELIVERY !== 'false',
        pdfGeneration: import.meta.env.VITE_ENABLE_PDF_GENERATION !== 'false',
        fileCleanup: import.meta.env.VITE_ENABLE_FILE_CLEANUP !== 'false'
      }
    };
  }

  private validateConfig(): void {
    const errors: string[] = [];

    // Validate Supabase
    if (!this.config.supabase.url || this.config.supabase.url === 'http://localhost:54321') {
      if (this.config.app.environment === 'production') {
        errors.push('VITE_SUPABASE_URL is required for production');
      }
    }

    if (!this.config.supabase.anonKey || this.config.supabase.anonKey === 'your-anon-key') {
      if (this.config.app.environment === 'production') {
        errors.push('VITE_SUPABASE_ANON_KEY is required for production');
      }
    }

    // Validate AI provider
    if (this.config.features.aiProcessing && this.config.ai.provider !== 'mock') {
      switch (this.config.ai.provider) {
        case 'openai':
          if (!this.config.ai.openai?.apiKey) {
            errors.push('VITE_OPENAI_API_KEY is required when using OpenAI');
          }
          break;
        case 'anthropic':
          if (!this.config.ai.anthropic?.apiKey) {
            errors.push('VITE_ANTHROPIC_API_KEY is required when using Anthropic');
          }
          break;
        case 'gemini':
          if (!this.config.ai.gemini?.apiKey) {
            errors.push('VITE_GEMINI_API_KEY is required when using Gemini');
          }
          break;
        case 'custom':
          if (!this.config.ai.custom?.endpoint) {
            errors.push('VITE_CUSTOM_AI_ENDPOINT is required when using custom AI');
          }
          break;
      }
    }

    // Validate WhatsApp provider
    if (this.config.features.whatsappDelivery && this.config.whatsapp.provider !== 'mock') {
      switch (this.config.whatsapp.provider) {
        case 'twilio':
          if (!this.config.whatsapp.twilio?.accountSid || !this.config.whatsapp.twilio?.authToken) {
            errors.push('VITE_TWILIO_ACCOUNT_SID and VITE_TWILIO_AUTH_TOKEN are required when using Twilio');
          }
          break;
        case 'gupshup':
          if (!this.config.whatsapp.gupshup?.apiKey) {
            errors.push('VITE_GUPSHUP_API_KEY is required when using Gupshup');
          }
          break;
        case '360dialog':
          if (!this.config.whatsapp.dialog360?.apiKey) {
            errors.push('VITE_360DIALOG_API_KEY is required when using 360Dialog');
          }
          break;
      }
    }

    if (errors.length > 0) {
      console.warn('Configuration warnings:', errors);
      if (this.config.app.environment === 'production') {
        throw new Error(`Configuration errors: ${errors.join(', ')}`);
      }
    }
  }

  // Getters for easy access
  get supabase() { return this.config.supabase; }
  get ai() { return this.config.ai; }
  get whatsapp() { return this.config.whatsapp; }
  get pdf() { return this.config.pdf; }
  get app() { return this.config.app; }
  get features() { return this.config.features; }

  // Helper methods
  isProduction(): boolean {
    return this.config.app.environment === 'production';
  }

  isDevelopment(): boolean {
    return this.config.app.environment === 'development';
  }

  isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    return this.config.features[feature];
  }

  // Get provider-specific config
  getAIConfig() {
    switch (this.config.ai.provider) {
      case 'openai':
        return this.config.ai.openai;
      case 'anthropic':
        return this.config.ai.anthropic;
      case 'gemini':
        return this.config.ai.gemini;
      case 'custom':
        return this.config.ai.custom;
      default:
        return null;
    }
  }

  getWhatsAppConfig() {
    switch (this.config.whatsapp.provider) {
      case 'twilio':
        return this.config.whatsapp.twilio;
      case 'gupshup':
        return this.config.whatsapp.gupshup;
      case '360dialog':
        return this.config.whatsapp.dialog360;
      case 'direct':
        return this.config.whatsapp.direct;
      default:
        return null;
    }
  }
}

export const config = new ConfigService();
export default config;
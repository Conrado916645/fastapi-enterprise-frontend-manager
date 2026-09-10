import { apiClient } from './client';
import { ENDPOINTS } from './urls';

export const AuthService = {
  login: async (credentials: any) => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    if (credentials.captcha_id) formData.append('captcha_id', credentials.captcha_id);
    if (credentials.captcha_answer) formData.append('captcha_answer', credentials.captcha_answer);
    if (credentials.recaptcha_token) formData.append('recaptcha_token', credentials.recaptcha_token);

    const response = await apiClient.post(ENDPOINTS.auth.login, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
    }

    return response.data;
  },
  // Inside your AuthService
verifyMfa: async (payload: { mfa_token: string; code: string }) => {
  const response = await apiClient.post(ENDPOINTS.auth.mfaVerify, payload);
  console.log(payload)
  if (response.data.access_token) {
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
  }

  return response.data;
},

  getRegistrationStatus: async () => {
    const response = await apiClient.get(ENDPOINTS.auth.registrationStatus);
    return response.data;
  },

  selfRegister: async (payload: {
    username: string;
    password: string;
    confirm_password: string;
    captcha_id?: string;
    captcha_answer?: string;
    recaptcha_token?: string;
  }) => {
    const response = await apiClient.post(ENDPOINTS.auth.register, payload);

    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
    }

    return response.data;
  },

  getCaptchaStatus: async () => {
    const response = await apiClient.get(ENDPOINTS.auth.captchaStatus);
    return response.data;
  },

  getCaptcha: async () => {
    const response = await apiClient.get(ENDPOINTS.auth.captcha);
    return response.data;
  },

  getAppInfo: async () => {
    const response = await apiClient.get(ENDPOINTS.auth.appInfo);
    return response.data;
  },

  getEmailStatus: async () => {
    const response = await apiClient.get(ENDPOINTS.auth.emailStatus);
    return response.data;
  },
};

export const SystemService = {
  getUserList: async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.users.list);
      return response.data;
    } catch (error: any) {
      console.error("UserService Error:", error.response?.data || error.message);
      throw error;
    }
  },
  getDashboardMetrics: async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.system.dashboard);

      return {
        metrics: response.data.metrics,
        resources: response.data.resources,
        installed_apps: response.data.installed_apps,
        logs: response.data.recent_logs,
        fetchedAt: new Date().toISOString()
      };
    } catch (error: any) {
      console.error("SystemService Error:", error.response?.data || error.message);
      throw error;
    }
  },
  getBackendHealth: async () => {
    const response = await apiClient.get(ENDPOINTS.system.health);
    return response.data;
  },
  getUserById: async (userId: string) => {
    const response = await apiClient.get(`${ENDPOINTS.users.list}${userId}`);
    return response.data;
  },
  deleteUser: async (userId: string | number) => {
    const response = await apiClient.delete(`/system/users/${userId}`);
    return response.data;
  },
  updateUser: async (userId: string | number, payload: {
    is_active?: boolean,
    permissions?: Record<string, string[]>
  }) => {
    const response = await apiClient.patch(`/system/users/${userId}`, payload);
    return response.data;
  },
  unlockUser: async (userId: string | number) => {
    const response = await apiClient.post(`/system/users/${userId}/unlock`);
    return response.data;
  }
};

export const UserService = {
  getKey2FA: async () => {
    const reponse = await apiClient.get(ENDPOINTS.users.mfa);
    return reponse.data
  },
  getMe: async () => {
    const response = await apiClient.get(ENDPOINTS.users.me);
    return response.data;
  },

  setupMfa: async () => {
    const response = await apiClient.post('/users/me/mfa/setup');
    return response.data;
  },

  verifyMfaSetup: async (code: string) => {
    const response = await apiClient.post(ENDPOINTS.users.mfaVerify, { code });
    return response.data;
  },

  disableMFA: async(password: string ) =>{
        const response = await apiClient.post(ENDPOINTS.users.mfaDisable, { password });
    return response.data;
  },

  updateProfile: async (payload: {
    email: string;
    full_name: string;
    date_of_birth: string;
    phone_number: string;
  }) => {
    const response = await apiClient.patch(ENDPOINTS.users.me, payload);
    return response.data;
  },

  sendVerificationEmail: async () => {
    const response = await apiClient.post(ENDPOINTS.users.sendVerificationEmail);
    return response.data;
  },
};

export const PasswordResetService = {
  forgotPassword: async (email: string) => {
    const response = await apiClient.post(ENDPOINTS.users.forgotPassword, { email });
    return response.data;
  },
  resetPassword: async (token: string, new_password: string) => {
    const response = await apiClient.post(ENDPOINTS.users.resetPassword, { token, new_password });
    return response.data;
  },
  verifyEmail: async (token: string) => {
    const response = await apiClient.get(ENDPOINTS.users.verifyEmail, { params: { token } });
    return response.data;
  },
};

export const UserRegistrationService = {
  registerUser: async (userData: {
    username: string;
    password: string;
    confirm_password: string;
    permissions: Record<string, any>;
    group_ids?: string[];
  }) => {
    const response = await apiClient.post(ENDPOINTS.users.register, userData);
    return response.data;
  }
};

export const RegistrationSettingsService = {
  getSettings: async () => {
    const response = await apiClient.get(ENDPOINTS.system.registrationSettings);
    return response.data;
  },
  updateSettings: async (payload: { allow_self_registration: boolean }) => {
    const response = await apiClient.patch(ENDPOINTS.system.registrationSettings, payload);
    return response.data;
  },
};

export const CaptchaSettingsService = {
  getSettings: async () => {
    const response = await apiClient.get(ENDPOINTS.system.captchaSettings);
    return response.data;
  },
  updateSettings: async (payload: {
    is_enabled: boolean;
    provider: 'local' | 'google';
    captcha_type: 'math' | 'text' | 'random';
    google_site_key?: string;
    google_secret_key?: string;
  }) => {
    const response = await apiClient.patch(ENDPOINTS.system.captchaSettings, payload);
    return response.data;
  },
};

export const GeneralSettingsService = {
  getSettings: async () => {
    const response = await apiClient.get(ENDPOINTS.system.generalSettings);
    return response.data;
  },
  updateSettings: async (payload: {
    app_name: string;
    frontend_domain?: string;
    backend_domain?: string;
  }) => {
    const response = await apiClient.patch(ENDPOINTS.system.generalSettings, payload);
    return response.data;
  },
};

export const InstalledAppsService = {
  getInstalledApps: async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.system.installedApps);
      return response.data.installed_apps;
    } catch (error: any) {
      console.error("System Registry Error:", error.response?.data || error.message);
      throw error;
    }
  }
};

export const GenerateApiKeyService = {
  generateApiKey: async (id: string | number) => {
    const response = await apiClient.post(ENDPOINTS.users.generateAPIKey(id));
    return response.data;
  }
};

export const ChangePasswordService = {
  resetPassword: async (id: string | number, newPassword: string) => {
    const response = await apiClient.post(`/system/users/${id}/reset-password`, {
      new_password: newPassword
    });
    return response.data;
  }
};

export const EmailSettingsService = {
  getSettings: async () => {
    const response = await apiClient.get(ENDPOINTS.system.emailSettings);
    return response.data;
  },

  updateSettings: async (payload) => {
    const response = await apiClient.put(ENDPOINTS.system.emailSettings, payload);
    return response.data;
  },

  sendTestEmail: async (to_email) => {
    await apiClient.post(ENDPOINTS.system.emailTest, { to_email });
  }
};

export const AISettingsService = {
  getSettings: async () => {
    const response = await apiClient.get(ENDPOINTS.system.aiSettings);
    return response.data;
  },

  updateSettings: async (payload: {
    is_enabled: boolean;
    provider?: string;
    model_name?: string;
    base_url?: string;
    api_key?: string;
    custom_prompt?: string;
  }) => {
    const response = await apiClient.patch(ENDPOINTS.system.aiSettings, payload);
    return response.data;
  },
};

export const GroupService = {
  getGroupList: async () => {
    const response = await apiClient.get(ENDPOINTS.groups.list);
    return response.data;
  },
  getGroupById: async (groupId: string | number) => {
    const response = await apiClient.get(ENDPOINTS.groups.detail(groupId));
    return response.data;
  },
  createGroup: async (payload: {
    name: string;
    description?: string;
    permissions: Record<string, string[]>;
  }) => {
    const response = await apiClient.post(ENDPOINTS.groups.create, payload);
    return response.data;
  },
  updateGroup: async (groupId: string | number, payload: {
    name?: string;
    description?: string;
    permissions?: Record<string, string[]>;
  }) => {
    const response = await apiClient.patch(ENDPOINTS.groups.update(groupId), payload);
    return response.data;
  },
  deleteGroup: async (groupId: string | number) => {
    const response = await apiClient.delete(ENDPOINTS.groups.delete(groupId));
    return response.data;
  },
  addMembers: async (groupId: string | number, userIds: string[]) => {
    const response = await apiClient.post(ENDPOINTS.groups.addMembers(groupId), { user_ids: userIds });
    return response.data;
  },
  removeMember: async (groupId: string | number, userId: string | number) => {
    const response = await apiClient.delete(ENDPOINTS.groups.removeMember(groupId, userId));
    return response.data;
  },
};

export const IngestionService = {
  getSources: async () => {
    const response = await apiClient.get(ENDPOINTS.ingestion.sources);
    return response.data; // ← returns the array
  },

  createSource: async (data: any) => {
    const response = await apiClient.post(ENDPOINTS.ingestion.sources, data);
    return response.data;
  },

  updateSource: async (id: string | number, data: any) => {
    const response = await apiClient.put(ENDPOINTS.ingestion.sourceDetail(id), data);
    return response.data;
  },

  deleteSource: async (id: string | number) => {
    const response = await apiClient.delete(ENDPOINTS.ingestion.sourceDetail(id));
    return response.data;
  },

  triggerIngestion: async (sourceId: string | number) => {
    const response = await apiClient.post(ENDPOINTS.ingestion.trigger(sourceId));
    return response.data;
  },

  getCleanedData: async (sourceId: string | number, limit = 50, offset = 0) => {
    const response = await apiClient.get(ENDPOINTS.ingestion.data(sourceId), {
      params: { limit, offset },
    });
    return response.data; // ← returns the cleaned data array
  },
};

// Base URL for your backend server
export const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

// Dictionary of all available API endpoints
export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    registrationStatus: '/auth/registration-status',
    captchaStatus: '/auth/captcha-status',
    captcha: '/auth/captcha',
    refreshToken: '/auth/refresh',
    mfaVerify: '/auth/login/mfa-verify',
    appInfo: '/auth/app-info',
    emailStatus: '/auth/email-status'
  },
  users: {
    list: '/system/users/',
    create: '/system/users',
    register : '/system/register',
    details: (id: string | number) => `/system/users/${id}`,
    permissions: (id: string | number) => `/system/users/${id}/permissions`,
    delete: (id: string | number) => `/system/users/${id}`,
    lock: (id: string | number) => `/system/users/${id}/lock`,
    unlock: (id: string | number) => `/system/users/${id}/unlock`,
    generateAPIKey: (id: string | number) => `/system/users/${id}/generate-api-key`,
    me: '/users/me',
    mfa: '/mfa/setup/totp',
    mfaVerify: '/mfa/verify/totp',
    mfaDisable: '/mfa/disable',
    forgotPassword: '/users/forgot-password',
    resetPassword: '/users/reset-password',
    verifyEmail: '/users/verify-email',
    sendVerificationEmail: '/users/me/send-verification-email'
  },
  apps: {
    config: '/apps/config',
    list: '/apps',
  },
  system: {
    health: '/system/health',
    auditLogs: '/audit-logs',
    dashboard: '/system/dashboard',
    installedApps: '/system/installed-apps',
    emailSettings: '/system/email-settings',
    emailTest: '/system/email-settings/test',
    aiSettings: '/system/ai-settings',
    registrationSettings: '/system/registration-settings',
    captchaSettings: '/system/captcha-settings',
    generalSettings: '/system/general-settings',
  },
  ingestion: {
  sources: '/sources/',
  sourceDetail: (id) => `/sources/${id}`,
  trigger: (id) => `/ingestion/trigger/${id}`,
  data: (sourceId) => `/data/${sourceId}`,
},
  groups: {
    list: '/groups',
    create: '/groups',
    detail: (id: string | number) => `/groups/${id}`,
    update: (id: string | number) => `/groups/${id}`,
    delete: (id: string | number) => `/groups/${id}`,
    addMembers: (id: string | number) => `/groups/${id}/members`,
    removeMember: (id: string | number, userId: string | number) => `/groups/${id}/members/${userId}`,
  },
} as const;
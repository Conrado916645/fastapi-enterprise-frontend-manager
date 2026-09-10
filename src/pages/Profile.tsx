import { useState, useEffect } from "react";
import {
  User,
  Shield,
  Key,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Mail,
  Phone,
  Pencil,
  RectangleEllipsis,
} from "lucide-react";
import { UserService } from "../api/services";

import ChangePasswordModal from "../components/ChangePasswordModel";
import EditProfileModal from "../components/EditProfileModal";
import TOTPMFAModel from "../components/TOTPMFAModel"; 
import { notify } from "../utils/toast";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [showMfaDisable, setShowMfaDisable] = useState(false);

  const refreshProfile = async () => {
    const data = await UserService.getMe();
    setUser(data);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await UserService.getMe();
        setUser(data);
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);


  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-8 text-slate-500">
        Failed to load profile data.
      </div>
    );
  }

  const formatDate = (date: string) => new Date(date).toLocaleString();
  const formatDOB = (date: string) => new Date(date).toLocaleDateString(); 
  const permissions = user.permissions?.installed_apps || user.permissions || {};

  const getInitials = () => {
    if (user.full_name) {
      const parts = user.full_name.trim().split(" ");
      if (parts.length > 1)
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      return user.full_name.substring(0, 2).toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold mb-8 dark:text-white flex items-center gap-3">
        <User className="text-blue-600" size={32} /> My Profile
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Identity & Security */}
        <div className="space-y-8">
          
          {/* Identity Card */}
          <div className="relative bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
            <button
              onClick={() => setShowEditProfile(true)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 rounded-full transition-colors"
              title="Edit Profile"
            >
              <Pencil size={18} />
            </button>

            <div className="h-24 w-24 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-600 font-bold text-3xl uppercase mx-auto mb-4">
              {getInitials()}
            </div>

            <h2 className="text-2xl font-bold dark:text-white">
              {user.full_name || `@${user.username}`}
            </h2>

            {user.full_name && (
              <p className="text-sm text-slate-500 mb-1 font-mono">
                @{user.username}
              </p>
            )}

            <div className="mt-6 mb-6 space-y-3 text-sm text-left bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 break-all">
                <Mail size={16} className="text-slate-400 shrink-0" />
                {user.email || (
                  <span className="italic text-slate-400">No email set</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <Phone size={16} className="text-slate-400 shrink-0" />
                {user.phone_number || (
                  <span className="italic text-slate-400">No phone set</span>
                )}
              </div>
            </div>

            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${user.is_active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}
            >
              {user.is_active ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              {user.is_active ? "Account Active" : "Account Disabled"}
            </div>
          </div>

          {/* Two-Factor Auth (TOTP) Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold flex items-center gap-2 dark:text-white">
                <RectangleEllipsis
                  size={20}
                  className={user.is_totp_enabled ? "text-emerald-500" : "text-blue-500"}
                />
                Two-Factor Auth
              </h3>
              
              {/* Added Status Badge */}
              <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider ${user.is_totp_enabled ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                {user.is_totp_enabled ? "Enabled" : "Disabled"}
              </span>
            </div>

            {/* Check against is_totp_enabled flag */}
            {user.is_totp_enabled ? (
              <button
                onClick={() => setShowMfaDisable(true)}
                className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 py-3 rounded-lg font-bold transition-colors border border-red-200 dark:border-red-800/50"
              >
                Disable 2FA
              </button>
            ) : (
              <button
                onClick={() => setShowMfaSetup(true)}
                className="w-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 py-3 rounded-lg font-bold transition-colors border border-blue-200 dark:border-blue-800/50"
              >
                Enable 2FA
              </button>
            )}
          </div>

          {/* Security Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold flex items-center gap-2 dark:text-white mb-4">
              <Key size={20} className="text-amber-500" /> Security
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white py-3 rounded-lg font-bold transition-colors"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Permissions */}
        <div className="md:col-span-2 space-y-8">
          {/* Account Details */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold flex items-center gap-2 dark:text-white mb-6">
              <Calendar size={20} className="text-blue-500" /> Account Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                  <Calendar size={14} /> Member Since
                </p>
                <p className="font-medium dark:text-white">
                  {formatDate(user.created_at)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                  <Calendar size={14} /> Date of Birth
                </p>
                <p className="font-medium dark:text-white">
                  {user.date_of_birth ? (
                    formatDOB(user.date_of_birth)
                  ) : (
                    <span className="italic text-slate-400 font-normal">
                      Not set
                    </span>
                  )}
                </p>
              </div>

              <div className="border-t dark:border-slate-800 pt-4 mt-2">
                <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                  <Clock size={14} /> Last Login
                </p>
                <p className="font-medium dark:text-white">
                  {user.last_login_at ? formatDate(user.last_login_at) : "First Login"}
                </p>
              </div>

              <div className="border-t dark:border-slate-800 pt-4 mt-2">
                <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                  <Clock size={14} /> Last Updated
                </p>
                <p className="font-medium dark:text-white">
                  {formatDate(user.updated_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Read-Only Permissions List */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold flex items-center gap-2 dark:text-white mb-6">
              <Shield size={20} className="text-emerald-500" /> My Permissions
            </h3>

            {Object.keys(permissions).length === 0 ? (
              <p className="text-slate-500 text-sm italic">
                No special permissions assigned.
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(permissions).map(
                  ([app, actions]: [string, any]) => (
                    <div
                      key={app}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 gap-3"
                    >
                      <span className="font-bold capitalize dark:text-white">
                        {app}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(actions) &&
                          actions.map((action: string) => (
                            <span
                              key={action}
                              className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium"
                            >
                              {action}
                            </span>
                          ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
      
      {showEditProfile && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditProfile(false)}
          onSuccess={refreshProfile}
        />
      )}

      {/* Dynamic TOTP Verification Flow */}
      {showMfaSetup && (
        <TOTPMFAModel 
          onClose={() => setShowMfaSetup(false)} 
          onSuccess={() => {
            setShowMfaSetup(false);
            refreshProfile(); 
          }} 
        />
      )}

      {showMfaDisable && <TOTPMFAModel mode="disable" onClose={() => setShowMfaDisable(false)} onSuccess={() => { setShowMfaDisable(false); refreshProfile(); }} />}
    </div>
  );
}
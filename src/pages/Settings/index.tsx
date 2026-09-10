import { useState } from "react";
import GeneralSettings from "./GeneralSettings";
import EmailSettings from "./EmailSettings";
import AISettings from "./AISettings";
import RegistrationSettings from "./RegistrationSettings";
import CaptchaSettings from "./CaptchaSettings";
import SourceList from "../../components/Ingestion/SourceList";
import DataViewer from "../../components/Ingestion/DataViewer";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [viewSourceId, setViewSourceId] = useState<number | null>(null);

  return (
    <div className="w-full flex flex-col">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Settings</h1>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab("general")}
            className={`py-2 px-4 text-sm font-medium border-b-2 ${
              activeTab === "general"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab("email")}
            className={`py-2 px-4 text-sm font-medium border-b-2 ${
              activeTab === "email"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            Email Settings
          </button>
          <button
            onClick={() => setActiveTab("ingestion")}
            className={`py-2 px-4 text-sm font-medium border-b-2 ${
              activeTab === "ingestion"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            API Ingestion
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`py-2 px-4 text-sm font-medium border-b-2 ${
              activeTab === "ai"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            AI Settings
          </button>
          <button
            onClick={() => setActiveTab("registration")}
            className={`py-2 px-4 text-sm font-medium border-b-2 ${
              activeTab === "registration"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            Registration
          </button>
          <button
            onClick={() => setActiveTab("captcha")}
            className={`py-2 px-4 text-sm font-medium border-b-2 ${
              activeTab === "captcha"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400"
            }`}
          >
            Captcha
          </button>
        </nav>
      </div>

      {/* Tab Content – flex-1 to fill remaining vertical space */}
      <div className="flex-1">
        {activeTab === "general" && <GeneralSettings />}
        {activeTab === "email" && <EmailSettings />}
        {activeTab === "ai" && <AISettings />}
        {activeTab === "registration" && <RegistrationSettings />}
        {activeTab === "captcha" && <CaptchaSettings />}
        {activeTab === "ingestion" && (
          <div className="h-full">
            <SourceList onViewData={setViewSourceId} />
            {viewSourceId && (
              <DataViewer
                sourceId={viewSourceId}
                onClose={() => setViewSourceId(null)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
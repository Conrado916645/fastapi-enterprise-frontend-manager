import { useState } from "react";
import EmailSettings from "./EmailSettings";
import AISettings from "./AISettings";
import SourceList from "../../components/Ingestion/SourceList";
import DataViewer from "../../components/Ingestion/DataViewer";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("email");
  const [viewSourceId, setViewSourceId] = useState<number | null>(null);

  return (
    <div className="w-full h-full min-h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Settings</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab("email")}
            className={`py-2 px-4 text-sm font-medium border-b-2 ${
              activeTab === "email"
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            Email Settings
          </button>
          <button
            onClick={() => setActiveTab("ingestion")}
            className={`py-2 px-4 text-sm font-medium border-b-2 ${
              activeTab === "ingestion"
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            API Ingestion
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`py-2 px-4 text-sm font-medium border-b-2 ${
              activeTab === "ai"
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            AI Settings
          </button>
        </nav>
      </div>

      {/* Tab Content – flex-1 to fill remaining vertical space */}
      <div className="flex-1">
        {activeTab === "email" && <EmailSettings />}
        {activeTab === "ai" && <AISettings />}
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
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { IngestionService } from "../../api/services";
import SourceForm from "./SourceForm";

export default function SourceList({ onViewData }) {
  const [sources, setSources] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSource, setEditingSource] = useState(null);

const fetchSources = async () => {
  try {
    const data = await IngestionService.getSources();
    // Make sure we have an array
    const sourcesArray = Array.isArray(data) ? data : (data?.sources ?? []);
    setSources(sourcesArray);
  } catch (err) {
    toast.error("Failed to load sources.");
  }
};

  useEffect(() => {
    fetchSources();
  }, []);

  const handleDelete = async (id) => {
    try {
      await IngestionService.deleteSource(id);
      fetchSources();
      toast.success("Source deleted.");
    } catch (err) {
      toast.error("Delete failed.");
    }
  };

  const handleTrigger = async (id) => {
    try {
      await IngestionService.triggerIngestion(id);
      toast.success("Ingestion triggered.");
    } catch (err) {
      toast.error("Trigger failed.");
    }
  };

  const openEdit = (source) => {
    setEditingSource(source);
    setShowForm(true);
  };

  const openAdd = () => {
    setEditingSource(null);
    setShowForm(true);
  };

  const handleFormSaved = () => {
    setShowForm(false);
    fetchSources();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold dark:text-white">API Sources</h2>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
        >
          Add Source
        </button>
      </div>
      <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Endpoint</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Method</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {sources.map((src) => (
              <tr key={src.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                <td className="px-4 py-3 text-sm dark:text-white">{src.name}</td>
                <td className="px-4 py-3 text-sm dark:text-white truncate max-w-xs">{src.endpoint}</td>
                <td className="px-4 py-3 text-sm dark:text-white">{src.method}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openEdit(src)}
                    className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(src.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 mr-2"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleTrigger(src.id)}
                    className="text-green-600 hover:text-green-800 dark:text-green-400 mr-2"
                  >
                    Trigger
                  </button>
                  <button
                    onClick={() => onViewData(src.id)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    Data
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <SourceForm
          source={editingSource}
          onClose={() => setShowForm(false)}
          onSaved={handleFormSaved}
        />
      )}
    </div>
  );
}
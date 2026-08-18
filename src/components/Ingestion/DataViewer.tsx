import { useState, useEffect } from "react";
import { IngestionService } from "../../api/services";

export default function DataViewer({ sourceId, onClose }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sourceId) {
      IngestionService.getCleanedData(sourceId)
        .then((res) => setData(res))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [sourceId]);

  if (loading) return <div className="p-4 text-center dark:text-white">Loading...</div>;
  if (!data.length) return <div className="p-4 text-center dark:text-white">No data available.</div>;

  // Assume each record has 'external_id' and 'data' (JSON)
  const sample = data[0].data;
  const columns = sample ? Object.keys(sample) : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold dark:text-white">Cleaned Data (Source ID: {sourceId})</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md"
          >
            Close
          </button>
        </div>
        <div className="overflow-auto max-h-96">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">External ID</th>
                {columns.map((col) => (
                  <th key={col} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="px-4 py-2 text-sm dark:text-white">{row.external_id}</td>
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-2 text-sm dark:text-white">
                      {typeof row.data[col] === "object"
                        ? JSON.stringify(row.data[col])
                        : row.data[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
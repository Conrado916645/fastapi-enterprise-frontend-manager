// src/pages/Settings/ApiIngestion.jsx
import { useState } from 'react';
import SourceList from '../../components/Ingestion/SourceList';
import DataViewer from '../../components/Ingestion/DataViewer';

const ApiIngestion = () => {
  const [viewSourceId, setViewSourceId] = useState(null);

  return (
    <div>
      <SourceList onViewData={setViewSourceId} />
      {viewSourceId && (
        <DataViewer sourceId={viewSourceId} onClose={() => setViewSourceId(null)} />
      )}
    </div>
  );
};
export default ApiIngestion;
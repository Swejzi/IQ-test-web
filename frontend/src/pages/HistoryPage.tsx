import React from 'react';

const HistoryPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">
          Historie testů
        </h1>
        <p className="text-lg text-neutral-600 mb-8">
          Stránka historie - implementace bude dokončena v další fázi.
        </p>
        <div className="bg-success-50 border border-success-200 rounded-lg p-6">
          <p className="text-success-800">
            Tato stránka bude obsahovat:
          </p>
          <ul className="mt-4 text-left text-success-700 space-y-2">
            <li>• Seznam všech dokončených testů</li>
            <li>• Trend vývoje IQ skóre</li>
            <li>• Porovnání výsledků</li>
            <li>• Filtry a vyhledávání</li>
            <li>• Export historie</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;

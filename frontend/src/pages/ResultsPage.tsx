import React from 'react';

const ResultsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">
          Výsledky testu
        </h1>
        <p className="text-lg text-neutral-600 mb-8">
          Stránka výsledků - implementace bude dokončena v další fázi.
        </p>
        <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-6">
          <p className="text-secondary-800">
            Tato stránka bude obsahovat:
          </p>
          <ul className="mt-4 text-left text-secondary-700 space-y-2">
            <li>• IQ skóre a percentilové zařazení</li>
            <li>• Breakdown podle kategorií</li>
            <li>• Grafy a vizualizace</li>
            <li>• Porovnání s normami</li>
            <li>• Export do PDF</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;

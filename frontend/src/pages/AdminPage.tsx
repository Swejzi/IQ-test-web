import React from 'react';

const AdminPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">
          Administrace
        </h1>
        <p className="text-lg text-neutral-600 mb-8">
          Admin panel - implementace bude dokončena v další fázi.
        </p>
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
          <p className="text-neutral-800">
            Admin panel bude obsahovat:
          </p>
          <ul className="mt-4 text-left text-neutral-700 space-y-2">
            <li>• Dashboard s přehledem statistik</li>
            <li>• Správa otázek a kategorií</li>
            <li>• Analýza výsledků testů</li>
            <li>• Správa uživatelů</li>
            <li>• Systémové nastavení</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

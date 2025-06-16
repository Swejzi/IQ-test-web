import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">
          IQ Test
        </h1>
        <p className="text-lg text-neutral-600 mb-8">
          Testovací stránka - implementace bude dokončena v další fázi.
        </p>
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
          <p className="text-primary-800">
            Tato stránka bude obsahovat:
          </p>
          <ul className="mt-4 text-left text-primary-700 space-y-2">
            <li>• Interaktivní otázky s různými typy úloh</li>
            <li>• Časový odpočet</li>
            <li>• Progress bar</li>
            <li>• Behavioral tracking</li>
            <li>• Adaptivní obtížnost</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestPage;

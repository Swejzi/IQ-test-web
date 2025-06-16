import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-12">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
          O IQ testu
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-neutral-600 mb-8">
            Náš IQ test je založen na moderních psychometrických metodách a poskytuje 
            přesné měření kognitivních schopností pomocí standardizovaných úloh.
          </p>

          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              Jak test funguje
            </h2>
            <p className="text-neutral-600 mb-4">
              Test využívá Item Response Theory (IRT) pro přesné měření kognitivních schopností 
              a adaptivní algoritmy pro optimální výběr otázek podle výkonu uživatele.
            </p>
            <ul className="list-disc list-inside text-neutral-600 space-y-2">
              <li>Standardizované psychometrické úlohy</li>
              <li>Adaptivní obtížnost na základě výkonu</li>
              <li>Anti-cheating systém s behavioral tracking</li>
              <li>Normalizace na standardní IQ škálu (100 ± 15)</li>
              <li>Detailní analýza podle kategorií</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              Kategorie testů
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  Logické sekvence
                </h3>
                <p className="text-neutral-600 text-sm">
                  Aritmetické a geometrické postupnosti, Fibonacciho sekvence, 
                  polynomiální vzory.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  Prostorová inteligence
                </h3>
                <p className="text-neutral-600 text-sm">
                  Raven-style progresivní matice, mentální rotace, 3D vizualizace.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  Verbální reasoning
                </h3>
                <p className="text-neutral-600 text-sm">
                  Analogie mezi slovy, klasifikace pojmů, vztahy mezi koncepty.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  Pracovní paměť
                </h3>
                <p className="text-neutral-600 text-sm">
                  N-back testy, sekvenční zapamatování, manipulace s informacemi.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-warning-50 border border-warning-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-warning-800 mb-2">
              Důležité upozornění
            </h3>
            <p className="text-warning-700 text-sm">
              Tento test slouží pouze pro vzdělávací a zábavní účely. 
              Pro oficiální psychologické vyšetření se obraťte na kvalifikovaného psychologa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

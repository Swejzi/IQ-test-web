import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectIsAuthenticated, selectUser, createAnonymousSession } from '@/store/slices/authSlice';
import { 
  AcademicCapIcon, 
  ClockIcon, 
  ChartBarIcon, 
  ShieldCheckIcon,
  PlayIcon,
  UserPlusIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { AnonymousUserData } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  
  const [showAnonymousForm, setShowAnonymousForm] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [anonymousData, setAnonymousData] = useState<AnonymousUserData>({
    age: undefined,
    gender: undefined,
    education: undefined,
    country: 'CZ',
  });

  const features = [
    {
      icon: AcademicCapIcon,
      title: 'Profesionální IQ test',
      description: 'Standardizovaný test založený na moderních psychometrických metodách s adaptivní obtížností.',
    },
    {
      icon: ClockIcon,
      title: 'Časové limity',
      description: 'Realistické časové omezení simulující podmínky profesionálních testů.',
    },
    {
      icon: ChartBarIcon,
      title: 'Detailní analýza',
      description: 'Komplexní vyhodnocení s breakdown podle kategorií a percentilové zařazení.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Anti-cheating systém',
      description: 'Pokročilé sledování chování zajišťující validitu výsledků.',
    },
  ];

  const handleStartTest = async () => {
    setIsStarting(true);
    
    try {
      if (!isAuthenticated) {
        // Create anonymous session first
        await dispatch(createAnonymousSession(anonymousData)).unwrap();
      }
      
      // Navigate to test
      navigate('/test');
    } catch (error) {
      console.error('Failed to start test:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleAnonymousStart = () => {
    setShowAnonymousForm(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center py-12 lg:py-20">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6">
            Profesionální{' '}
            <span className="gradient-text">IQ Test</span>
          </h1>
          <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
            Změřte svou inteligenci pomocí standardizovaného testu s pokročilými 
            psychometrickými funkcemi. Získejte detailní analýzu svých kognitivních schopností.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <button
                onClick={handleStartTest}
                disabled={isStarting}
                className="btn btn-primary btn-xl flex items-center"
              >
                {isStarting ? (
                  <LoadingSpinner size="sm" color="white" className="mr-2" />
                ) : (
                  <PlayIcon className="h-6 w-6 mr-2" />
                )}
                Začít test
              </button>
            ) : (
              <>
                <button
                  onClick={handleAnonymousStart}
                  disabled={isStarting}
                  className="btn btn-primary btn-xl flex items-center"
                >
                  <PlayIcon className="h-6 w-6 mr-2" />
                  Začít anonymně
                </button>
                <Link
                  to="/register"
                  className="btn btn-outline btn-xl flex items-center"
                >
                  <UserPlusIcon className="h-6 w-6 mr-2" />
                  Registrovat se
                </Link>
              </>
            )}
          </div>

          {/* User greeting */}
          {isAuthenticated && user && (
            <div className="mt-6 p-4 bg-primary-50 rounded-lg inline-block">
              <p className="text-primary-800">
                Vítejte zpět, {user.username || user.email || 'uživateli'}! 
                Připraveni na nový test?
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Anonymous Form Modal */}
      {showAnonymousForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-neutral-600 bg-opacity-75" onClick={() => setShowAnonymousForm(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">
                Základní informace (volitelné)
              </h3>
              <p className="text-sm text-neutral-600 mb-6">
                Tyto informace nám pomohou lépe vyhodnotit vaše výsledky podle věkové skupiny a vzdělání.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Věk
                  </label>
                  <input
                    type="number"
                    min="13"
                    max="120"
                    value={anonymousData.age || ''}
                    onChange={(e) => setAnonymousData(prev => ({ 
                      ...prev, 
                      age: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    className="input"
                    placeholder="Váš věk"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Pohlaví
                  </label>
                  <select
                    value={anonymousData.gender || ''}
                    onChange={(e) => setAnonymousData(prev => ({ 
                      ...prev, 
                      gender: e.target.value as any || undefined 
                    }))}
                    className="input"
                  >
                    <option value="">Vyberte pohlaví</option>
                    <option value="MALE">Muž</option>
                    <option value="FEMALE">Žena</option>
                    <option value="OTHER">Jiné</option>
                    <option value="PREFER_NOT_TO_SAY">Nechci uvádět</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Vzdělání
                  </label>
                  <select
                    value={anonymousData.education || ''}
                    onChange={(e) => setAnonymousData(prev => ({ 
                      ...prev, 
                      education: e.target.value as any || undefined 
                    }))}
                    className="input"
                  >
                    <option value="">Vyberte vzdělání</option>
                    <option value="PRIMARY">Základní</option>
                    <option value="SECONDARY">Střední</option>
                    <option value="BACHELOR">Bakalářské</option>
                    <option value="MASTER">Magisterské</option>
                    <option value="DOCTORATE">Doktorské</option>
                    <option value="OTHER">Jiné</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAnonymousForm(false)}
                  className="btn btn-outline flex-1"
                >
                  Zrušit
                </button>
                <button
                  onClick={handleStartTest}
                  disabled={isStarting}
                  className="btn btn-primary flex-1 flex items-center justify-center"
                >
                  {isStarting ? (
                    <LoadingSpinner size="sm" color="white" className="mr-2" />
                  ) : (
                    <PlayIcon className="h-5 w-5 mr-2" />
                  )}
                  Začít test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Proč náš IQ test?
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Využíváme nejmodernější psychometrické metody pro přesné měření kognitivních schopností.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-lg bg-primary-100 mb-4">
                <feature.icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-neutral-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Test Categories */}
      <div className="py-16 bg-white rounded-2xl shadow-sm">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Co test měří
          </h2>
          <p className="text-lg text-neutral-600">
            Test zahrnuje 5 hlavních kategorií kognitivních schopností
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Logické sekvence',
              description: 'Číselné a logické postupnosti, vzory a pravidla',
              examples: 'Aritmetické řady, Fibonacciho sekvence',
            },
            {
              title: 'Prostorová inteligence',
              description: 'Mentální rotace, 3D vizualizace, maticové úlohy',
              examples: 'Raven matice, prostorové skládání',
            },
            {
              title: 'Verbální reasoning',
              description: 'Analogie, vztahy mezi pojmy, klasifikace',
              examples: 'Slovní analogie, kategorizace',
            },
            {
              title: 'Pracovní paměť',
              description: 'Krátkodobé zapamatování a manipulace s informacemi',
              examples: 'N-back testy, sekvenční paměť',
            },
            {
              title: 'Rychlost zpracování',
              description: 'Rychlé rozpoznávání vzorů a zpracování informací',
              examples: 'Počítání symbolů, rychlé porovnávání',
            },
          ].map((category, index) => (
            <div key={index} className="p-6 border border-neutral-200 rounded-lg">
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                {category.title}
              </h3>
              <p className="text-neutral-600 mb-3">
                {category.description}
              </p>
              <p className="text-sm text-neutral-500">
                <strong>Příklady:</strong> {category.examples}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 text-center">
        <h2 className="text-3xl font-bold text-neutral-900 mb-4">
          Připraveni zjistit své IQ?
        </h2>
        <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
          Test trvá přibližně 45-60 minut. Doporučujeme klidné prostředí bez rušení.
        </p>
        
        {!isAuthenticated && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleAnonymousStart}
              className="btn btn-primary btn-lg flex items-center"
            >
              <PlayIcon className="h-5 w-5 mr-2" />
              Začít test anonymně
            </button>
            <span className="text-neutral-400">nebo</span>
            <Link
              to="/register"
              className="btn btn-outline btn-lg flex items-center"
            >
              Registrovat se pro uložení výsledků
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;

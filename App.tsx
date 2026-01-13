
import React, { useState, useCallback } from 'react';
import { AnalysisResult } from './types';
import { fetchComparison } from './services/geminiService';
import { ScaleIcon } from './components/icons/ScaleIcon';
import { CheckIcon } from './components/icons/CheckIcon';
import { XIcon } from './components/icons/XIcon';
import { LoadingSpinner } from './components/LoadingSpinner';

const App: React.FC = () => {
  const [itemA, setItemA] = useState<string>('');
  const [itemB, setItemB] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!itemA || !itemB) {
      setError('Por favor, preencha as duas opções para comparar.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    try {
      const result = await fetchComparison(itemA, itemB);
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  }, [itemA, itemB]);

  const ResultCard: React.FC<{ title: string; pros: string[]; cons: string[] }> = ({ title, pros, cons }) => (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
      <h3 className="text-2xl font-bold text-center text-teal-400 mb-4">{title}</h3>
      <div>
        <h4 className="text-lg font-semibold text-green-400 mb-2 flex items-center">
          <CheckIcon className="h-6 w-6 mr-2" />
          Prós
        </h4>
        <ul className="space-y-2 list-inside">
          {pros.map((pro, index) => (
            <li key={index} className="flex items-start">
              <span className="text-green-400 mr-2 mt-1">&#8226;</span>
              <span>{pro}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6">
        <h4 className="text-lg font-semibold text-red-400 mb-2 flex items-center">
          <XIcon className="h-6 w-6 mr-2" />
          Contras
        </h4>
        <ul className="space-y-2 list-inside">
          {cons.map((con, index) => (
            <li key={index} className="flex items-start">
              <span className="text-red-400 mr-2 mt-1">&#8226;</span>
              <span>{con}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <main className="w-full max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-4">
            <ScaleIcon className="h-12 w-12 text-teal-400" />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-500">
              Balança de Pessoas
            </h1>
          </div>
          <p className="mt-2 text-lg text-gray-400">
            Compare duas opções e deixe a IA analisar os prós e contras para você.
          </p>
        </header>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <textarea
              value={itemA}
              onChange={(e) => setItemA(e.target.value)}
              placeholder="Opção A: Ex: Trabalhar como freelancer"
              className="w-full h-32 p-4 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-300 resize-none"
              disabled={isLoading}
            />
            <textarea
              value={itemB}
              onChange={(e) => setItemB(e.target.value)}
              placeholder="Opção B: Ex: Trabalhar em uma empresa"
              className="w-full h-32 p-4 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-300 resize-none"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !itemA || !itemB}
            className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center gap-2"
          >
            {isLoading ? <LoadingSpinner /> : 'Analisar'}
          </button>
        </div>

        <div className="mt-8">
          {error && <p className="text-red-400 text-center bg-red-900/50 p-3 rounded-lg">{error}</p>}
          
          {isLoading && (
              <div className="text-center text-gray-400 flex flex-col items-center">
                <LoadingSpinner />
                <p className="mt-2">Analisando... A IA está ponderando as opções.</p>
              </div>
          )}

          {analysisResult && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ResultCard title={analysisResult.itemA.name} pros={analysisResult.itemA.pros} cons={analysisResult.itemA.cons} />
                <ResultCard title={analysisResult.itemB.name} pros={analysisResult.itemB.pros} cons={analysisResult.itemB.cons} />
              </div>
              <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
                <h3 className="text-2xl font-bold text-center text-blue-400 mb-4">Conclusão da IA</h3>
                <p className="text-gray-300 text-center">{analysisResult.conclusion}</p>
              </div>
            </div>
          )}
          
          {!isLoading && !analysisResult && !error && (
            <div className="text-center text-gray-500 mt-12">
              <p>Insira duas opções para comparar e clique em "Analisar".</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;

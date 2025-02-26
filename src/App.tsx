import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Database } from './types/supabase';
import { WrenchIcon, Trash2Icon, SearchIcon } from 'lucide-react';

// Initialize Supabase client
const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Keyword {
  id: number;
  term: string;
  category: string;
  created_at: string;
}

// Maritime keyword patterns by category
const MARITIME_PATTERNS = {
  vessel: [
    /\b(ship|vessel|boat|tanker|cargo|container|bulk carrier|ferry|yacht|tug|barge)\b/i,
    /\b(bow|stern|deck|hull|bridge|anchor|propeller|rudder)\b/i,
    /\b(captain|crew|sailor|helmsman|navigator)\b/i
  ],
  port: [
    /\b(port|harbor|terminal|berth|dock|wharf|pier|jetty|quay)\b/i,
    /\b(stevedore|longshoreman|port authority|pilot|agent)\b/i,
    /\b(loading|unloading|berthing|mooring|departure|arrival)\b/i
  ],
  cargo: [
    /\b(container|bulk|break-bulk|ro-ro|liquid|cargo|freight|goods)\b/i,
    /\b(loading|discharge|stowage|lashing|securing|handling)\b/i,
    /\b(tonnage|weight|volume|measurement|package|unit)\b/i
  ],
  documentation: [
    /\b(bill of lading|manifest|certificate|document|declaration)\b/i,
    /\b(customs|clearance|permit|license|inspection|survey)\b/i,
    /\b(insurance|policy|claim|coverage|liability)\b/i
  ],
  safety: [
    /\b(safety|security|emergency|hazard|risk|danger|accident)\b/i,
    /\b(equipment|gear|device|system|procedure|protocol)\b/i,
    /\b(inspection|audit|compliance|regulation|standard)\b/i
  ]
};

function App() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newTerm, setNewTerm] = useState('');
  const [category, setCategory] = useState('vessel');
  const [loading, setLoading] = useState(true);
  const [analysisText, setAnalysisText] = useState('');
  const [foundKeywords, setFoundKeywords] = useState<Record<string, string[]>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKeywords();
  }, []);

  async function fetchKeywords() {
    try {
      const { data, error } = await supabase
        .from('keywords')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKeywords(data || []);
    } catch (error) {
      console.error('Error fetching keywords:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addKeyword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    
    try {
      // Check if keyword already exists
      const { data: existing } = await supabase
        .from('keywords')
        .select('id')
        .eq('term', newTerm.toLowerCase())
        .single();

      if (existing) {
        setError(`Keyword "${newTerm}" already exists`);
        return;
      }

      const { error } = await supabase
        .from('keywords')
        .insert([{ term: newTerm.toLowerCase(), category }]);

      if (error) throw error;
      setNewTerm('');
      fetchKeywords();
    } catch (error) {
      console.error('Error adding keyword:', error);
      setError('Failed to add keyword. Please try again.');
    }
  }

  async function deleteKeyword(id: number) {
    try {
      const { error } = await supabase
        .from('keywords')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchKeywords();
    } catch (error) {
      console.error('Error deleting keyword:', error);
    }
  }

  function extractKeywords(text: string) {
    const keywords: Record<string, Set<string>> = {};
    
    Object.entries(MARITIME_PATTERNS).forEach(([category, patterns]) => {
      keywords[category] = new Set();
      patterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
          matches.forEach(match => keywords[category].add(match.toLowerCase()));
        }
      });
    });

    return Object.fromEntries(
      Object.entries(keywords)
        .filter(([_, terms]) => terms.size > 0)
        .map(([category, terms]) => [category, Array.from(terms)])
    );
  }

  async function analyzeText(e: React.FormEvent) {
    e.preventDefault();
    setAnalyzing(true);
    setError(null);
    
    try {
      const found = extractKeywords(analysisText);
      setFoundKeywords(found);
      
      // Store new keywords
      for (const [category, terms] of Object.entries(found)) {
        for (const term of terms) {
          await supabase
            .from('keywords')
            .insert([{ term, category }])
            .select()
            .maybeSingle();
        }
      }
      
      await fetchKeywords();
    } catch (error) {
      console.error('Error analyzing text:', error);
      setError('Failed to analyze text. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <WrenchIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Maritime Logistics Keywords Collection</h1>
        </div>
        
        {/* Text Analysis Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Analyze Text for Keywords</h2>
          <form onSubmit={analyzeText} className="space-y-4">
            <div>
              <label htmlFor="analysisText" className="block text-sm font-medium text-gray-700">
                Enter text to analyze
              </label>
              <textarea
                id="analysisText"
                value={analysisText}
                onChange={(e) => setAnalysisText(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter maritime-related text here..."
              />
            </div>
            <button
              type="submit"
              disabled={analyzing}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
            >
              <SearchIcon className="w-5 h-5" />
              {analyzing ? 'Analyzing...' : 'Analyze Text'}
            </button>
          </form>

          {/* Analysis Results */}
          {Object.keys(foundKeywords).length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Found Keywords:</h3>
              <div className="space-y-3">
                {Object.entries(foundKeywords).map(([category, terms]) => (
                  <div key={category} className="bg-gray-50 p-4 rounded-md">
                    <h4 className="text-md font-medium text-gray-700 capitalize mb-2">{category}:</h4>
                    <div className="flex flex-wrap gap-2">
                      {terms.map((term) => (
                        <span
                          key={term}
                          className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full"
                        >
                          {term}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Keyword Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Keyword</h2>
          <form onSubmit={addKeyword} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="term" className="block text-sm font-medium text-gray-700">
                Keyword Term
              </label>
              <input
                type="text"
                id="term"
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="vessel">Vessel Related</option>
                <option value="port">Port Operations</option>
                <option value="cargo">Cargo Handling</option>
                <option value="documentation">Documentation</option>
                <option value="safety">Safety & Security</option>
                <option value="other">Other</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Keyword
            </button>
          </form>
        </div>

        {/* Keywords List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Stored Keywords</h2>
          {loading ? (
            <p className="text-gray-500">Loading keywords...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Term
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Added On
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {keywords.map((keyword) => (
                    <tr key={keyword.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {keyword.term}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {keyword.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(keyword.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => deleteKeyword(keyword.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2Icon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
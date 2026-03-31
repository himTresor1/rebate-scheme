import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { api } from '../../utils/api';
import { CheckCircle, XCircle, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface Evaluation {
  score: number;
  criteriaEvaluations: Record<string, boolean>;
  notes?: string;
  evaluatorId: string;
  completedAt?: string;
}

interface ScoreComparisonViewProps {
  applicationId: string;
}

export function ScoreComparisonView({ applicationId }: ScoreComparisonViewProps) {
  const [analystEval, setAnalystEval] = useState<Evaluation | null>(null);
  const [qaEval, setQaEval] = useState<Evaluation | null>(null);
  const [criteria, setCriteria] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [applicationId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [evaluations, criteriaList] = await Promise.all([
        api.getAllEvaluations(applicationId.replace('application:', '')),
        api.getCriteria()
      ]);

      setAnalystEval(evaluations.analyst);
      setQaEval(evaluations.qa);
      setCriteria(criteriaList);
    } catch (error) {
      console.error('Failed to load comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#023F40] border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-600 mt-4">Loading score comparison...</p>
        </CardContent>
      </Card>
    );
  }

  const getDiscrepancyCount = () => {
    if (!analystEval || !qaEval) return 0;
    let count = 0;
    
    Object.keys(analystEval.criteriaEvaluations || {}).forEach(criteriaId => {
      if (analystEval.criteriaEvaluations[criteriaId] !== qaEval.criteriaEvaluations?.[criteriaId]) {
        count++;
      }
    });
    
    return count;
  };

  const scoreDifference = analystEval && qaEval ? 
    Math.abs(analystEval.score - qaEval.score) : 0;

  const discrepancyCount = getDiscrepancyCount();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Analyst Score</p>
                <p className="text-3xl font-bold text-[#023F40]">
                  {analystEval?.score || 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">QA Score</p>
                <p className="text-3xl font-bold text-[#023F40]">
                  {qaEval?.score || 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Score Difference</p>
                <p className={`text-3xl font-bold ${scoreDifference > 10 ? 'text-red-600' : 'text-green-600'}`}>
                  {scoreDifference.toFixed(1)}%
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                scoreDifference > 10 ? 'bg-red-100' : 'bg-green-100'
              }`}>
                {scoreDifference > 10 ? (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Criteria Comparison Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#023F40]">Criteria-by-Criteria Comparison</CardTitle>
            {discrepancyCount > 0 && (
              <Badge variant="destructive" className="text-sm">
                {discrepancyCount} {discrepancyCount === 1 ? 'Discrepancy' : 'Discrepancies'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Criterion</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 w-32">Analyst</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 w-32">QA</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700 w-24">Match</th>
                </tr>
              </thead>
              <tbody>
                {criteria.map((criterion, index) => {
                  const analystPass = analystEval?.criteriaEvaluations?.[criterion.id] ?? false;
                  const qaPass = qaEval?.criteriaEvaluations?.[criterion.id] ?? false;
                  const match = analystPass === qaPass;

                  return (
                    <tr 
                      key={criterion.id}
                      className={`border-b border-gray-100 ${!match ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{criterion.name}</p>
                          <p className="text-sm text-gray-600">{criterion.description}</p>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4">
                        {analystEval ? (
                          analystPass ? (
                            <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600 mx-auto" />
                          )
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="text-center py-4 px-4">
                        {qaEval ? (
                          qaPass ? (
                            <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600 mx-auto" />
                          )
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="text-center py-4 px-4">
                        {analystEval && qaEval ? (
                          match ? (
                            <Badge className="bg-green-100 text-green-800">Match</Badge>
                          ) : (
                            <Badge variant="destructive">Mismatch</Badge>
                          )
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Notes Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-700 text-lg">Analyst Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {analystEval?.notes ? (
              <p className="text-gray-700 whitespace-pre-wrap">{analystEval.notes}</p>
            ) : (
              <p className="text-gray-400 italic">No notes provided</p>
            )}
            {analystEval?.completedAt && (
              <p className="text-xs text-gray-500 mt-4">
                Completed: {new Date(analystEval.completedAt).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-purple-700 text-lg">QA Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {qaEval?.notes ? (
              <p className="text-gray-700 whitespace-pre-wrap">{qaEval.notes}</p>
            ) : (
              <p className="text-gray-400 italic">No notes provided</p>
            )}
            {qaEval?.completedAt && (
              <p className="text-xs text-gray-500 mt-4">
                Completed: {new Date(qaEval.completedAt).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

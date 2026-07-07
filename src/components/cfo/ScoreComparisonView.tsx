import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { api } from '../../utils/api';
import { CheckCircle, XCircle, AlertCircle, TrendingUp, ArrowLeft } from 'lucide-react';

interface Evaluation {
  score: number;
  criteriaEvaluations: Record<string, boolean>;
  notes?: string;
  evaluatorId: string;
  completedAt?: string;
}

interface ScoreComparisonViewProps {
  applicationId: string;
  onBack?: () => void;
}

export function ScoreComparisonView({ applicationId, onBack }: ScoreComparisonViewProps) {
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
      setCriteria(
        criteriaList
          .filter((c: { enabled?: boolean }) => c.enabled !== false)
          .sort((a: { order?: number }, b: { order?: number }) => (a.order ?? 0) - (b.order ?? 0))
      );
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
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl">
      {onBack && (
        <Button variant="outline" onClick={onBack} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Queue
        </Button>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 sm:p-8">
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
          <CardContent className="p-6 sm:p-8">
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
          <CardContent className="p-6 sm:p-8">
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
      <Card className="shadow-sm">
        <CardHeader className="px-6 py-5 bg-gray-50/80 border-b">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-[#023F40] text-lg">Criteria-by-Criteria Comparison</CardTitle>
            {discrepancyCount > 0 && (
              <Badge variant="destructive" className="text-sm px-3 py-1">
                {discrepancyCount} {discrepancyCount === 1 ? 'Discrepancy' : 'Discrepancies'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 min-w-[280px]">Criterion</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700 w-36">Analyst</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700 w-36">QA</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700 w-32">Match</th>
                </tr>
              </thead>
              <tbody>
                {criteria.map((criterion, index) => {
                  const analystPass = analystEval?.criteriaEvaluations?.[criterion.id] ?? false;
                  const qaPass = qaEval?.criteriaEvaluations?.[criterion.id] ?? false;
                  const match = analystEval && qaEval ? analystPass === qaPass : true;
                  const criterionLabel = criterion.text || criterion.name || `Criterion ${index + 1}`;

                  return (
                    <tr
                      key={criterion.id}
                      className={`border-b border-gray-100 transition-colors ${
                        !match
                          ? 'bg-red-50/80 hover:bg-red-50'
                          : index % 2 === 0
                          ? 'bg-white hover:bg-gray-50'
                          : 'bg-gray-50/40 hover:bg-gray-50'
                      }`}
                    >
                      <td className="py-5 px-6">
                        <div
                          className={`rounded-lg border-l-4 pl-4 pr-3 py-3 ${
                            !match
                              ? 'border-red-500 bg-red-50'
                              : 'border-[#6DB27F] bg-[#6DB27F]/5'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#023F40] text-white text-xs font-bold flex items-center justify-center">
                              {index + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 leading-snug">{criterionLabel}</p>
                              {criterion.category && (
                                <Badge variant="outline" className="mt-2 text-xs bg-white">
                                  {criterion.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-5 px-6">
                        {analystEval ? (
                          analystPass ? (
                            <CheckCircle className="w-7 h-7 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-7 h-7 text-red-600 mx-auto" />
                          )
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="text-center py-5 px-6">
                        {qaEval ? (
                          qaPass ? (
                            <CheckCircle className="w-7 h-7 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-7 h-7 text-red-600 mx-auto" />
                          )
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="text-center py-5 px-6">
                        {analystEval && qaEval ? (
                          match ? (
                            <Badge className="bg-green-100 text-green-800 px-3 py-1">Match</Badge>
                          ) : (
                            <Badge variant="destructive" className="px-3 py-1">Mismatch</Badge>
                          )
                        ) : (
                          <span className="text-gray-400">—</span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
        <Card>
          <CardHeader className="px-6 py-5 border-b bg-blue-50/50">
            <CardTitle className="text-blue-700 text-lg">Analyst Notes</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
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
          <CardHeader className="px-6 py-5 border-b bg-purple-50/50">
            <CardTitle className="text-purple-700 text-lg">QA Notes</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
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

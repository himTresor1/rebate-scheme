import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Plus, Trash2, GripVertical, Edit2, Save, X, Eye } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { TableSkeleton } from '../ui/skeletons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';

interface Criterion {
  id: string;
  text: string;
  enabled: boolean;
  order: number;
  approvalLevel?: 'ANALYST' | 'MANAGER' | 'PROGRAM_MANAGER' | 'ALL';
  weight?: number;
  category?: string;
}

export function CriteriaManager() {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCriterionText, setNewCriterionText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [draggedItem, setDraggedItem] = useState<Criterion | null>(null);

  useEffect(() => {
    loadCriteria();
  }, []);

  const loadCriteria = async () => {
    try {
      const data = await api.getCriteria();
      setCriteria(data);
    } catch (error: any) {
      toast.error('Failed to load criteria');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newCriterionText.trim()) {
      toast.error('Please enter criterion text');
      return;
    }

    try {
      const newCriterion = await api.addCriterion(newCriterionText);
      setCriteria([...criteria, newCriterion]);
      setNewCriterionText('');
      toast.success('Criterion added');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add criterion');
      console.error(error);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Criterion>) => {
    try {
      const criterionId = id.replace('criteria:', '');
      const updated = await api.updateCriterion(criterionId, updates);
      setCriteria(criteria.map(c => c.id === id ? updated : c));
      toast.success('Criterion updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update criterion');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this criterion?')) {
      return;
    }

    try {
      const criterionId = id.replace('criteria:', '');
      await api.deleteCriterion(criterionId);
      setCriteria(criteria.filter(c => c.id !== id));
      toast.success('Criterion deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete criterion');
      console.error(error);
    }
  };

  const startEdit = (criterion: Criterion) => {
    setEditingId(criterion.id);
    setEditText(criterion.text);
  };

  const saveEdit = async (id: string) => {
    if (!editText.trim()) {
      toast.error('Criterion text cannot be empty');
      return;
    }

    await handleUpdate(id, { text: editText });
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleDragStart = (criterion: Criterion) => {
    setDraggedItem(criterion);
  };

  const handleDragOver = (e: React.DragEvent, targetCriterion: Criterion) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.id === targetCriterion.id) return;

    const draggedIndex = criteria.findIndex(c => c.id === draggedItem.id);
    const targetIndex = criteria.findIndex(c => c.id === targetCriterion.id);

    const newCriteria = [...criteria];
    newCriteria.splice(draggedIndex, 1);
    newCriteria.splice(targetIndex, 0, draggedItem);

    setCriteria(newCriteria);
  };

  const handleDragEnd = async () => {
    if (!draggedItem) return;

    try {
      const criteriaIds = criteria.map(c => c.id);
      await api.reorderCriteria(criteriaIds);
      toast.success('Criteria reordered');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reorder criteria');
      console.error(error);
      loadCriteria(); // Reload to get correct order
    }

    setDraggedItem(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Eligibility Criteria Configuration</CardTitle>
            <CardDescription>
              Manage the criteria used to evaluate rebate applications. Drag to reorder by importance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={6} columns={1} showHeader={false} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Eligibility Criteria Configuration</CardTitle>
          <CardDescription>
            Manage the criteria used to evaluate rebate applications. Drag to reorder by importance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new criterion */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter new eligibility criterion..."
              value={newCriterionText}
              onChange={(e) => setNewCriterionText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          {/* Preview button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview Analyst View
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[70vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Analyst View Preview</DialogTitle>
                <DialogDescription>
                  This is how the criteria will appear to rebate analysts
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                {criteria.filter(c => c.enabled).map((criterion, index) => (
                  <div key={criterion.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <span className="text-gray-500">{index + 1}.</span>
                    <p className="flex-1">{criterion.text}</p>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Criteria list */}
          <div className="space-y-2">
            {criteria.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No criteria yet. Add your first criterion above.
              </p>
            ) : (
              criteria.map((criterion, index) => (
                <div
                  key={criterion.id}
                  draggable
                  onDragStart={() => handleDragStart(criterion)}
                  onDragOver={(e) => handleDragOver(e, criterion)}
                  onDragEnd={handleDragEnd}
                  className="relative flex flex-col gap-3 p-4 border rounded-lg bg-white hover:shadow-md transition-shadow cursor-move"
                >
                  {/* Top row: Drag handle, number, and status badge */}
                  <div className="flex items-start gap-3">
                    <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-500 min-w-[2rem] flex-shrink-0">{index + 1}.</span>
                    
                    {/* Status badge in top right corner */}
                    <div className="ml-auto flex-shrink-0">
                      {criterion.enabled ? (
                        <Badge variant="default">Enabled</Badge>
                      ) : (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                    </div>
                  </div>

                  {/* Criterion text */}
                  <div className="pl-11">
                    {editingId === criterion.id ? (
                      <Input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full"
                        autoFocus
                      />
                    ) : (
                      <p className="text-gray-900">{criterion.text}</p>
                    )}
                  </div>

                  {/* Approval Level Assignment */}
                  <div className="pl-11 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-gray-600">Review Level</Label>
                      <Select
                        value={criterion.approvalLevel || 'ALL'}
                        onValueChange={(value) => handleUpdate(criterion.id, { approvalLevel: value as any })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All Reviewers</SelectItem>
                          <SelectItem value="ANALYST">Analyst Only</SelectItem>
                          <SelectItem value="MANAGER">Manager Only</SelectItem>
                          <SelectItem value="PROGRAM_MANAGER">Program Manager Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Action buttons at bottom */}
                  <div className="flex items-center justify-end gap-2 pl-11 pt-2 border-t">
                    <Switch
                      checked={criterion.enabled}
                      onCheckedChange={(enabled) => handleUpdate(criterion.id, { enabled })}
                    />

                    {editingId === criterion.id ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => saveEdit(criterion.id)}
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEdit}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(criterion)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(criterion.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
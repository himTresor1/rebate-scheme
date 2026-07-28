import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Search, Filter, Edit2, Trash2, Play, Pause, GitBranch } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../ui/utils';
import { Workflow } from '../../types/workflow';
import { WorkflowEditor } from './WorkflowEditor';
import { User } from '../../utils/auth';
import { formatDisplayDate } from '../../utils/dateFormat';

interface WorkflowManagerProps {
  user: User;
}

const INITIAL_WORKFLOWS: Workflow[] = [
  {
    id: 'wf-1',
    name: 'Standard Application Review',
    description: 'General workflow for all standard rebate applications.',
    programName: 'Standard Application Review',
    effectiveFrom: '2024-01-01',
    status: 'active',
    stages: [
      { id: 's1', name: 'Analyst Review', type: 'Analyst', slaHours: 24, isMandatory: true, allowedRoles: ['Analyst'], description: 'Initial review of documents' },
      { id: 's2', name: 'QA Verification', type: 'QA Officer', slaHours: 24, isMandatory: true, allowedRoles: ['QA Officer'], description: 'Quality assurance check' }
    ],
    rules: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'wf-2',
    name: 'High Value Escalation',
    description: 'Workflow for applications exceeding threshold amounts.',
    programName: 'E-Moto Subsidy Scheme',
    effectiveFrom: '2024-02-15',
    status: 'active',
    stages: [
      { id: 's1', name: 'Initial Check', type: 'Analyst', slaHours: 12, isMandatory: true, allowedRoles: ['Analyst'] },
      { id: 's2', name: 'Manager Approval', type: 'Manager', slaHours: 48, isMandatory: true, allowedRoles: ['Manager', 'Administrator'] }
    ],
    rules: [
      { id: 'r1', name: 'Amount Threshold', field: 'Amount', operator: 'Greater Than', value: '1000', action: 'Escalate' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function WorkflowManager({ }: WorkflowManagerProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>(INITIAL_WORKFLOWS);
  const [isEditing, setIsEditing] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreate = () => {
    setEditingWorkflow(undefined);
    setIsEditing(true);
  };

  const handleEdit = (workflow: Workflow) => {
    setEditingWorkflow(workflow);
    setIsEditing(true);
  };

  const handleSave = (workflow: Workflow) => {
    if (editingWorkflow) {
      setWorkflows(workflows.map(w => w.id === workflow.id ? workflow : w));
    } else {
      setWorkflows([...workflows, { ...workflow, id: Math.random().toString(36).substr(2, 9) }]);
    }
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      setWorkflows(workflows.filter(w => w.id !== id));
    }
  };

  const toggleStatus = (id: string) => {
    setWorkflows(workflows.map(w => {
      if (w.id === id) {
        return { ...w, status: w.status === 'active' ? 'inactive' : 'active' };
      }
      return w;
    }));
  };

  const filteredWorkflows = workflows.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.programName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isEditing) {
    return (
      <WorkflowEditor 
        workflow={editingWorkflow}
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header matching InternalUserManagement */}
      <div className="mt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-[#023F40]">Workflow Management</h2>
            <p className="text-gray-600 mt-1">
              Design and manage multi-stage approval processes for program applications.
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-[#023F40] hover:bg-[#035f60] w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredWorkflows.length > 0 ? (
            filteredWorkflows.map((workflow) => (
              <motion.div
                key={workflow.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0 h-10 w-10 bg-[#023F40]/10 rounded-lg flex items-center justify-center">
                        <GitBranch className="w-5 h-5 text-[#023F40]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
                          <div className={cn(
                            "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                            workflow.status === 'active'
                              ? "bg-green-50 text-green-700 border-green-100"
                              : "bg-amber-50 text-amber-700 border-amber-100"
                          )}>
                            {workflow.status}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                            <span className="text-xs font-semibold">{workflow.programName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                            <span className="text-xs font-medium">{workflow.stages.length} Configured Stages</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <span className="text-xs italic">Effective: {formatDisplayDate(workflow.effectiveFrom)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(workflow)}
                        className="w-full sm:w-auto h-9"
                      >
                        <Edit2 className="w-3 h-3 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleStatus(workflow.id)}
                        className={cn(
                          "h-9 w-full sm:w-auto",
                          workflow.status === 'active' ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"
                        )}
                      >
                        {workflow.status === 'active' ? <Pause className="w-3 h-3 mr-2" /> : <Play className="w-3 h-3 mr-2" />}
                        {workflow.status === 'active' ? 'Pause' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(workflow.id)}
                        className="h-9 w-9 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 sm:block hidden"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white rounded-lg border p-12 text-center">
              <GitBranch className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No workflows found matching your search</p>
              <Button
                variant="outline"
                onClick={() => setSearchTerm('')}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

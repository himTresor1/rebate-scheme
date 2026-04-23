import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { 
  Loader2, 
  Plus, 
  Calendar as CalendarIcon,
  ChevronRight,
  Check,
  GitBranch,
  Settings,
  ListChecks
} from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '../ui/utils';
import { Workflow, WorkflowStage, WorkflowRule, StageType } from '../../types/workflow';
import { StageCard } from './StageCard';
import { RuleCard } from './RuleCard';
import { toast } from 'sonner';

interface WorkflowEditorProps {
  onSave: (workflow: Workflow) => void;
  onCancel: () => void;
  workflow?: Workflow;
}

const ROLES = [
  'Administrator',
  'Analyst',
  'QA Officer',
  'Finance Initiator',
  'Finance Approver',
  'Manager',
  'Auditor'
];

const STAGE_TYPES: StageType[] = [
  'Analyst',
  'QA Officer',
  'Finance Approver',
  'Manager',
  'Auditor'
];

const PROGRAM_OPTIONS = [
  'Standard Application Review',
  'Emergency Rebate Program',
  'Sustainable Energy Initiative',
  'E-Moto Subsidy Scheme'
];

const STEPS = [
  { id: 1, title: 'Workflow Identity', icon: Settings },
  { id: 2, title: 'Workflow Stages', icon: ListChecks },
  { id: 3, title: 'Routing Rules', icon: GitBranch }
];

export function WorkflowEditor({ onSave, onCancel, workflow }: WorkflowEditorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State
  const [formData, setFormData] = useState<Partial<Workflow>>({
    name: '',
    description: '',
    programName: '',
    effectiveFrom: format(new Date(), 'yyyy-MM-dd'),
    effectiveTo: '',
    stages: [],
    rules: [],
    status: 'active'
  });

  useEffect(() => {
    if (workflow) {
      setFormData(workflow);
    }
    window.scrollTo(0, 0);
  }, [workflow]);

  const validateDetails = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = 'Workflow name is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (!formData.programName) newErrors.programName = 'Program name is required';
    if (!formData.effectiveFrom) newErrors.effectiveFrom = 'Effective From is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStages = () => {
    if (!formData.stages || formData.stages.length === 0) {
      toast.error('At least one stage is required');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateDetails()) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStages()) setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    onSave(formData as Workflow);
    setIsSubmitting(false);
    toast.success(workflow ? 'Workflow updated successfully' : 'Workflow created successfully');
  };

  const addStage = () => {
    const newStage: WorkflowStage = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      type: 'Analyst',
      slaHours: 24,
      isMandatory: true,
      allowedRoles: [],
      description: ''
    };
    setFormData({ ...formData, stages: [...(formData.stages || []), newStage] });
  };

  const updateStage = (id: string, updates: Partial<WorkflowStage>) => {
    setFormData({
      ...formData,
      stages: formData.stages?.map(s => s.id === id ? { ...s, ...updates } : s)
    });
  };

  const removeStage = (id: string) => {
    setFormData({
      ...formData,
      stages: formData.stages?.filter(s => s.id !== id)
    });
  };

  const addRule = () => {
    const newRule: WorkflowRule = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      field: '',
      operator: '',
      value: '',
      action: ''
    };
    setFormData({ ...formData, rules: [...(formData.rules || []), newRule] });
  };

  const updateRule = (id: string, updates: Partial<WorkflowRule>) => {
    setFormData({
      ...formData,
      rules: formData.rules?.map(r => r.id === id ? { ...r, ...updates } : r)
    });
  };

  const removeRule = (id: string) => {
    setFormData({
      ...formData,
      rules: formData.rules?.filter(r => r.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Pattern matching SubmitApplicationForm */}
      <div className="mt-6">
        <h2 className="text-lg sm:text-xl text-[#023F40]">
          {workflow ? 'Edit Workflow' : 'Create New Workflow'}
        </h2>
        <p className="text-gray-600 mt-1">
          Complete all steps to configure the sequence and rules for this review process.
        </p>
      </div>

      {/* Progress Steps Pattern matching SubmitApplicationForm */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      isCompleted
                        ? "bg-green-600 text-white"
                        : isActive
                        ? "bg-[#023F40] text-white"
                        : "bg-gray-200 text-gray-500"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs mt-2 text-center",
                      isActive ? "text-[#023F40] font-medium" : "text-gray-600"
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-2",
                      isCompleted ? "bg-green-600" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Card Pattern matching SubmitApplicationForm */}
      <div className="bg-white rounded-lg shadow p-6">
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Step 1: Workflow Identity</h3>
            <p className="text-sm text-gray-600">
              Define the basic details and association for this workflow.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Workflow Name *</label>
                <Input 
                  placeholder="e.g. Standard Application Review"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={cn(errors.name && "border-red-500")}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program Association *</label>
                <Select 
                  value={formData.programName} 
                  onValueChange={(val: string) => setFormData({ ...formData, programName: val })}
                >
                  <SelectTrigger className={cn(errors.programName && "border-red-500")}>
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAM_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.programName && <p className="text-xs text-red-500 mt-1">{errors.programName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Workflow Description *</label>
              <Textarea 
                placeholder="Describe the purpose and scope of this workflow..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={cn("min-h-[100px]", errors.description && "border-red-500")}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Effective From *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left h-10 font-normal",
                        !formData.effectiveFrom && "text-muted-foreground",
                        errors.effectiveFrom && "border-red-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.effectiveFrom ? format(new Date(formData.effectiveFrom), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.effectiveFrom ? new Date(formData.effectiveFrom) : undefined}
                      onSelect={(date: Date | undefined) => setFormData({ ...formData, effectiveFrom: date ? format(date, 'yyyy-MM-dd') : '' })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Effective To (Optional)</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left h-10 font-normal",
                        !formData.effectiveTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.effectiveTo ? format(new Date(formData.effectiveTo), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.effectiveTo ? new Date(formData.effectiveTo) : undefined}
                      onSelect={(date: Date | undefined) => setFormData({ ...formData, effectiveTo: date ? format(date, 'yyyy-MM-dd') : '' })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-medium text-gray-900">Step 2: Workflow Stages</h3>
                <p className="text-sm text-gray-600">Define the review steps in sequential order.</p>
              </div>
              <Button 
                onClick={addStage}
                className="bg-[#023F40] hover:bg-[#035f60]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Stage
              </Button>
            </div>

            <div className="space-y-4 mt-6">
              {formData.stages && formData.stages.length > 0 ? (
                formData.stages.map((stage, index) => (
                  <StageCard 
                    key={stage.id}
                    index={index}
                    stage={stage}
                    roles={ROLES}
                    stageTypes={STAGE_TYPES}
                    onUpdate={(updates: Partial<WorkflowStage>) => updateStage(stage.id, updates)}
                    onRemove={() => removeStage(stage.id)}
                  />
                ))
              ) : (
                <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-gray-500 mb-4">No stages added yet</p>
                  <Button variant="outline" onClick={addStage}>Add First Stage</Button>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-medium text-gray-900">Step 3: Routing Rules</h3>
                <p className="text-sm text-gray-600">Define conditional paths for applications.</p>
              </div>
              <Button 
                onClick={addRule}
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Rule
              </Button>
            </div>

            <div className="space-y-4 mt-6">
              {formData.rules && formData.rules.length > 0 ? (
                formData.rules.map((rule) => (
                  <RuleCard 
                    key={rule.id}
                    rule={rule}
                    onUpdate={(updates: Partial<WorkflowRule>) => updateRule(rule.id, updates)}
                    onRemove={() => removeRule(rule.id)}
                  />
                ))
              ) : (
                <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-gray-500 mb-4">No routing rules (Optional)</p>
                  <Button variant="outline" onClick={addRule}>Add Rule</Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons Pattern matching SubmitApplicationForm */}
        <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              Back
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <div className="flex-1" />
          {currentStep < 3 ? (
            <Button 
              className="bg-[#023F40] hover:bg-[#035f60]"
              onClick={handleNext}
            >
              Continue
            </Button>
          ) : (
            <Button 
              className="bg-[#023F40] hover:bg-[#035f60]"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {workflow ? 'Update Workflow' : 'Save Workflow'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

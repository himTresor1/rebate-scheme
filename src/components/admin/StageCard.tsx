import { 
  GripVertical, 
  Trash2, 
  Clock, 
  Shield, 
  Layout,
  Info,
  Check
} from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '../ui/utils';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { WorkflowStage, StageType } from '../../types/workflow';
import { motion } from 'motion/react';
import { Textarea } from '../ui/textarea';

interface StageCardProps {
  index: number;
  stage: WorkflowStage;
  roles: string[];
  stageTypes: StageType[];
  onUpdate: (updates: Partial<WorkflowStage>) => void;
  onRemove: () => void;
}

export function StageCard({ index, stage, roles, stageTypes, onUpdate, onRemove }: StageCardProps) {
  const toggleRole = (role: string) => {
    const currentRoles = stage.allowedRoles || [];
    if (currentRoles.includes(role)) {
      onUpdate({ allowedRoles: currentRoles.filter(r => r !== role) });
    } else {
      onUpdate({ allowedRoles: [...currentRoles, role] });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
    >
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="cursor-grab text-gray-400 hover:text-gray-600 transition-colors">
            <GripVertical className="w-5 h-5" />
          </div>
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#023F40] text-white text-[10px] font-bold">
            {index + 1}
          </span>
          <h4 className="font-semibold text-gray-900">{stage.name || `Stage ${index + 1}`}</h4>
        </div>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-600 transition-colors"
          title="Remove Stage"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Layout className="w-3 h-3" /> Stage Name *
            </Label>
            <Input
              placeholder="e.g. Analyst Review"
              value={stage.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Stage Type *
            </Label>
            <Select
              value={stage.type}
              onValueChange={(val: StageType) => onUpdate({ type: val })}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {stageTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Clock className="w-3 h-3" /> SLA (Hours) *
            </Label>
            <Input
              type="number"
              min={1}
              value={stage.slaHours}
              onChange={(e) => onUpdate({ slaHours: parseInt(e.target.value) || 1 })}
              className="h-10"
            />
          </div>

          <div className="flex items-center space-x-2 md:pt-6">
            <Checkbox
              id={`mandatory-${stage.id}`}
              checked={stage.isMandatory}
              onCheckedChange={(checked: boolean) => onUpdate({ isMandatory: !!checked })}
            />
            <Label htmlFor={`mandatory-${stage.id}`} className="text-sm font-medium cursor-pointer">
              Mandatory Stage
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Allowed Roles * (Select at least one)
          </Label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 border rounded-md p-3 bg-gray-50">
            {roles.map(role => (
              <div key={role} className="flex items-center space-x-2">
                <Checkbox
                  id={`role-${role}-${stage.id}`}
                  checked={stage.allowedRoles.includes(role)}
                  onCheckedChange={() => toggleRole(role)}
                />
                <Label
                  htmlFor={`role-${role}-${stage.id}`}
                  className="text-xs text-gray-600 cursor-pointer"
                >
                  {role}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <Info className="w-3 h-3" /> Review Instructions
          </Label>
          <Textarea
            placeholder="Provide guidance for users performing this stage..."
            value={stage.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="text-sm min-h-[80px]"
          />
        </div>
      </div>
    </motion.div>
  );
}

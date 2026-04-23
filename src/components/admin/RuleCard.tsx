import { Trash2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { WorkflowRule } from '../../types/workflow';
import { motion } from 'motion/react';

interface RuleCardProps {
  rule: WorkflowRule;
  onUpdate: (updates: Partial<WorkflowRule>) => void;
  onRemove: () => void;
}

const FIELDS = ['Amount', 'Vehicle Type', 'Document Status', 'Applicant Category'];
const OPERATORS = ['Greater Than', 'Less Than', 'Equals', 'Not Equals', 'Contains'];
const ACTIONS = ['Escalate', 'Skip Next Stage', 'Send to Manager', 'Require Audit'];

export function RuleCard({ rule, onUpdate, onRemove }: RuleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative pr-12 group hover:border-gray-300 transition-colors"
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-1 space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Rule Name</Label>
          <Input
            placeholder="e.g. High Amount"
            value={rule.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="h-10 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Field</Label>
          <Select
            value={rule.field}
            onValueChange={(val: string) => onUpdate({ field: val })}
          >
            <SelectTrigger className="h-10 text-sm">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {FIELDS.map(f => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Operator</Label>
          <Select
            value={rule.operator}
            onValueChange={(val: string) => onUpdate({ operator: val })}
          >
            <SelectTrigger className="h-10 text-sm">
              <SelectValue placeholder="Select op" />
            </SelectTrigger>
            <SelectContent>
              {OPERATORS.map(o => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Value</Label>
          <Input
            placeholder="e.g. 100"
            value={rule.value}
            onChange={(e) => onUpdate({ value: e.target.value })}
            className="h-10 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Action</Label>
          <Select
            value={rule.action}
            onValueChange={(val: string) => onUpdate({ action: val })}
          >
            <SelectTrigger className="h-10 text-sm font-semibold text-[#023F40]">
              <SelectValue placeholder="Select action" />
            </SelectTrigger>
            <SelectContent>
              {ACTIONS.map(a => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <button
        onClick={onRemove}
        className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-300 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
        title="Delete Rule"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

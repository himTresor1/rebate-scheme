import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

type PermissionLevel = 'rgf-submit' | 'internal-proposal';

interface PermissionUser {
  id: string;
  name: string;
  email: string;
  level: PermissionLevel;
}

const INITIAL: PermissionUser[] = [
  { id: '1', name: 'Grace Mukandori', email: 'admin@bankofkigali.rw', level: 'rgf-submit' },
  { id: '2', name: 'Kevin Agent', email: 'agent1@bankofkigali.rw', level: 'internal-proposal' },
];

export function AfPermissionsView() {
  const [users, setUsers] = useState<PermissionUser[]>(INITIAL);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [level, setLevel] = useState<PermissionLevel>('internal-proposal');

  const addUser = () => {
    if (!name.trim() || !email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    setUsers((prev) => [...prev, { id: String(Date.now()), name, email, level }]);
    setName('');
    setEmail('');
    toast.success('Permission entry added');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl text-[#023F40]">AF Submission Permissions</h2>
        <p className="text-sm text-gray-600 mt-1">
          Designate who can submit signed leases directly to RGF vs marketing/agents who submit internal proposals only.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Add permission</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Select value={level} onValueChange={(v) => setLevel(v as PermissionLevel)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="rgf-submit">Submit to RGF (decision maker)</SelectItem>
              <SelectItem value="internal-proposal">Internal proposal only</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-[#023F40] hover:bg-[#035f60]" onClick={addUser}>Add</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Current permissions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-2 border rounded-lg px-3 py-2 text-sm">
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-gray-600">{u.email}</p>
              </div>
              <Badge className={u.level === 'rgf-submit' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                {u.level === 'rgf-submit' ? 'RGF submit' : 'Internal proposal'}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

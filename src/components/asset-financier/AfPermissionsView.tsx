import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import {
  AfPermissionEntry,
  AfPermissionLevel,
  loadAfPermissions,
  saveAfPermissions,
} from '../../utils/afPermissions';

export function AfPermissionsView() {
  const [users, setUsers] = useState<AfPermissionEntry[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [level, setLevel] = useState<AfPermissionLevel>('internal-proposal');

  useEffect(() => {
    setUsers(loadAfPermissions());
  }, []);

  const persist = (next: AfPermissionEntry[]) => {
    setUsers(next);
    saveAfPermissions(next);
  };

  const addUser = () => {
    if (!name.trim() || !email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    const next = [...users, { id: String(Date.now()), name, email, level }];
    persist(next);
    setName('');
    setEmail('');
    toast.success('Permission entry saved (demo)');
  };

  const removeUser = (id: string) => {
    persist(users.filter((u) => u.id !== id));
    toast.success('Permission removed');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl text-[#023F40]">AF Submission Permissions</h2>
        <p className="text-sm text-gray-600 mt-1">
          Decision makers submit signed leases directly to RGF. Marketing agents and field Rebate Team members submit internal proposals to AF decision makers only.
        </p>
      </div>

      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="pt-6 text-sm text-amber-900">
          Permissions are stored locally for demo presentation. Marketing-only users see a reduced menu (Marketing Proposal + Rebate Status).
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Add permission</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Select value={level} onValueChange={(v) => setLevel(v as AfPermissionLevel)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="rgf-submit">Submit to RGF (decision maker)</SelectItem>
              <SelectItem value="internal-proposal">Internal proposal only (marketing/agent)</SelectItem>
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
              <div className="flex items-center gap-2">
                <Badge className={u.level === 'rgf-submit' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                  {u.level === 'rgf-submit' ? 'RGF submit' : 'Internal proposal'}
                </Badge>
                <Button variant="ghost" size="sm" className="text-red-600" onClick={() => removeUser(u.id)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

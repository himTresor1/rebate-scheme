import { Badge } from '../components/ui/badge';

export function getSlaBadge(daysSince: number, opened?: boolean) {
  if (opened === false) {
    return <Badge className="bg-gray-100 text-gray-800">Not opened</Badge>;
  }
  if (daysSince > 2) {
    return <Badge className="bg-red-100 text-red-800">Over 2 days since received</Badge>;
  }
  if (daysSince >= 1) {
    return <Badge className="bg-amber-100 text-amber-800">Review in process</Badge>;
  }
  return <Badge className="bg-blue-100 text-blue-800">New</Badge>;
}

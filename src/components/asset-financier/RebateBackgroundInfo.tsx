import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function RebateBackgroundInfo() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-lg sm:text-xl text-[#023F40]">E-Moto Rebate Background</h2>
        <p className="text-sm text-gray-600 mt-1">Reference information for AF staff and agents (RGF-editable content at launch).</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">What is an E-Moto Rebate?</CardTitle></CardHeader>
        <CardContent className="text-sm text-gray-700 space-y-2">
          <p>RGF pays a percentage of e-moto cost directly to the Asset Financier, reducing the amount owed on the lease or loan.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Rebate amounts</CardTitle></CardHeader>
        <CardContent className="text-sm text-gray-700 space-y-1">
          <p>New e-motos — Men: 18% of retail cost</p>
          <p>New e-motos — Women: 25% of retail cost</p>
          <p>Retrofits — Men: 20% of retrofit cost</p>
          <p>Retrofits — Women: 25% of retrofit cost</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Required documents</CardTitle></CardHeader>
        <CardContent className="text-sm text-gray-700 space-y-1">
          <p>Signed financing agreement with AF</p>
          <p>AF confirmation of financial need</p>
          <p>Notarized individual affidavit of financial need</p>
          <p>National ID and motorcycle license</p>
          <p>ICE engine disposal agreement (retrofit only)</p>
        </CardContent>
      </Card>
    </div>
  );
}

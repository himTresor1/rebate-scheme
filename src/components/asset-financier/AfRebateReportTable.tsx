import { AfRebateRecord, AF_STATUS_DISPLAY } from '../../utils/afRebateData';

function formatDate(dateString: string) {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function AfRebateReportTable({
  rows,
  onOpen,
  showStatus = false,
}: {
  rows: AfRebateRecord[];
  onOpen: (record: AfRebateRecord) => void;
  showStatus?: boolean;
}) {
  const totalRetail = rows.reduce((s, r) => s + r.retailCost, 0);
  const totalRebate = rows.reduce((s, r) => s + r.rebateAmount, 0);
  const totalColSpan = showStatus ? 13 : 12;

  return (
    <div className="overflow-x-auto">
      {rows.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-600">No rebates match the selected filters.</div>
      ) : (
        <table className="w-full min-w-[1600px] text-sm">
          <thead>
            <tr className="border-b text-left text-gray-600">
              <th className="pb-3 pr-3 pl-3 pt-3 font-medium">Ticket No.</th>
              <th className="pb-3 pr-3 font-medium">Originated by NAME (AF designated person)</th>
              <th className="pb-3 pr-3 font-medium">Date of Origination</th>
              <th className="pb-3 pr-3 font-medium">Applicant First Name(s)</th>
              <th className="pb-3 pr-3 font-medium">Applicant Last Name(s)</th>
              <th className="pb-3 pr-3 font-medium">National ID</th>
              <th className="pb-3 pr-3 font-medium">DOB</th>
              <th className="pb-3 pr-3 font-medium">Moto License</th>
              <th className="pb-3 pr-3 font-medium">Gender</th>
              <th className="pb-3 pr-3 font-medium">Vehicle Type</th>
              <th className="pb-3 pr-3 font-medium">E-Moto Provider</th>
              <th className="pb-3 pr-3 font-medium">Retrofit Assembler</th>
              <th className="pb-3 pr-3 font-medium">Retail Cost of E-Moto (RWF)</th>
              <th className="pb-3 pr-3 font-medium">Rebate Amount (RWF)</th>
              {showStatus ? <th className="pb-3 pr-3 font-medium">Status</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.ticketNumber} className="border-b hover:bg-gray-50">
                <td className="py-3 pr-3 pl-3">
                  <button
                    type="button"
                    className="font-semibold text-[#023F40] hover:underline print:text-black print:no-underline"
                    onClick={() => onOpen(r)}
                  >
                    {r.ticketNumber}
                  </button>
                </td>
                <td className="py-3 pr-3">{r.submittedBy}</td>
                <td className="py-3 pr-3">{formatDate(r.submittedAt)}</td>
                <td className="py-3 pr-3">{r.firstName || '—'}</td>
                <td className="py-3 pr-3">{r.lastName || '—'}</td>
                <td className="py-3 pr-3">{r.nationalId || '—'}</td>
                <td className="py-3 pr-3">{formatDate(r.dateOfBirth)}</td>
                <td className="py-3 pr-3">{r.motoLicense || '—'}</td>
                <td className="py-3 pr-3">{r.gender}</td>
                <td className="py-3 pr-3">{r.vehicleType}</td>
                <td className="py-3 pr-3">{r.supplier || '—'}</td>
                <td className="py-3 pr-3">{r.isRetrofit ? r.retrofitAssembler || '—' : '—'}</td>
                <td className="py-3 pr-3">{r.retailCost ? r.retailCost.toLocaleString() : '—'}</td>
                <td className="py-3 pr-3">{r.rebateAmount ? r.rebateAmount.toLocaleString() : '—'}</td>
                {showStatus ? (
                  <td className="py-3 pr-3 text-xs">{AF_STATUS_DISPLAY[r.status]}</td>
                ) : null}
              </tr>
            ))}
            <tr className="font-semibold bg-gray-50">
              <td colSpan={totalColSpan} className="py-3 pr-3 pl-3 text-right">
                Total amounts
              </td>
              <td className="py-3 pr-3">{totalRetail.toLocaleString()}</td>
              <td className="py-3 pr-3">{totalRebate.toLocaleString()}</td>
              {showStatus ? <td className="py-3 pr-3" /> : null}
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

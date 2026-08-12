import { AfRebateRecord, AF_STATUS_DISPLAY } from '../../utils/afRebateData';
import { formatDisplayDate } from '../../utils/dateFormat';
import { formatNumber } from '../../utils/numberFormat';
import { getRebatePercent } from '../../utils/rebateCalculation';

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
  const labelCols = showStatus ? 14 : 13;

  return (
    <div className="w-full overflow-x-auto">
      {rows.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-600">No rebates match the selected filters.</div>
      ) : (
        <table className="w-full min-w-[1700px] text-sm border-collapse">
          <thead>
            <tr className="border-b text-left text-gray-600">
              <th className="pb-3 pr-3 pl-3 font-medium whitespace-nowrap">Ticket No.</th>
              <th className="pb-3 pr-3 font-medium whitespace-nowrap">Originated by NAME (AF designated person)</th>
              <th className="pb-3 pr-3 font-medium whitespace-nowrap">Date of Origination</th>
              <th className="pb-3 pr-3 font-medium whitespace-nowrap">Applicant First Name(s)</th>
              <th className="pb-3 pr-3 font-medium whitespace-nowrap">Applicant Last Name(s)</th>
              <th className="pb-3 pr-3 font-medium whitespace-nowrap">National ID</th>
              <th className="pb-3 pr-3 font-medium whitespace-nowrap">DOB</th>
              <th className="pb-3 pr-3 font-medium whitespace-nowrap">Moto License</th>
              <th className="pb-3 pr-3 font-medium whitespace-nowrap">Gender</th>
              <th className="pb-3 pr-3 font-medium whitespace-nowrap">Vehicle Type</th>
              <th className="pb-3 pr-3 font-medium whitespace-nowrap">E-Moto Provider</th>
              <th className="pb-3 pr-3 font-medium whitespace-nowrap">Retrofit Assembler</th>
              <th className="pb-3 pr-3 font-medium whitespace-nowrap">Retail Cost of E-Moto (RWF)</th>
              <th className="pb-3 pr-3 font-medium whitespace-nowrap min-w-[9rem]">Rebate Amount (RWF)</th>
              <th className="pb-3 pr-3 font-medium whitespace-nowrap min-w-[9rem] text-[#023F40]">
                Rebate Percentage (%)
              </th>
              {showStatus ? <th className="pb-3 pr-3 font-medium whitespace-nowrap">Status</th> : null}
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
                <td className="py-3 pr-3">{formatDisplayDate(r.submittedAt)}</td>
                <td className="py-3 pr-3">{r.firstName || '—'}</td>
                <td className="py-3 pr-3">{r.lastName || '—'}</td>
                <td className="py-3 pr-3">{r.nationalId || '—'}</td>
                <td className="py-3 pr-3">{formatDisplayDate(r.dateOfBirth)}</td>
                <td className="py-3 pr-3">{r.motoLicense || '—'}</td>
                <td className="py-3 pr-3">{r.gender}</td>
                <td className="py-3 pr-3">{r.vehicleType}</td>
                <td className="py-3 pr-3">{r.supplier || '—'}</td>
                <td className="py-3 pr-3">{r.isRetrofit ? r.retrofitAssembler || '—' : '—'}</td>
                <td className="py-3 pr-3">{formatNumber(r.retailCost)}</td>
                <td className="py-3 pr-3 font-medium">{formatNumber(r.rebateAmount)}</td>
                <td className="py-3 pr-3 font-semibold text-[#023F40]">
                  {getRebatePercent({ isWoman: r.isWoman, isRetrofit: r.isRetrofit })}
                </td>
                {showStatus ? (
                  <td className="py-3 pr-3 text-xs">{AF_STATUS_DISPLAY[r.status]}</td>
                ) : null}
              </tr>
            ))}
            <tr className="font-semibold bg-gray-50">
              <td colSpan={labelCols} className="py-3 pr-3 pl-3 text-right">
                Total amounts
              </td>
              <td className="py-3 pr-3">{formatNumber(totalRetail)}</td>
              <td className="py-3 pr-3">{formatNumber(totalRebate)}</td>
              <td className="py-3 pr-3">—</td>
              {showStatus ? <td className="py-3 pr-3" /> : null}
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

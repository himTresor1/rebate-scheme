import {
  AnalystRebateRecord,
  ANALYST_STATUS_DISPLAY,
} from '../../utils/analystRebateData';
import { formatDisplayDate } from '../../utils/dateFormat';
import { formatNumber } from '../../utils/numberFormat';
import { formatRebateAmountWithPercent } from '../../utils/rebateCalculation';

export function AnalystRebateReportTable({
  rows,
  onOpen,
}: {
  rows: AnalystRebateRecord[];
  onOpen: (record: AnalystRebateRecord) => void;
}) {
  const totalRetail = rows.reduce((s, r) => s + r.retailCost, 0);
  const totalRebate = rows.reduce((s, r) => s + r.rebateAmount, 0);

  if (rows.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-gray-600">No rebates match the selected filters.</div>
    );
  }

  return (
    <table className="w-full min-w-[1100px] text-sm border-collapse">
      <thead>
        <tr className="border-b text-left text-gray-600">
          <th className="pb-3 pr-2 pl-1 font-medium whitespace-nowrap">Ticket No</th>
          <th className="pb-3 pr-2 font-medium whitespace-nowrap">Date</th>
          <th className="pb-3 pr-2 font-medium whitespace-nowrap">First Name</th>
          <th className="pb-3 pr-2 font-medium whitespace-nowrap">Last Name</th>
          <th className="pb-3 pr-2 font-medium whitespace-nowrap">National ID</th>
          <th className="pb-3 pr-2 font-medium whitespace-nowrap">DOB</th>
          <th className="pb-3 pr-2 font-medium whitespace-nowrap">License</th>
          <th className="pb-3 pr-2 font-medium whitespace-nowrap">Gender</th>
          <th className="pb-3 pr-2 font-medium whitespace-nowrap">Vehicle</th>
          <th className="pb-3 pr-2 font-medium whitespace-nowrap">E-Moto Provider</th>
          <th className="pb-3 pr-2 font-medium whitespace-nowrap">Assembler</th>
          <th className="pb-3 pr-2 font-medium whitespace-nowrap text-right">Retail (RWF)</th>
          <th className="pb-3 pr-2 font-medium whitespace-nowrap text-right">Rebate (RWF) / %</th>
          <th className="pb-3 pr-1 font-medium whitespace-nowrap">Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} className="border-b hover:bg-gray-50">
            <td className="py-2.5 pr-2 pl-1">
              <button
                type="button"
                className="font-semibold text-[#023F40] hover:underline print:text-black print:no-underline"
                onClick={() => onOpen(r)}
              >
                {r.ticketNumber}
              </button>
            </td>
            <td className="py-2.5 pr-2 whitespace-nowrap">{formatDisplayDate(r.originatedAt)}</td>
            <td className="py-2.5 pr-2">{r.firstName || '—'}</td>
            <td className="py-2.5 pr-2">{r.lastName || '—'}</td>
            <td className="py-2.5 pr-2 whitespace-nowrap">{r.nationalId || '—'}</td>
            <td className="py-2.5 pr-2 whitespace-nowrap">{formatDisplayDate(r.dateOfBirth)}</td>
            <td className="py-2.5 pr-2 whitespace-nowrap">{r.motoLicense || '—'}</td>
            <td className="py-2.5 pr-2">{r.gender}</td>
            <td className="py-2.5 pr-2 whitespace-nowrap">{r.vehicleType}</td>
            <td className="py-2.5 pr-2">{r.isRetrofit ? '—' : r.eMotoProvider || '—'}</td>
            <td className="py-2.5 pr-2">{r.isRetrofit ? r.retrofitAssembler || '—' : '—'}</td>
            <td className="py-2.5 pr-2 text-right whitespace-nowrap">{formatNumber(r.retailCost)}</td>
            <td className="py-2.5 pr-2 text-right whitespace-nowrap font-medium">
              {formatRebateAmountWithPercent(r.rebateAmount, {
                isWoman: r.isWoman,
                isRetrofit: r.isRetrofit,
              })}
            </td>
            <td className="py-2.5 pr-1 text-xs whitespace-nowrap">
              {ANALYST_STATUS_DISPLAY[r.verificationStatus]}
            </td>
          </tr>
        ))}
        <tr className="font-semibold bg-gray-50">
          <td className="py-2.5 pr-2 pl-1" colSpan={11}>
            Total amounts
          </td>
          <td className="py-2.5 pr-2 text-right whitespace-nowrap">{formatNumber(totalRetail)}</td>
          <td className="py-2.5 pr-2 text-right whitespace-nowrap">{formatNumber(totalRebate)}</td>
        </tr>
      </tbody>
    </table>
  );
}

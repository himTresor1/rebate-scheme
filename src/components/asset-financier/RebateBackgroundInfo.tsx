export function RebateBackgroundInfo() {
  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <h2 className="text-2xl sm:text-3xl font-semibold text-[#023F40]">E-Moto Rebate Background Information</h2>
        <p className="text-base text-gray-600 mt-3">
          Reference guide for Asset Financier teams and agents. Use this page to understand rebate purpose, rates, eligibility, required documents, and what happens after submitting an application.
        </p>
      </div>

      <section className="space-y-3">
        <h3 className="text-xl font-semibold text-gray-900">1. What is an E-Moto Rebate?</h3>
        <p className="text-base text-gray-700 leading-7">
          RGF will pay a percent of the price of the e-moto cost directly to the Asset Financier providing the e-moto.
          The rebate reduces the amount owed on the lease or loan.
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">2. How much is the e-moto rebate?</h3>
        <div className="space-y-2">
          <p className="text-base font-medium text-gray-900">New e-motos</p>
          <ul className="list-disc pl-6 text-base text-gray-700 space-y-1">
            <li>Men - 18% of the retail cost of the e-moto</li>
            <li>Women - 25% of the retail cost of the e-moto</li>
          </ul>
        </div>
        <div className="space-y-2">
          <p className="text-base font-medium text-gray-900">Retrofits</p>
          <ul className="list-disc pl-6 text-base text-gray-700 space-y-1">
            <li>Men - 20% of the retrofit cost of the ICE-moto to an e-moto</li>
            <li>Women - 25% of the retrofit cost of the ICE-moto to an e-moto</li>
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xl font-semibold text-gray-900">3. What is eligibility criteria?</h3>
        <ul className="list-disc pl-6 text-base text-gray-700 space-y-2 leading-7">
          <li>
            The rebates are available to individuals who need financial support to lease or buy a new e-moto from an authorized Asset Financier or e-moto company retrofitting ICE-motos to e-motos.
          </li>
          <li>The individual must have a signed financing agreement with an Asset Financier.</li>
          <li>
            The individual and the Asset Financier must attest to the individual&apos;s financial need and use of the e-moto for income generation.
          </li>
          <li>There is only one rebate per individual.</li>
          <li>Applicants cannot already own an e-moto.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-xl font-semibold text-gray-900">4. What documents are required for RGF to provide the e-moto rebate?</h3>
        <ul className="list-disc pl-6 text-base text-gray-700 space-y-2 leading-7">
          <li>Signed financing agreement with Asset Financier</li>
          <li>Asset Financier statement that the individual requires a rebate in order qualify for financing</li>
          <li>Notarized signed Affidavit by individual attesting to financial need and use of the e-moto for income generation</li>
          <li>National ID</li>
          <li>Motorcycle License issued by RNP</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-xl font-semibold text-gray-900">5. Retrofit my ICE-moto: What do I need to apply if I want to retrofit my ICE-moto to an e-moto?</h3>
        <p className="text-base text-gray-700 leading-7">
          You need to submit the above information and documents. In addition, the individual needs to sign a document stating
          that he/she agrees to give his/her ICE-moto engine to the retrofitting e-moto company for disposal.
        </p>
      </section>

      <section className="space-y-3 pb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          6. What happens after submitting the above information and documents rebate application to the Asset Financier?
        </h3>
        <p className="text-base text-gray-700 leading-7">
          The Asset Financier will review the submitted information and documents and decide if the individual qualifies for the rebate
          and AF financing or not. If the Asset Financier accepts the e-moto financing proposal and agrees that financial support is needed,
          the rebate amount will be deducted from the individual&apos;s payment for the e-moto.
        </p>
      </section>
    </div>
  );
}

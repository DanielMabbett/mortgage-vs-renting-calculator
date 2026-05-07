import React, { useState, useMemo } from 'react';
import { TrendingUp, Home, DollarSign, Percent } from 'lucide-react';

export default function MortgageCalculator() {
  // Main inputs
  const [currency, setCurrency] = useState('GBP');
  const [loanAmount, setLoanAmount] = useState(300000);
  const [interestRate, setInterestRate] = useState(5);
  const [loanYears, setLoanYears] = useState(25);
  const [monthlyRent, setMonthlyRent] = useState(1500);

  // Investment budget
  const [monthlyInvestment, setMonthlyInvestment] = useState(500);
  const [investmentReturn, setInvestmentReturn] = useState(8);

  // Additional costs
  const [propertyAppreciation, setPropertyAppreciation] = useState(3);
  const [maintenancePercent, setMaintenancePercent] = useState(1);

  const currencySymbol = currency === 'USD' ? '$' : '£';
  const currencyCode = currency;

  // Calculate monthly mortgage payment using amortization formula
  const calculateMortgagePayment = (principal, annualRate, years) => {
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = years * 12;
    
    if (monthlyRate === 0) return principal / numberOfPayments;
    
    const monthlyPayment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    return monthlyPayment;
  };

  const monthlyMortgage = calculateMortgagePayment(loanAmount, interestRate, loanYears);
  const monthlyMaintenance = (loanAmount * (maintenancePercent / 100)) / 12;
  const totalMonthlyMortgageCost = monthlyMortgage + monthlyMaintenance;

  // Generate year-by-year comparison
  const projections = useMemo(() => {
    const years = [];
    let remainingBalance = loanAmount;
    let rentCumulative = 0;
    let mortgageCumulative = 0;
    let maintenanceCumulative = 0;
    let propertyValue = loanAmount; // Starting property value
    let investmentBalance = 0;

    for (let year = 1; year <= loanYears; year++) {
      // Mortgage payments for the year
      let yearlyInterest = 0;
      let yearlyPrincipal = 0;

      for (let month = 0; month < 12; month++) {
        const monthlyRate = interestRate / 100 / 12;
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = monthlyMortgage - interestPayment;

        yearlyInterest += interestPayment;
        yearlyPrincipal += principalPayment;
        remainingBalance = Math.max(0, remainingBalance - principalPayment);
      }

      // Rent and maintenance
      const yearlyRent = monthlyRent * 12;
      const yearlyMaintenance = monthlyMaintenance * 12;
      
      rentCumulative += yearlyRent;
      mortgageCumulative += yearlyPrincipal;
      maintenanceCumulative += yearlyMaintenance;

      // Property appreciation
      propertyValue *= (1 + propertyAppreciation / 100);

      // Investment growth (for renting scenario)
      investmentBalance = investmentBalance * (1 + investmentReturn / 100) + monthlyInvestment * 12;

      // Equity in purchased home = property value - remaining balance
      const equity = propertyValue - remainingBalance;

      // For renting: liquid assets = rent savings invested + current investment
      const rentSavings = (totalMonthlyMortgageCost - monthlyRent) * 12; // Money saved vs buying
      const rentScenarioAssets = investmentBalance + (rentSavings > 0 ? rentSavings * year : 0);

      years.push({
        year,
        monthlyMortgage: Math.round(monthlyMortgage),
        propertyValue: Math.round(propertyValue),
        remainingBalance: Math.round(remainingBalance),
        equity: Math.round(equity),
        cumulativeRent: Math.round(rentCumulative),
        cumulativeMortgage: Math.round(mortgageCumulative),
        cumulativeMaintenance: Math.round(maintenanceCumulative),
        investmentBalance: Math.round(investmentBalance),
        totalNetWorthBuying: Math.round(equity + investmentBalance),
        totalNetWorthRenting: Math.round(investmentBalance + (Math.max(0, totalMonthlyMortgageCost - monthlyRent) * 12 * year)),
      });
    }

    return years;
  }, [loanAmount, interestRate, loanYears, monthlyRent, monthlyInvestment, investmentReturn, propertyAppreciation, maintenancePercent, totalMonthlyMortgageCost, monthlyMaintenance]);

  const finalYear = projections[projections.length - 1];

  const formatCurrency = (value) => {
    return `${currencySymbol}${Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  // Helper component for input fields with slider and text input
  const InputField = ({ label, description, value, onChange, min, max, step, currency: showCurrency, isPercent, accentColor }) => (
    <div>
      <label className="block text-sm font-semibold text-slate-300 mb-1">
        {label}
      </label>
      <p className="text-xs text-slate-400 mb-3">{description}</p>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer`}
        style={{
          accentColor: accentColor === 'blue' ? '#3b82f6' : accentColor === 'purple' ? '#a855f7' : '#10b981'
        }}
      />
      <div className="flex gap-2 mt-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
          min={min}
          max={max}
          step={step}
        />
        <span className="text-slate-400 py-1 min-w-fit">
          {showCurrency ? currencyCode : isPercent ? '%' : ''}
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Home className="w-8 h-8 text-blue-400" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
            Mortgage vs Renting
          </h1>
        </div>
        <p className="text-slate-300 text-lg">Calculate your financial future with detailed projections</p>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mortgage Inputs */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-blue-300 mb-6 flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                Mortgage Details
              </h2>
            </div>

            {/* Currency Toggle */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1">Currency</label>
              <p className="text-xs text-slate-400 mb-3">Choose your preferred currency for all values</p>
              <div className="flex gap-2">
                {['USD', 'GBP'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                      currency === c
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Loan Amount */}
            <InputField
              label={`Loan Amount: ${formatCurrency(loanAmount)}`}
              description="The total amount you're borrowing for the property purchase"
              value={loanAmount}
              onChange={setLoanAmount}
              min="50000"
              max="1000000"
              step="10000"
              currency={true}
              accentColor="blue"
            />

            {/* Interest Rate */}
            <InputField
              label={`Interest Rate: ${interestRate.toFixed(2)}%`}
              description="The annual mortgage interest rate (annual percentage rate)"
              value={interestRate}
              onChange={setInterestRate}
              min="1"
              max="10"
              step="0.1"
              isPercent={true}
              accentColor="blue"
            />

            {/* Loan Term */}
            <InputField
              label={`Loan Term: ${loanYears} years`}
              description="The total duration of your mortgage loan in years"
              value={loanYears}
              onChange={setLoanYears}
              min="5"
              max="40"
              step="1"
              accentColor="blue"
            />

            {/* Property Maintenance */}
            <InputField
              label={`Annual Maintenance: ${maintenancePercent.toFixed(1)}%`}
              description="Estimated annual home maintenance and repairs as a percentage of loan amount"
              value={maintenancePercent}
              onChange={setMaintenancePercent}
              min="0"
              max="3"
              step="0.1"
              isPercent={true}
              accentColor="blue"
            />
          </div>

          {/* Rent & Investment Inputs */}
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-purple-300 mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Renting & Investments
              </h2>
            </div>

            {/* Monthly Rent */}
            <InputField
              label={`Current Monthly Rent: ${formatCurrency(monthlyRent)}`}
              description="Your current monthly rental payment or equivalent housing cost"
              value={monthlyRent}
              onChange={setMonthlyRent}
              min="500"
              max="5000"
              step="50"
              currency={true}
              accentColor="purple"
            />

            {/* Monthly Investment */}
            <InputField
              label={`Monthly Investment: ${formatCurrency(monthlyInvestment)}`}
              description="The amount you invest monthly in stocks, bonds, or other assets"
              value={monthlyInvestment}
              onChange={setMonthlyInvestment}
              min="0"
              max="2000"
              step="50"
              currency={true}
              accentColor="purple"
            />

            {/* Investment Return */}
            <InputField
              label={`Annual Investment Return: ${investmentReturn.toFixed(1)}%`}
              description="Expected average annual return on your investments (e.g., 8% for stock market)"
              value={investmentReturn}
              onChange={setInvestmentReturn}
              min="1"
              max="15"
              step="0.5"
              isPercent={true}
              accentColor="purple"
            />

            {/* Property Appreciation */}
            <InputField
              label={`Property Appreciation: ${propertyAppreciation.toFixed(1)}%`}
              description="Expected annual growth rate of property value in your area"
              value={propertyAppreciation}
              onChange={setPropertyAppreciation}
              min="0"
              max="10"
              step="0.1"
              isPercent={true}
              accentColor="purple"
            />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="text-sm text-blue-300 font-semibold mb-2">Monthly Mortgage</div>
            <div className="text-2xl font-bold">{formatCurrency(totalMonthlyMortgageCost)}</div>
            <div className="text-xs text-slate-400 mt-1">(+ {formatCurrency(monthlyMaintenance)} maintenance)</div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <div className="text-sm text-purple-300 font-semibold mb-2">Monthly Rent</div>
            <div className="text-2xl font-bold">{formatCurrency(monthlyRent)}</div>
            <div className="text-xs text-slate-400 mt-1">Current housing cost</div>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
            <div className="text-sm text-cyan-300 font-semibold mb-2">Monthly Difference</div>
            <div className={`text-2xl font-bold ${totalMonthlyMortgageCost > monthlyRent ? 'text-red-400' : 'text-green-400'}`}>
              {formatCurrency(totalMonthlyMortgageCost - monthlyRent)}
            </div>
            <div className="text-xs text-slate-400 mt-1">{totalMonthlyMortgageCost > monthlyRent ? 'More to buy' : 'Save by buying'}</div>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <div className="text-sm text-green-300 font-semibold mb-2">Monthly Investment</div>
            <div className="text-2xl font-bold">{formatCurrency(monthlyInvestment)}</div>
            <div className="text-xs text-slate-400 mt-1">@ {investmentReturn.toFixed(1)}% annual</div>
          </div>
        </div>

        {/* Final Comparison */}
        {finalYear && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buying Path */}
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-500/30 rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-blue-300 mb-6">Buying Path (After {loanYears} years)</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-blue-200">Property Value</div>
                  <div className="text-3xl font-bold text-blue-100">{formatCurrency(finalYear.propertyValue)}</div>
                </div>
                <div>
                  <div className="text-sm text-blue-200">Remaining Mortgage Balance</div>
                  <div className="text-3xl font-bold text-red-400">{formatCurrency(finalYear.remainingBalance)}</div>
                </div>
                <div className="border-t border-blue-500/30 pt-4">
                  <div className="text-sm text-blue-200">Home Equity</div>
                  <div className="text-3xl font-bold text-green-400">{formatCurrency(finalYear.equity)}</div>
                </div>
                <div>
                  <div className="text-sm text-blue-200">Investment Portfolio</div>
                  <div className="text-2xl font-bold text-cyan-300">{formatCurrency(finalYear.investmentBalance)}</div>
                </div>
                <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mt-4">
                  <div className="text-sm text-blue-200">Total Net Worth</div>
                  <div className="text-3xl font-bold text-blue-100">{formatCurrency(finalYear.totalNetWorthBuying)}</div>
                </div>
              </div>
            </div>

            {/* Renting Path */}
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/30 rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-purple-300 mb-6">Renting Path (After {loanYears} years)</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-purple-200">Total Rent Paid</div>
                  <div className="text-3xl font-bold text-red-400">{formatCurrency(finalYear.cumulativeRent)}</div>
                </div>
                <div>
                  <div className="text-sm text-purple-200">Invested Monthly Amount</div>
                  <div className="text-3xl font-bold text-cyan-300">{formatCurrency(finalYear.investmentBalance)}</div>
                </div>
                <div className="border-t border-purple-500/30 pt-4">
                  <div className="text-sm text-purple-200">Monthly Savings vs Buying</div>
                  <div className="text-2xl font-bold text-yellow-300">
                    {formatCurrency(Math.max(0, totalMonthlyMortgageCost - monthlyRent) * 12 * loanYears)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-purple-200">Additional Invested (Savings)</div>
                  <div className="text-2xl font-bold text-purple-300">
                    {formatCurrency(Math.max(0, totalMonthlyMortgageCost - monthlyRent) * 12 * loanYears)}
                  </div>
                </div>
                <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-4 mt-4">
                  <div className="text-sm text-purple-200">Total Liquid Assets</div>
                  <div className="text-3xl font-bold text-purple-100">{formatCurrency(finalYear.investmentBalance + (Math.max(0, totalMonthlyMortgageCost - monthlyRent) * 12 * loanYears))}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Table */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <h3 className="text-xl font-bold text-slate-100">Year-by-Year Comparison</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-700/50 border-b border-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-200">Year</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-200">Property Value</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-200">Home Equity</th>
                  <th className="px-4 py-3 text-right font-semibold text-cyan-300">Investment Balance</th>
                  <th className="px-4 py-3 text-right font-semibold text-blue-300">Total (Buying)</th>
                  <th className="px-4 py-3 text-right font-semibold text-purple-300">Total (Renting)</th>
                </tr>
              </thead>
              <tbody>
                {projections.map((year, idx) => (
                  <tr
                    key={year.year}
                    className={`border-b border-slate-700/50 ${
                      idx % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-900/30'
                    } hover:bg-slate-700/20 transition`}
                  >
                    <td className="px-4 py-3 font-semibold text-slate-200">{year.year}</td>
                    <td className="px-4 py-3 text-right text-slate-300">{formatCurrency(year.propertyValue)}</td>
                    <td className="px-4 py-3 text-right text-green-400 font-semibold">{formatCurrency(year.equity)}</td>
                    <td className="px-4 py-3 text-right text-cyan-300">{formatCurrency(year.investmentBalance)}</td>
                    <td className="px-4 py-3 text-right text-blue-300 font-semibold">{formatCurrency(year.totalNetWorthBuying)}</td>
                    <td className="px-4 py-3 text-right text-purple-300">{formatCurrency(year.investmentBalance + (Math.max(0, totalMonthlyMortgageCost - monthlyRent) * 12 * year.year))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-4 text-xs text-slate-400">
          <p><strong>Disclaimer:</strong> This calculator is for informational purposes only and should not be considered financial advice. Actual costs, returns, and property values may vary significantly. Please consult with a financial advisor or mortgage professional for personalized guidance.</p>
        </div>
      </div>
    </div>
  );
}

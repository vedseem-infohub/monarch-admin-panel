'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Building2,
  FileSpreadsheet,
  X,
  ExternalLink,
} from 'lucide-react';
import { paymentService } from '@/services/paymentService';
import { PaymentTransaction } from '@/types';
import { useToast } from '@/components/ui/Toast';

export default function PaymentsPage() {
  const { addToast } = useToast();
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [gatewayFilter, setGatewayFilter] = useState<string>('All');
  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);
  const [refundConfirmTx, setRefundConfirmTx] = useState<PaymentTransaction | null>(null);

  useEffect(() => {
    setPayments(paymentService.getAll());
    paymentService.fetchPayments().then((data) => {
      if (data) setPayments(data);
    });
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchGateway = gatewayFilter === 'All' || p.paymentGateway === gatewayFilter;
      const matchSearch =
        p.transactionRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.method.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchGateway && matchSearch;
    });
  }, [payments, statusFilter, gatewayFilter, searchQuery]);

  const stats = useMemo(() => {
    const gross = payments.filter((p) => p.status === 'Settled' || p.status === 'Captured')
      .reduce((acc, p) => acc + p.amount, 0);
    const settled = payments.filter((p) => p.status === 'Settled')
      .reduce((acc, p) => acc + p.netSettlement, 0);
    const fees = payments.reduce((acc, p) => acc + (p.gatewayFee + p.tax), 0);
    const refunds = payments.filter((p) => p.status === 'Refunded')
      .reduce((acc, p) => acc + p.amount, 0);

    return { gross, settled, fees, refunds };
  }, [payments]);

  const handleProcessRefund = () => {
    if (!refundConfirmTx) return;
    try {
      const updated = paymentService.processRefund(refundConfirmTx.id);
      setPayments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      addToast(
        'Refund Dispatched',
        `₹ ${refundConfirmTx.amount.toLocaleString('en-IN')} returned to patron source account.`,
        'success'
      );
      setRefundConfirmTx(null);
    } catch {
      addToast('Error', 'Unable to initiate refund', 'error');
    }
  };

  const exportCSV = () => {
    const headers = ['Transaction Ref', 'Order Number', 'Customer', 'Gateway', 'Method', 'Gross (INR)', 'Fee + Tax', 'Net Settlement', 'Status', 'Timestamp'];
    const rows = filteredPayments.map((p) => [
      p.transactionRef,
      p.orderNumber,
      `"${p.customerName}"`,
      p.paymentGateway,
      p.method,
      p.amount,
      p.gatewayFee + p.tax,
      p.netSettlement,
      p.status,
      p.timestamp,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Monarch_Payments_Reconciliation_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Reconciliation CSV Exported', 'Downloaded payments ledger successfully.', 'info');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E8E3D9] pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-serif tracking-[0.2em] text-[#B39458] uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Monarch Treasury & Gateway Settlement</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#24221E] font-medium tracking-tight mt-1">
            Payments & Reconciliation
          </h1>
          <p className="text-sm text-[#77736C] font-sans mt-1">
            Multi-gateway transactions, Amex Centurion haute couture billing, RTGS wires, and instant refunds.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-[#FFFFFF] border border-[#E8E3D9] hover:bg-[#F7F5F0] text-[#24221E] text-xs font-medium rounded-sm flex items-center space-x-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-[#B39458]" />
          <span>Export Reconciliation CSV</span>
        </button>
      </div>

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#E8E3D9] p-5 rounded-sm shadow-xs">
          <span className="text-xs text-[#77736C] font-sans uppercase tracking-wider">
            Gross Volume Captured
          </span>
          <div className="text-2xl font-serif font-bold text-[#24221E] mt-1">
            ₹ {stats.gross.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#3E7B54] mt-1 flex items-center font-medium">
            100% authenticated couture orders
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E8E3D9] p-5 rounded-sm shadow-xs">
          <span className="text-xs text-[#77736C] font-sans uppercase tracking-wider">
            Net Settled to Bank
          </span>
          <div className="text-2xl font-serif font-bold text-[#B39458] mt-1">
            ₹ {stats.settled.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#77736C] mt-1 flex items-center font-medium">
            Post MDR & 18% GST deductions
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E8E3D9] p-5 rounded-sm shadow-xs">
          <span className="text-xs text-[#77736C] font-sans uppercase tracking-wider">
            Total Gateway Processing Fees
          </span>
          <div className="text-2xl font-serif font-bold text-[#24221E] mt-1">
            ₹ {stats.fees.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#77736C] mt-1 flex items-center font-medium">
            Blended MDR rate ~1.85%
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E8E3D9] p-5 rounded-sm shadow-xs">
          <span className="text-xs text-[#77736C] font-sans uppercase tracking-wider">
            Total Refunds Processed
          </span>
          <div className="text-2xl font-serif font-bold text-[#A63A3A] mt-1">
            ₹ {stats.refunds.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-[#A63A3A] mt-1 flex items-center font-medium">
            Alterations & returns
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#FFFFFF] border border-[#E8E3D9] rounded-sm p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-2 md:pb-0">
            {['All', 'Settled', 'Captured', 'Refunded', 'Failed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors whitespace-nowrap ${
                  statusFilter === tab
                    ? 'bg-[#24221E] text-[#FAF7F0]'
                    : 'text-[#77736C] hover:text-[#24221E] hover:bg-[#F7F5F0]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Gateway & Search */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#77736C]" />
              <input
                type="text"
                placeholder="Search ref, order, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm focus:outline-hidden focus:border-[#B39458] text-[#24221E]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-[#77736C]" />
              <select
                value={gatewayFilter}
                onChange={(e) => setGatewayFilter(e.target.value)}
                className="text-xs bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm px-2.5 py-1.5 text-[#24221E] focus:outline-hidden focus:border-[#B39458]"
              >
                <option value="All">All Gateways</option>
                <option value="Razorpay">Razorpay Suite</option>
                <option value="Amex Centurion Direct">Amex Centurion</option>
                <option value="Standard Chartered Wire">Standard Chartered Wire</option>
                <option value="HDFC NetBanking">HDFC NetBanking</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#FFFFFF] border border-[#E8E3D9] rounded-sm shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F7F5F0] border-b border-[#E8E3D9] text-[11px] font-semibold text-[#77736C] uppercase tracking-wider font-sans">
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Patron</th>
                <th className="py-3 px-4">Gateway & Method</th>
                <th className="py-3 px-4 text-right">Gross Amount</th>
                <th className="py-3 px-4 text-right">Gateway Fee</th>
                <th className="py-3 px-4 text-right">Net Settlement</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E3D9]/60 text-xs">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#77736C]">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-[#24221E]">
                      {p.transactionRef}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#B39458] font-semibold">
                      {p.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#24221E]">
                      {p.customerName}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#24221E]">{p.paymentGateway}</span>
                        <span className="text-[10px] text-[#77736C]">{p.method}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-serif font-bold text-[#24221E]">
                      ₹ {p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right text-[#77736C]">
                      ₹ {(p.gatewayFee + p.tax).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-serif font-bold text-[#3E7B54]">
                      {p.netSettlement < 0 ? (
                        <span className="text-[#A63A3A]">- ₹ {Math.abs(p.netSettlement).toLocaleString('en-IN')}</span>
                      ) : (
                        `₹ ${p.netSettlement.toLocaleString('en-IN')}`
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                          p.status === 'Settled'
                            ? 'bg-[#EBF5EF] text-[#3E7B54] border border-[#3E7B54]/20'
                            : p.status === 'Captured'
                            ? 'bg-[#E8F4F8] text-[#1E7085] border border-[#1E7085]/20'
                            : p.status === 'Refunded'
                            ? 'bg-[#F2EDFB] text-[#693E94] border border-[#693E94]/20'
                            : 'bg-[#FBEAE8] text-[#A63A3A] border border-[#A63A3A]/20'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedTx(p)}
                          className="px-2.5 py-1 text-[11px] bg-[#F7F5F0] hover:bg-[#ECE8DF] text-[#24221E] border border-[#E8E3D9] rounded-sm transition-colors"
                        >
                          Details
                        </button>
                        {p.status === 'Settled' && (
                          <button
                            onClick={() => setRefundConfirmTx(p)}
                            className="px-2.5 py-1 text-[11px] bg-[#FFFBFB] hover:bg-[#FBEAE8] text-[#A63A3A] border border-[#A63A3A]/30 rounded-sm transition-colors flex items-center space-x-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Refund</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] border border-[#E8E3D9] rounded-sm max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-4">
              <div>
                <span className="text-[10px] font-serif tracking-[0.2em] text-[#B39458] uppercase">
                  Treasury Reconciliation Dossier
                </span>
                <h3 className="text-lg font-serif font-bold text-[#24221E] mt-0.5">
                  Ref: {selectedTx.transactionRef}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1.5 text-[#77736C] hover:text-[#24221E] rounded-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#F7F5F0] p-3 rounded-sm border border-[#E8E3D9]">
                <div>
                  <span className="text-[#77736C] block">Associated Order</span>
                  <span className="font-mono font-bold text-[#B39458]">{selectedTx.orderNumber}</span>
                </div>
                <div>
                  <span className="text-[#77736C] block">Patron</span>
                  <span className="font-bold text-[#24221E]">{selectedTx.customerName}</span>
                </div>
                <div>
                  <span className="text-[#77736C] block">Gateway</span>
                  <span className="font-bold text-[#24221E]">{selectedTx.paymentGateway}</span>
                </div>
                <div>
                  <span className="text-[#77736C] block">Payment Method</span>
                  <span className="font-medium text-[#24221E]">{selectedTx.method}</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-b border-[#E8E3D9] py-3">
                <div className="flex justify-between">
                  <span className="text-[#77736C]">Gross Amount</span>
                  <span className="font-serif font-bold text-[#24221E]">₹ {selectedTx.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#77736C]">MDR Processing Fee</span>
                  <span className="text-[#77736C]">₹ {selectedTx.gatewayFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#77736C]">GST on MDR (18%)</span>
                  <span className="text-[#77736C]">₹ {selectedTx.tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-2 border-t border-[#E8E3D9]">
                  <span className="text-[#24221E]">Net Settlement</span>
                  <span className="text-[#3E7B54]">₹ {selectedTx.netSettlement.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {selectedTx.refundRef && (
                <div className="p-2.5 bg-[#FAF1E3] border border-[#C98A2C]/20 rounded-sm text-[#A67C2E]">
                  <strong>Refund Reference ID:</strong> {selectedTx.refundRef}
                </div>
              )}

              <div className="text-[11px] text-[#77736C]">
                Timestamp: {new Date(selectedTx.timestamp).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E8E3D9]">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 text-xs bg-[#24221E] text-[#FAF7F0] rounded-sm font-medium"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Confirmation Modal */}
      {refundConfirmTx && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] border border-[#E8E3D9] rounded-sm max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 text-[#A63A3A]">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-serif font-bold text-[#24221E]">
                Initiate Sovereign Refund?
              </h3>
            </div>
            <p className="text-xs text-[#77736C] leading-relaxed">
              You are about to issue a refund of{' '}
              <strong className="text-[#24221E]">
                ₹ {refundConfirmTx.amount.toLocaleString('en-IN')}
              </strong>{' '}
              to patron <strong>{refundConfirmTx.customerName}</strong> for Order{' '}
              <strong>{refundConfirmTx.orderNumber}</strong>. The amount will be returned to their original payment instrument within 3-5 business days.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#E8E3D9]">
              <button
                onClick={() => setRefundConfirmTx(null)}
                className="px-4 py-2 text-xs text-[#77736C] hover:text-[#24221E] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessRefund}
                className="px-4 py-2 text-xs bg-[#A63A3A] hover:bg-[#8D2F2F] text-[#FAF7F0] rounded-sm font-medium transition-colors"
              >
                Confirm & Issue Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

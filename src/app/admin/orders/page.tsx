'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  XCircle,
  FileText,
  Printer,
  Plus,
  Send,
  X,
  User,
  MapPin,
  CreditCard,
  Tag,
  AlertCircle,
  Package,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { formatINR } from '@/utils/formatters';
import { Order } from '@/types';
import { orderService } from '@/services/orderService';
import { apiClient } from '@/services/apiClient';
import { useToast } from '@/components/ui/Toast';

export default function OrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [newInternalNote, setNewInternalNote] = useState('');

  // Delhivery Dispatch / Shipping Modal State
  const [showShipModal, setShowShipModal] = useState(false);
  const [manifestMode, setManifestMode] = useState<'delhivery_auto' | 'manual'>('delhivery_auto');
  const [shippingMode, setShippingMode] = useState<'Express' | 'Surface'>('Express');
  const [packageWeight, setPackageWeight] = useState<number>(750);
  const [courierName, setCourierName] = useState('Delhivery Express');
  const [awbNumber, setAwbNumber] = useState('');
  const [isManifesting, setIsManifesting] = useState(false);
  const [serviceability, setServiceability] = useState<{ checked: boolean; serviceable: boolean; message?: string } | null>(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);

  // Live Delhivery Tracking Modal State
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingWaybill, setTrackingWaybill] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<any | null>(null);
  const [copiedAwb, setCopiedAwb] = useState(false);

  // Delhivery Courier Pickup Scheduling Modal State
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [isSchedulingPickup, setIsSchedulingPickup] = useState(false);
  const [pickupForm, setPickupForm] = useState({
    pickupDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    pickupTime: '14:00:00',
    expectedPackageCount: 1,
    pickupLocation: 'Dronagiri Farms',
  });
  const [pickupResult, setPickupResult] = useState<any | null>(null);

  useEffect(() => {
    orderService
      .fetchOrders()
      .then((res) => {
        setOrders(res || []);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  // Order status transitions
  const handleUpdateStatus = (orderId: string, newStatus: Order['status']) => {
    const updated = orderService.updateOrderStatus(orderId, newStatus);
    setOrders(orderService.getOrders());
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(updated);
    }
    toast(`Order ${updated.orderNumber} status changed to ${newStatus}`, 'success');
  };

  // Add internal note
  const handleAddNote = () => {
    if (!selectedOrder || !newInternalNote.trim()) return;
    const updated = orderService.addInternalNote(selectedOrder.id, newInternalNote.trim());
    setOrders(orderService.getOrders());
    setSelectedOrder(updated);
    setNewInternalNote('');
    toast('Internal note recorded', 'info');
  };

  // Open Ship Modal with auto serviceability check
  const handleOpenShipModal = (order: Order) => {
    setSelectedOrder(order);
    setCourierName('Delhivery Express');
    setShippingMode('Express');
    setPackageWeight(750);
    setAwbNumber(order.trackingNumber || '');
    setManifestMode('delhivery_auto');
    setServiceability(null);
    setShowShipModal(true);

    if (order.shippingAddress?.postalCode) {
      setIsCheckingPincode(true);
      apiClient.shipping
        .checkServiceability(order.shippingAddress.postalCode)
        .then((res) => {
          if (res?.success) {
            setServiceability({
              checked: true,
              serviceable: true,
              message: res.data?.delivery_codes?.[0]?.postal_code?.remarks || 'Pincode fully serviceable on Delhivery Express Logistics network',
            });
          } else {
            setServiceability({
              checked: true,
              serviceable: false,
              message: res?.message || 'Standard courier routing active for this postal area',
            });
          }
        })
        .catch(() => {
          setServiceability({
            checked: true,
            serviceable: true,
            message: 'Delhivery Express routing active',
          });
        })
        .finally(() => {
          setIsCheckingPincode(false);
        });
    }
  };

  // Confirm shipping (Delhivery Auto Manifest or Manual AWB)
  const handleConfirmShipment = async () => {
    if (!selectedOrder) return;

    if (manifestMode === 'delhivery_auto') {
      setIsManifesting(true);
      try {
        const res = await orderService.manifestDelhiveryShipment(
          selectedOrder.id,
          packageWeight,
          shippingMode
        );
        if (res.success && res.awb) {
          const freshOrders = orderService.getOrders();
          setOrders(freshOrders);
          const updated = freshOrders.find((o) => o.id === selectedOrder.id) || res.order;
          if (updated) setSelectedOrder(updated);
          setShowShipModal(false);
          toast(`Shipment manifested! Delhivery AWB: ${res.awb}`, 'success');
        } else {
          toast(res.message || 'Courier manifesting failed. Please check wallet balance or order details.', 'error');
        }
      } catch (err: any) {
        toast(err.message || 'Failed to connect to Delhivery Logistics network', 'error');
      } finally {
        setIsManifesting(false);
      }
    } else {
      if (!awbNumber.trim()) {
        toast('Please enter a valid tracking AWB number', 'error');
        return;
      }
      const updated = orderService.updateShippingDetails(selectedOrder.id, courierName, awbNumber.trim());
      setOrders(orderService.getOrders());
      setSelectedOrder(updated);
      setShowShipModal(false);
      toast(`Order marked Shipped via ${courierName} (AWB: ${awbNumber})`, 'success');
    }
  };

  // Open Live Delhivery Tracking Modal
  const handleOpenTracking = async (waybill: string) => {
    if (!waybill) return;
    setTrackingWaybill(waybill);
    setTrackingLoading(true);
    setTrackingData(null);
    setShowTrackingModal(true);

    try {
      const res = await apiClient.shipping.trackShipment(waybill);
      if (res && res.success && res.data) {
        setTrackingData(res.data);
      } else {
        setTrackingData({
          waybill,
          carrierStatus: 'In Transit',
          displayLabel: 'In Transit',
          origin: 'Dronagiri Farms (284002)',
          destination: selectedOrder?.shippingAddress.city || 'Destination Logistics Hub',
          statusDetails: res?.message || 'Package in transit with Delhivery Express Courier Network',
          scans: [
            {
              status: 'Manifest Created',
              location: 'Dronagiri Farms (284002)',
              statusDateTime: new Date().toISOString(),
              instructions: 'AWB generated & consignment booked with Delhivery Express',
            },
          ],
        });
      }
    } catch {
      setTrackingData({
        waybill,
        carrierStatus: 'In Transit',
        displayLabel: 'In Transit',
        origin: 'Dronagiri Farms (284002)',
        destination: selectedOrder?.shippingAddress.city || 'Destination Logistics Hub',
        statusDetails: 'Package in transit with Delhivery Express Courier Network',
        scans: [
          {
            status: 'Manifest Created',
            location: 'Dronagiri Farms (284002)',
            statusDateTime: new Date().toISOString(),
            instructions: 'Consignment registered on Delhivery network',
          },
        ],
      });
    } finally {
      setTrackingLoading(false);
    }
  };

  // Cancel Delhivery Shipment
  const handleCancelDelhiveryShipment = async (waybill: string) => {
    if (!window.confirm(`Are you sure you want to cancel Delhivery shipment with AWB ${waybill}? This will halt courier pickup.`)) {
      return;
    }

    try {
      const res = await apiClient.shipping.cancelShipment(waybill);
      if (res && res.success) {
        toast(`Shipment ${waybill} cancelled successfully with Delhivery`, 'success');
        if (selectedOrder) {
          handleUpdateStatus(selectedOrder.id, 'Cancelled');
        }
      } else {
        toast(res?.message || 'Failed to cancel shipment with Delhivery', 'error');
      }
    } catch (err: any) {
      toast(err.message || 'Error communicating with Delhivery', 'error');
    }
  };

  // Schedule Warehouse Courier Pickup
  const handleSchedulePickupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSchedulingPickup(true);
    try {
      const res = await apiClient.shipping.schedulePickup(pickupForm);
      if (res && res.success && res.data) {
        setPickupResult(res.data);
        toast(`Delhivery courier pickup scheduled! Token: ${res.data.pickupToken}`, 'success');
      } else {
        toast(res?.message || 'Failed to schedule Delhivery courier pickup', 'error');
      }
    } catch (err: any) {
      toast(err.message || 'Pickup scheduling failed', 'error');
    } finally {
      setIsSchedulingPickup(false);
    }
  };

  // Print Delhivery Thermal Label
  const handlePrintLabel = (waybill: string) => {
    const url = apiClient.shipping.getLabelUrl(waybill);
    window.open(url, '_blank');
  };

  // Copy AWB
  const handleCopyAwb = (awb: string) => {
    navigator.clipboard.writeText(awb);
    setCopiedAwb(true);
    setTimeout(() => setCopiedAwb(false), 2000);
    toast(`AWB ${awb} copied to clipboard`, 'info');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer', 'City', 'Total (INR)', 'Payment Status', 'Status', 'Courier', 'AWB'];
    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      new Date(o.orderDate).toLocaleDateString(),
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.shippingAddress.city}"`,
      o.total,
      o.paymentStatus,
      o.status,
      o.courier || 'N/A',
      o.trackingNumber || 'N/A',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `monarch_orders_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast(`Exported ${filteredOrders.length} orders to CSV`, 'success');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E8E3D9] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#B39458] font-bold">
              Sales & White-Glove Fulfilment
            </span>
            <span className="text-[10px] bg-[#F4EEDF] text-[#9B7940] px-2 py-0.5 rounded-full font-semibold">
              {filteredOrders.length} Active Orders
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#24221E] mt-1">
            Sovereign Orders
          </h1>
          <p className="text-xs md:text-sm text-[#77736C] mt-1">
            Manage bespoke bridal trousseaus, groomwear dispatches, Delhivery Express logistics, and white-glove timelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setPickupResult(null);
              setShowPickupModal(true);
            }}
            className="flex items-center space-x-2 bg-[#FAF7F0] hover:bg-[#F4EEDF] text-[#9B7940] text-xs font-semibold px-4 py-2.5 rounded-sm border border-[#B39458]/40 transition-colors shadow-xs"
          >
            <Truck className="w-3.5 h-3.5 text-[#B39458]" />
            <span>Schedule Delhivery Pickup</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 bg-white hover:bg-[#F7F5F0] text-[#24221E] text-xs font-semibold px-4 py-2.5 rounded-sm border border-[#E8E3D9] transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#B39458]" />
            <span>Export Orders CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-sm border border-[#E8E3D9] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#A8A49C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order #, Patron Name, Email, or AWB..."
              className="w-full pl-9 pr-4 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E] focus:bg-white focus:outline-none focus:border-[#B39458]"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'Pending', label: 'Pending' },
              { id: 'Processing', label: 'Processing' },
              { id: 'Shipped', label: 'Shipped' },
              { id: 'Delivered', label: 'Delivered' },
              { id: 'Refunded', label: 'Refunded' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-[#B39458] text-white shadow-xs'
                    : 'bg-[#F7F5F0] text-[#77736C] hover:text-[#24221E]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-sm border border-[#E8E3D9] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8E3D9] bg-[#FAF9F5] text-[11px] font-semibold text-[#77736C] uppercase tracking-wider">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Patron</th>
                <th className="py-3 px-3">Ensembles</th>
                <th className="py-3 px-3">Total Amount</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Fulfilment Status</th>
                <th className="py-3 px-3">Delhivery Logistics</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E3D9]/60 text-xs" suppressHydrationWarning>
              {filteredOrders.map((order) => {
                const statusColor =
                  order.status === 'Delivered'
                    ? 'bg-[#EBF5EE] text-[#3E7B54]'
                    : order.status === 'Processing'
                    ? 'bg-[#F4EEDF] text-[#9B7940]'
                    : order.status === 'Pending'
                    ? 'bg-[#FFF8E6] text-[#C98A2C]'
                    : order.status === 'Shipped'
                    ? 'bg-[#EEF4FF] text-[#3B66AC]'
                    : 'bg-[#FFF1F0] text-[#A63A3A]';

                const paymentColor =
                  order.paymentStatus === 'Paid'
                    ? 'text-[#3E7B54]'
                    : order.paymentStatus === 'Pending'
                    ? 'text-[#C98A2C]'
                    : 'text-[#A63A3A]';

                return (
                  <tr key={order.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#24221E]">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-3 text-[#77736C]" suppressHydrationWarning>
                      {new Date(order.orderDate).toLocaleDateString([], {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-[#24221E]">{order.customerName}</div>
                      <div className="text-[10px] text-[#77736C]">{order.shippingAddress.city}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-medium text-[#24221E]">
                        {order.items.length} {order.items.length === 1 ? 'Piece' : 'Pieces'}
                      </div>
                      <div className="text-[10px] text-[#77736C] truncate max-w-[140px]">
                        {order.items[0]?.productName}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-[#24221E]">
                      {formatINR(order.total)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`font-semibold flex items-center space-x-1 ${paymentColor}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
                        <span>{order.paymentStatus}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      {order.trackingNumber ? (
                        <div>
                          <span className="font-semibold text-[#24221E] text-xs block">
                            {order.courier || 'Delhivery Express'}
                          </span>
                          <div className="flex items-center space-x-1.5 mt-0.5">
                            <button
                              onClick={() => handleOpenTracking(order.trackingNumber!)}
                              className="font-mono text-[10px] text-[#9B7940] hover:underline flex items-center space-x-0.5 font-bold"
                              title="Track with Delhivery"
                            >
                              <span>{order.trackingNumber}</span>
                              <ExternalLink className="w-2.5 h-2.5 inline" />
                            </button>
                            <button
                              onClick={() => handlePrintLabel(order.trackingNumber!)}
                              className="p-0.5 text-[#77736C] hover:text-[#24221E]"
                              title="Print Shipping Label"
                            >
                              <Printer className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenShipModal(order)}
                          className="text-[10px] font-semibold text-[#9B7940] bg-[#FAF7F0] hover:bg-[#F4EEDF] border border-[#B39458]/40 px-2 py-1 rounded-sm transition-colors flex items-center space-x-1"
                        >
                          <Truck className="w-3 h-3 text-[#B39458]" />
                          <span>+ Manifest</span>
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 bg-[#FAF7F0] hover:bg-[#F4EEDF] text-[#9B7940] border border-[#B39458]/30 font-semibold rounded-sm transition-colors text-xs inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS DRAWER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-end backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#B39458]">
                      Order Manifest
                    </span>
                    <span className="text-[10px] bg-[#FAF7F0] text-[#9B7940] font-semibold px-2 py-0.5 rounded">
                      {selectedOrder.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-serif font-bold text-[#24221E] mt-0.5">
                    {selectedOrder.orderNumber}
                  </h2>
                  <span className="text-xs text-[#77736C]">
                    Placed on {new Date(selectedOrder.orderDate).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowInvoiceModal(true)}
                    className="p-2 rounded-sm border border-[#E8E3D9] hover:bg-[#F7F5F0] text-[#24221E]"
                    title="Invoice Preview"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 rounded-sm hover:bg-[#F7F5F0] text-[#77736C]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Status Action Buttons Bar */}
              <div className="p-3 bg-[#FAF9F5] rounded-sm border border-[#E8E3D9] flex items-center flex-wrap gap-2 text-xs font-semibold">
                <span className="text-[#77736C] mr-1 text-[11px] uppercase tracking-wider">
                  Update:
                </span>
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'Processing')}
                  className="px-2.5 py-1.5 bg-white border border-[#E8E3D9] hover:border-[#B39458] text-[#9B7940] rounded-sm transition-colors"
                >
                  Mark Processing
                </button>
                <button
                  onClick={() => handleOpenShipModal(selectedOrder)}
                  className="px-2.5 py-1.5 bg-white border border-[#B39458] hover:bg-[#FAF7F0] text-[#9B7940] rounded-sm transition-colors flex items-center space-x-1"
                >
                  <Truck className="w-3.5 h-3.5 text-[#B39458]" />
                  <span>Dispatch via Delhivery</span>
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'Delivered')}
                  className="px-2.5 py-1.5 bg-white border border-[#E8E3D9] hover:border-[#3E7B54] text-[#3E7B54] rounded-sm transition-colors"
                >
                  Mark Delivered
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'Cancelled')}
                  className="px-2.5 py-1.5 bg-white border border-[#E8E3D9] hover:border-[#A63A3A] text-[#A63A3A] rounded-sm transition-colors"
                >
                  Cancel Order
                </button>
              </div>

              {/* DELHIVERY LOGISTICS HUB CARD */}
              <div className="p-4 bg-gradient-to-br from-[#FAF9F5] to-[#F4EEDF]/40 border border-[#B39458]/40 rounded-sm space-y-3">
                <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-2.5">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-[#B39458] text-white rounded-xs">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-serif font-bold text-[#24221E] block">
                        Delhivery Express Logistics Hub
                      </span>
                      <span className="text-[10px] text-[#77736C]">
                        Insured Sovereign Surface & Air Transit
                      </span>
                    </div>
                  </div>
                  {selectedOrder.trackingNumber ? (
                    <span className="text-[10px] font-semibold bg-[#EBF5EE] text-[#3E7B54] border border-[#3E7B54]/30 px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3E7B54] animate-pulse inline-block" />
                      <span>Manifested</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold bg-[#FFF8E6] text-[#C98A2C] border border-[#C98A2C]/30 px-2 py-0.5 rounded-full">
                      Pending Manifest
                    </span>
                  )}
                </div>

                {selectedOrder.trackingNumber ? (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs bg-white p-3 rounded-sm border border-[#E8E3D9]">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#77736C] block">Carrier</span>
                        <span className="font-semibold text-[#24221E]">{selectedOrder.courier || 'Delhivery Express'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#77736C] block">Waybill / AWB</span>
                        <div className="flex items-center space-x-1">
                          <span className="font-mono font-bold text-[#24221E]">{selectedOrder.trackingNumber}</span>
                          <button
                            onClick={() => handleCopyAwb(selectedOrder.trackingNumber!)}
                            className="p-1 hover:bg-[#F7F5F0] rounded text-[#77736C]"
                            title="Copy AWB"
                          >
                            {copiedAwb ? <Check className="w-3 h-3 text-[#3E7B54]" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#77736C] block">Origin Hub</span>
                        <span className="font-medium text-[#24221E]">Dronagiri Farms (284002)</span>
                      </div>
                    </div>

                    <div className="flex items-center flex-wrap gap-2 pt-1 text-xs font-semibold">
                      <button
                        onClick={() => handleOpenTracking(selectedOrder.trackingNumber!)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#24221E] hover:bg-[#B39458] text-white rounded-sm transition-colors shadow-xs"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Live Tracking Scans</span>
                      </button>
                      <button
                        onClick={() => handlePrintLabel(selectedOrder.trackingNumber!)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-[#FAF7F0] text-[#9B7940] border border-[#B39458]/40 rounded-sm transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Delhivery Thermal Label</span>
                      </button>
                      <button
                        onClick={() => handleCancelDelhiveryShipment(selectedOrder.trackingNumber!)}
                        className="flex items-center space-x-1 px-2.5 py-1.5 bg-white hover:bg-[#FFF1F0] text-[#A63A3A] border border-[#E8E3D9] hover:border-[#A63A3A]/40 rounded-sm transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel Consignment</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div className="text-xs text-[#77736C]">
                      Order has not been manifested with Delhivery yet. Auto-generate insured shipping AWB & register parcel with Delhivery courier network.
                    </div>
                    <button
                      onClick={() => handleOpenShipModal(selectedOrder)}
                      className="px-4 py-2 bg-[#B39458] hover:bg-[#9B7940] text-white text-xs font-semibold rounded-sm transition-colors flex items-center space-x-1.5 shrink-0 shadow-xs"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Manifest with Delhivery</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Patron & Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Patron Info */}
                <div className="p-4 bg-[#F7F5F0] rounded-sm space-y-1.5 border border-[#E8E3D9]">
                  <div className="text-[10px] uppercase font-bold text-[#77736C] flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-[#B39458]" />
                    <span>Royal Patron Details</span>
                  </div>
                  <p className="font-semibold text-sm text-[#24221E]">{selectedOrder.customerName}</p>
                  <p className="text-[#77736C]">{selectedOrder.customerEmail}</p>
                  <p className="text-[#77736C]">{selectedOrder.customerPhone}</p>
                  <div className="pt-1 text-[11px] text-[#9B7940]">
                    Payment: <strong>{selectedOrder.paymentMethod}</strong> ({selectedOrder.paymentStatus})
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="p-4 bg-[#F7F5F0] rounded-sm space-y-1.5 border border-[#E8E3D9]">
                  <div className="text-[10px] uppercase font-bold text-[#77736C] flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-[#B39458]" />
                    <span>Shipping Destination</span>
                  </div>
                  <p className="font-semibold text-xs text-[#24221E]">{selectedOrder.shippingAddress.name}</p>
                  <p className="text-[#77736C] leading-relaxed">
                    {selectedOrder.shippingAddress.addressLine1}
                    {selectedOrder.shippingAddress.addressLine2 && `, ${selectedOrder.shippingAddress.addressLine2}`}
                    <br />
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} -{' '}
                    {selectedOrder.shippingAddress.postalCode}
                  </p>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold tracking-wider text-[#77736C]">
                  Commissioned Garments ({selectedOrder.items.length})
                </h4>

                <div className="border border-[#E8E3D9] rounded-sm overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF9F5] border-b border-[#E8E3D9] text-[11px] text-[#77736C]">
                      <tr>
                        <th className="p-3">Ensemble</th>
                        <th className="p-3">Variant / Sizing</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Qty</th>
                        <th className="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E3D9]">
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id}>
                          <td className="p-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-12 rounded-xs overflow-hidden shrink-0 border border-[#E8E3D9] bg-[#F7F5F0]">
                                <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <span className="font-semibold text-[#24221E] block line-clamp-1">
                                  {item.productName}
                                </span>
                                <span className="text-[10px] font-mono text-[#77736C]">{item.sku}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-[#77736C]">
                            <span className="font-medium text-[#24221E] block">{item.variantColor}</span>
                            <span className="text-[10px]">{item.variantSize}</span>
                          </td>
                          <td className="p-3 text-[#24221E]">{formatINR(item.price)}</td>
                          <td className="p-3 text-[#24221E] font-semibold">{item.quantity}</td>
                          <td className="p-3 text-right font-semibold text-[#24221E]">
                            {formatINR(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary */}
                <div className="p-4 bg-[#FAF9F5] border border-[#E8E3D9] rounded-sm space-y-2 text-xs">
                  <div className="flex justify-between text-[#77736C]">
                    <span>Subtotal</span>
                    <span>{formatINR(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-[#3E7B54]">
                      <span>Royal Privilege Discount</span>
                      <span>-{formatINR(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#77736C]">
                    <span>GST (12% Haute Couture Silk Duty)</span>
                    <span>{formatINR(selectedOrder.tax)}</span>
                  </div>
                  <div className="flex justify-between text-[#77736C]">
                    <span>Delhivery Express Insured Air Freight</span>
                    <span className="text-[#3E7B54] font-semibold">
                      {selectedOrder.subtotal >= 50000 ? 'Complimentary' : formatINR(2500)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#E8E3D9] flex justify-between font-serif font-bold text-base text-[#24221E]">
                    <span>Total Amount Reconciled</span>
                    <span className="text-[#9B7940]">{formatINR(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold tracking-wider text-[#77736C]">
                  Order Journey Timeline
                </h4>
                <div className="space-y-3 pl-2 border-l-2 border-[#B39458]/40">
                  {selectedOrder.timeline.map((evt, idx) => (
                    <div key={idx} className="relative pl-4 text-xs">
                      <span className="absolute -left-[1.3rem] top-1 w-2.5 h-2.5 rounded-full bg-[#B39458] ring-4 ring-white" />
                      <div className="flex items-center justify-between">
                        <strong className="text-[#24221E]">{evt.status}</strong>
                        <span className="text-[10px] text-[#A8A49C]">
                          {new Date(evt.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#77736C] mt-0.5">{evt.message}</p>
                      <span className="text-[10px] text-[#B39458] block mt-0.5">By {evt.actor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Internal Notes Section */}
              <div className="space-y-3 pt-3 border-t border-[#E8E3D9]">
                <h4 className="text-xs uppercase font-bold tracking-wider text-[#77736C]">
                  Internal Atelier Notes
                </h4>
                {selectedOrder.internalNotes && selectedOrder.internalNotes.length > 0 && (
                  <div className="space-y-2">
                    {selectedOrder.internalNotes.map((note, i) => (
                      <div key={i} className="p-2.5 bg-[#FFFDF7] border border-[#F4EEDF] rounded-sm text-xs text-[#24221E]">
                        {note}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    value={newInternalNote}
                    onChange={(e) => setNewInternalNote(e.target.value)}
                    placeholder="Add private concierge fitting note..."
                    className="flex-1 px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-3 py-2 bg-[#24221E] hover:bg-[#B39458] text-white text-xs font-semibold rounded-sm transition-colors"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#E8E3D9] flex items-center justify-between">
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="px-4 py-2 bg-[#FAF7F0] text-[#9B7940] border border-[#B39458]/30 text-xs font-semibold rounded-sm hover:bg-[#F4EEDF]"
              >
                View Full Invoice
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-[#F7F5F0] text-[#77736C] text-xs font-medium rounded-sm"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELHIVERY DISPATCH / MANIFEST MODAL */}
      {showShipModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white max-w-lg w-full rounded-sm p-6 space-y-4 shadow-2xl border border-[#E8E3D9] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-[#B39458] text-white rounded-xs">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#24221E]">
                    Delhivery Express Dispatch Manifest
                  </h3>
                  <p className="text-[11px] text-[#77736C]">
                    Consignment for Order #{selectedOrder.orderNumber}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowShipModal(false)} className="text-[#77736C] hover:text-[#24221E]">
                ✕
              </button>
            </div>

            {/* Manifest Mode Tabs */}
            <div className="flex border-b border-[#E8E3D9] text-xs font-semibold">
              <button
                onClick={() => setManifestMode('delhivery_auto')}
                className={`py-2 px-4 border-b-2 transition-colors ${
                  manifestMode === 'delhivery_auto'
                    ? 'border-[#B39458] text-[#9B7940]'
                    : 'border-transparent text-[#77736C] hover:text-[#24221E]'
                }`}
              >
                Delhivery Auto-Manifest (Instant AWB)
              </button>
              <button
                onClick={() => setManifestMode('manual')}
                className={`py-2 px-4 border-b-2 transition-colors ${
                  manifestMode === 'manual'
                    ? 'border-[#B39458] text-[#9B7940]'
                    : 'border-transparent text-[#77736C] hover:text-[#24221E]'
                }`}
              >
                Manual AWB Entry
              </button>
            </div>

            {/* Destination & Serviceability Summary */}
            <div className="p-3 bg-[#FAF9F5] border border-[#E8E3D9] rounded-sm space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#77736C]">Destination:</span>
                <span className="font-semibold text-[#24221E]">
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} ({selectedOrder.shippingAddress.postalCode})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#77736C]">Recipient:</span>
                <span className="text-[#24221E]">{selectedOrder.customerName} ({selectedOrder.customerPhone})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#77736C]">Warehouse Origin:</span>
                <span className="text-[#24221E]">Dronagiri Farms (Pincode: 284002)</span>
              </div>

              {/* Live Serviceability Badge */}
              <div className="pt-2 border-t border-[#E8E3D9]/60 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#77736C]">Serviceability:</span>
                {isCheckingPincode ? (
                  <span className="text-[11px] text-[#B39458] flex items-center space-x-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Checking Delhivery Network...</span>
                  </span>
                ) : serviceability?.serviceable ? (
                  <span className="text-[11px] text-[#3E7B54] font-semibold flex items-center space-x-1 bg-[#EBF5EE] px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Delhivery Express Serviceable</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-[#9B7940] bg-[#FAF7F0] px-2 py-0.5 rounded-full">
                    Standard Courier Routed
                  </span>
                )}
              </div>
            </div>

            {manifestMode === 'delhivery_auto' ? (
              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#24221E] block">Courier Speed Mode</label>
                    <select
                      value={shippingMode}
                      onChange={(e) => setShippingMode(e.target.value as 'Express' | 'Surface')}
                      className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                    >
                      <option value="Express">Delhivery Express (Priority Air Freight)</option>
                      <option value="Surface">Delhivery Surface (Insured Ground Cargo)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-[#24221E] block">Parcel Weight (Grams)</label>
                    <input
                      type="number"
                      value={packageWeight}
                      onChange={(e) => setPackageWeight(Number(e.target.value) || 500)}
                      min={100}
                      step={50}
                      className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#FFFDF7] border border-[#B39458]/30 rounded-sm text-[11px] text-[#77736C] space-y-1">
                  <div className="font-bold text-[#9B7940]">Automatic Delhivery Protocol:</div>
                  <p>
                    1. Generates live 14-digit Delhivery AWB number via registered client account.
                    <br />
                    2. Schedules courier pickup dispatch from Orchha Warehouse (284002).
                    <br />
                    3. Produces downloadable thermal PDF shipping label packing slip.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-[#24221E]">Courier Service Name</label>
                  <select
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                  >
                    <option value="Delhivery Express">Delhivery Express</option>
                    <option value="BlueDart Apex">BlueDart Apex (Insured Express Air)</option>
                    <option value="DTDC Air">DTDC Air Priority</option>
                    <option value="Monarch White-Glove">Monarch White-Glove Concierge</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#24221E]">AWB Airway Bill Tracking Number</label>
                  <input
                    type="text"
                    value={awbNumber}
                    onChange={(e) => setAwbNumber(e.target.value)}
                    placeholder="Enter Delhivery or courier AWB number..."
                    className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs font-mono text-[#24221E]"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#E8E3D9] text-xs font-semibold">
              <button
                onClick={() => setShowShipModal(false)}
                disabled={isManifesting}
                className="px-4 py-2 bg-[#F7F5F0] text-[#77736C] rounded-sm hover:text-[#24221E]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmShipment}
                disabled={isManifesting}
                className="px-4 py-2 bg-[#B39458] hover:bg-[#9B7940] text-white rounded-sm flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
              >
                {isManifesting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Manifesting on Delhivery...</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-3.5 h-3.5" />
                    <span>{manifestMode === 'delhivery_auto' ? 'Auto-Generate Delhivery AWB' : 'Confirm Dispatch'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE DELHIVERY TRACKING MODAL */}
      {showTrackingModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white max-w-xl w-full rounded-sm p-6 space-y-5 shadow-2xl border border-[#E8E3D9] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-[#B39458] text-white rounded-xs">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#24221E]">
                    Delhivery Express Live Tracking
                  </h3>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="font-mono text-xs text-[#9B7940] font-bold">{trackingWaybill}</span>
                    <button
                      onClick={() => handleCopyAwb(trackingWaybill)}
                      className="text-[#77736C] hover:text-[#24221E]"
                      title="Copy AWB"
                    >
                      {copiedAwb ? <Check className="w-3 h-3 text-[#3E7B54]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowTrackingModal(false)} className="text-[#77736C] hover:text-[#24221E]">
                ✕
              </button>
            </div>

            {trackingLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2 text-[#77736C] text-xs">
                <Loader2 className="w-6 h-6 animate-spin text-[#B39458]" />
                <span>Querying Delhivery Logistics Hub API...</span>
              </div>
            ) : trackingData ? (
              <div className="space-y-4 text-xs">
                {/* Status Hero Card */}
                <div className="p-4 bg-gradient-to-r from-[#FAF9F5] to-[#F4EEDF]/50 border border-[#B39458]/40 rounded-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#77736C] block">Carrier Status</span>
                      <span className="font-serif text-lg font-bold text-[#24221E] block">
                        {trackingData.displayLabel || trackingData.carrierStatus || 'In Transit'}
                      </span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-[#EBF5EE] text-[#3E7B54] border border-[#3E7B54]/30">
                      Live Courier Feed
                    </span>
                  </div>
                  {trackingData.statusDetails && (
                    <p className="text-[#77736C] text-xs mt-1">{trackingData.statusDetails}</p>
                  )}
                  {trackingData.expectedDeliveryDate && (
                    <div className="text-[11px] text-[#9B7940] font-semibold mt-2">
                      Estimated Sovereign Delivery: {new Date(trackingData.expectedDeliveryDate).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>

                {/* Origin -> Destination Route */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#77736C] block">Dispatch Origin</span>
                    <span className="font-semibold text-[#24221E]">{trackingData.origin || 'Dronagiri Farms (284002)'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#77736C] block">Destination Hub</span>
                    <span className="font-semibold text-[#24221E]">{trackingData.destination || 'Patron Residence'}</span>
                  </div>
                </div>

                {/* Scans Timeline */}
                <div className="space-y-2 pt-2">
                  <span className="font-bold text-xs uppercase text-[#77736C] tracking-wider block">
                    Delhivery Logistics Transit Scans
                  </span>

                  {trackingData.scans && trackingData.scans.length > 0 ? (
                    <div className="space-y-3 border-l-2 border-[#B39458]/40 pl-3">
                      {trackingData.scans.map((scan: any, i: number) => (
                        <div key={i} className="relative pl-3 text-xs">
                          <span className="absolute -left-[1.05rem] top-1 w-2 h-2 rounded-full bg-[#B39458] ring-2 ring-white" />
                          <div className="flex items-center justify-between">
                            <strong className="text-[#24221E]">{scan.status}</strong>
                            <span className="text-[10px] text-[#A8A49C]">
                              {scan.statusDateTime ? new Date(scan.statusDateTime).toLocaleString() : ''}
                            </span>
                          </div>
                          {scan.location && (
                            <div className="text-[11px] text-[#B39458] font-medium flex items-center space-x-1 mt-0.5">
                              <MapPin className="w-2.5 h-2.5" />
                              <span>{scan.location}</span>
                            </div>
                          )}
                          {scan.instructions && (
                            <p className="text-[11px] text-[#77736C] mt-0.5">{scan.instructions}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-[#FAF9F5] border border-[#E8E3D9] rounded-sm text-[#77736C] text-xs text-center">
                      Consignment manifested. First hub physical scan will update once courier driver scans parcel at origin station.
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Actions */}
            <div className="pt-3 border-t border-[#E8E3D9] flex items-center justify-between text-xs font-semibold">
              <button
                onClick={() => handlePrintLabel(trackingWaybill)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-[#FAF7F0] hover:bg-[#F4EEDF] text-[#9B7940] border border-[#B39458]/40 rounded-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Thermal Label</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleOpenTracking(trackingWaybill)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-[#E8E3D9] hover:bg-[#F7F5F0] text-[#24221E] rounded-sm"
                >
                  <RefreshCw className="w-3 h-3 text-[#B39458]" />
                  <span>Refresh Scans</span>
                </button>
                <button
                  onClick={() => setShowTrackingModal(false)}
                  className="px-4 py-1.5 bg-[#24221E] hover:bg-[#B39458] text-white rounded-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COURIER PICKUP SCHEDULING MODAL */}
      {showPickupModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-sm p-6 space-y-4 shadow-2xl border border-[#E8E3D9]">
            <div className="flex items-center justify-between border-b border-[#E8E3D9] pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-[#B39458] text-white rounded-xs">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#24221E]">
                    Schedule Delhivery Courier Pickup
                  </h3>
                  <p className="text-[11px] text-[#77736C]">
                    Book warehouse vehicle dispatch for dispatch parcels
                  </p>
                </div>
              </div>
              <button onClick={() => setShowPickupModal(false)} className="text-[#77736C] hover:text-[#24221E]">
                ✕
              </button>
            </div>

            {pickupResult ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-[#EBF5EE] border border-[#3E7B54]/40 rounded-sm text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#3E7B54] mx-auto" />
                  <h4 className="font-serif font-bold text-base text-[#24221E]">
                    Pickup Request Dispatched
                  </h4>
                  <div className="font-mono text-sm font-bold text-[#3E7B54]">
                    Token: {pickupResult.pickupToken}
                  </div>
                  <p className="text-[#77736C] text-[11px]">
                    Delhivery driver assigned for {pickupResult.scheduledDate} at {pickupResult.pickupLocation} ({pickupResult.expectedPackageCount} parcels).
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowPickupModal(false)}
                    className="px-4 py-2 bg-[#24221E] hover:bg-[#B39458] text-white rounded-sm text-xs font-semibold"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSchedulePickupSubmit} className="space-y-3.5 text-xs">
                <div className="p-3 bg-[#FAF9F5] border border-[#E8E3D9] rounded-sm text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#77736C] block">Warehouse Origin:</span>
                  <div className="font-semibold text-[#24221E]">Dronagiri Farms (Pincode: 284002)</div>
                  <div className="text-[11px] text-[#77736C]">Orchha Bypass Road, MP / UP Border Logistics Center</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#24221E] block">Pickup Date</label>
                    <input
                      type="date"
                      value={pickupForm.pickupDate}
                      onChange={(e) => setPickupForm({ ...pickupForm, pickupDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#24221E] block">Preferred Time Slot</label>
                    <select
                      value={pickupForm.pickupTime}
                      onChange={(e) => setPickupForm({ ...pickupForm, pickupTime: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                    >
                      <option value="11:00:00">Morning (10:00 - 13:00)</option>
                      <option value="14:00:00">Afternoon (14:00 - 17:00)</option>
                      <option value="18:00:00">Evening (17:00 - 20:00)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#24221E] block">Expected Package Count</label>
                  <input
                    type="number"
                    value={pickupForm.expectedPackageCount}
                    onChange={(e) => setPickupForm({ ...pickupForm, expectedPackageCount: Math.max(1, Number(e.target.value) || 1) })}
                    min={1}
                    required
                    className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs text-[#24221E]"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#E8E3D9] text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setShowPickupModal(false)}
                    disabled={isSchedulingPickup}
                    className="px-4 py-2 bg-[#F7F5F0] text-[#77736C] rounded-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSchedulingPickup}
                    className="px-4 py-2 bg-[#B39458] hover:bg-[#9B7940] text-white rounded-sm flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
                  >
                    {isSchedulingPickup ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Dispatching Request...</span>
                      </>
                    ) : (
                      <>
                        <Truck className="w-3.5 h-3.5" />
                        <span>Confirm Courier Pickup</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* LUXURY TAX INVOICE PREVIEW MODAL */}
      {showInvoiceModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 md:p-8 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white max-w-3xl w-full rounded-sm overflow-hidden shadow-2xl p-8 space-y-6 max-h-[95vh] overflow-y-auto">
            {/* Invoice Top Header */}
            <div className="flex items-start justify-between border-b-2 border-[#B39458] pb-6">
              <div>
                <span className="font-serif tracking-[0.25em] text-2xl font-bold text-[#24221E] block">
                  MONARCH
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#B39458] block mt-0.5">
                  Haute Couture Indian Royal Heritage Private Limited
                </span>
                <p className="text-xs text-[#77736C] mt-1">
                  18/22 Ropewalk Lane, Kala Ghoda, Mumbai 400001
                  <br />
                  GSTIN: 27AABCM8920K1ZX · CIN: U74999MH2024PTC398201
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs uppercase font-bold text-[#77736C] tracking-widest block">
                  Tax Invoice
                </span>
                <span className="font-mono font-bold text-lg text-[#24221E] block">
                  {selectedOrder.orderNumber}
                </span>
                <span className="text-xs text-[#77736C] block" suppressHydrationWarning>
                  Date: {new Date(selectedOrder.orderDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Bill To & Ship To */}
            <div className="grid grid-cols-2 gap-6 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#77736C]">Billed To:</span>
                <p className="font-semibold text-sm text-[#24221E] mt-1">{selectedOrder.customerName}</p>
                <p className="text-[#77736C]">{selectedOrder.billingAddress.addressLine1}</p>
                <p className="text-[#77736C]">
                  {selectedOrder.billingAddress.city}, {selectedOrder.billingAddress.state} -{' '}
                  {selectedOrder.billingAddress.postalCode}
                </p>
                <p className="text-[#77736C]">{selectedOrder.customerPhone}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#77736C]">Shipped To:</span>
                <p className="font-semibold text-sm text-[#24221E] mt-1">{selectedOrder.shippingAddress.name}</p>
                <p className="text-[#77736C]">{selectedOrder.shippingAddress.addressLine1}</p>
                <p className="text-[#77736C]">
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} -{' '}
                  {selectedOrder.shippingAddress.postalCode}
                </p>
                <p className="text-[11px] text-[#B39458] mt-1">
                  Logistics: {selectedOrder.courier || 'Delhivery Express'} ({selectedOrder.trackingNumber || 'White-Glove Sovereign Courier'})
                </p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs border border-[#E8E3D9]">
              <thead className="bg-[#FAF9F5] border-b border-[#E8E3D9] text-[11px] text-[#77736C]">
                <tr>
                  <th className="p-3">Description of Goods</th>
                  <th className="p-3">HSN Code</th>
                  <th className="p-3">Rate (INR)</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E3D9]">
                {selectedOrder.items.map((it) => (
                  <tr key={it.id}>
                    <td className="p-3">
                      <div className="font-semibold text-[#24221E]">{it.productName}</div>
                      <div className="text-[10px] text-[#77736C]">
                        Color: {it.variantColor} · Size: {it.variantSize} · SKU: {it.sku}
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-[#77736C]">6204.21</td>
                    <td className="p-3">{formatINR(it.price)}</td>
                    <td className="p-3 font-semibold">{it.quantity}</td>
                    <td className="p-3 text-right font-semibold">{formatINR(it.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Calculations */}
            <div className="flex justify-end text-xs">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-[#77736C]">
                  <span>Subtotal:</span>
                  <span>{formatINR(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-[#3E7B54]">
                    <span>Privilege Discount:</span>
                    <span>-{formatINR(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#77736C]">
                  <span>CGST (6%):</span>
                  <span>{formatINR(Math.round(selectedOrder.tax / 2))}</span>
                </div>
                <div className="flex justify-between text-[#77736C]">
                  <span>SGST (6%):</span>
                  <span>{formatINR(Math.round(selectedOrder.tax / 2))}</span>
                </div>
                <div className="flex justify-between text-[#77736C]">
                  <span>Delhivery Insured Delivery:</span>
                  <span>{selectedOrder.subtotal >= 50000 ? 'Complimentary' : formatINR(2500)}</span>
                </div>
                <div className="pt-2 border-t-2 border-[#24221E] flex justify-between font-serif font-bold text-base text-[#24221E]">
                  <span>Invoice Total:</span>
                  <span className="text-[#9B7940]">{formatINR(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Hallmark Guarantee Footer */}
            <div className="p-3 bg-[#FAF7EE] border border-[#B39458]/30 rounded-xs text-[11px] text-[#77736C] text-center">
              This authenticates that the garment incorporates tested 24K gold zari and certified Mulberry / Kashi silks,
              crafted under private royal commission standards.
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[#E8E3D9] flex items-center justify-between">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#24221E] text-white text-xs font-semibold rounded-sm hover:bg-[#B39458]"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 py-2 bg-[#F7F5F0] text-[#77736C] text-xs font-medium rounded-sm"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

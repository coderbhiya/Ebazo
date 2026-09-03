'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, Search, Phone, Mail, MapPin, 
  ShoppingBag, IndianRupee, Clock, RefreshCw,
  Eye, X, ExternalLink, Calendar
} from 'lucide-react';
import { fetchAdminCustomers, fetchCustomerOrders, Customer, Order } from '@/lib/admin-api';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Customer Detail Drawer / Modal
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const loadCustomers = (search?: string) => {
    setLoading(true);
    fetchAdminCustomers(search).then((res) => {
      setCustomers(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCustomers(searchQuery);
  };

  const openCustomerModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setOrdersLoading(true);
    fetchCustomerOrders(customer.customer_phone || customer.customer_email).then((data) => {
      setCustomerOrders(data);
      setOrdersLoading(false);
    });
  };

  const totalRevenueAll = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
  const totalOrdersAll = customers.reduce((sum, c) => sum + (c.total_orders || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-400">
            CRM & Customer Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Customer Directory
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Profiles, lifetime spend calculations, destination addresses, and order records
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadCustomers(searchQuery)}
            className="flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-950 px-4 py-2.5 text-xs font-bold text-stone-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-primary-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-stone-800 bg-stone-950 p-5 space-y-1">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Registered Profiles</span>
          <span className="text-2xl sm:text-3xl font-black text-white block">{customers.length}</span>
          <span className="text-[11px] text-stone-500 block">Unique phone & email accounts</span>
        </div>

        <div className="rounded-3xl border border-stone-800 bg-stone-950 p-5 space-y-1">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Total Customer Orders</span>
          <span className="text-2xl sm:text-3xl font-black text-white block">{totalOrdersAll}</span>
          <span className="text-[11px] text-stone-500 block">Avg {(totalOrdersAll / Math.max(1, customers.length)).toFixed(1)} orders / customer</span>
        </div>

        <div className="rounded-3xl border border-stone-800 bg-stone-950 p-5 space-y-1">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Total Lifetime Value</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 block">₹{totalRevenueAll.toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-stone-500 block">Gross revenue generated</span>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="rounded-3xl border border-stone-800 bg-stone-950 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer name, email, phone or city..."
              className="w-full rounded-xl border border-stone-800 bg-stone-900 py-2.5 pl-9 pr-20 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-primary-500"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-primary-600 px-3 py-1 text-[10px] font-bold text-white hover:bg-primary-500"
            >
              Search
            </button>
          </form>

          <span className="text-xs text-stone-400">
            Showing <strong>{customers.length}</strong> customer profiles
          </span>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="h-8 w-8 text-primary-400 animate-spin" />
          </div>
        ) : customers.length === 0 ? (
          <div className="py-12 text-center text-stone-500 text-xs">
            No customers found in database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500 border-b border-stone-800">
                <tr>
                  <th className="pb-3">Customer Name</th>
                  <th className="pb-3">Contact Details</th>
                  <th className="pb-3">Destination City</th>
                  <th className="pb-3">Total Orders</th>
                  <th className="pb-3">Lifetime Spent</th>
                  <th className="pb-3">Last Order Date</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {customers.map((c, idx) => (
                  <tr key={idx} className="hover:bg-stone-900/50 transition-colors">
                    <td className="py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-primary-950/80 border border-primary-500/30 flex items-center justify-center font-bold text-primary-300 text-xs">
                          {c.customer_name ? c.customer_name[0].toUpperCase() : 'U'}
                        </div>
                        <span className="font-bold text-white text-sm">{c.customer_name || 'Anonymous Customer'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 space-y-0.5">
                      <p className="text-stone-300 font-mono text-[11px] flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-primary-400" /> {c.customer_phone || 'N/A'}
                      </p>
                      {c.customer_email && (
                        <p className="text-stone-500 text-[10px] flex items-center gap-1.5">
                          <Mail className="h-3 w-3 text-stone-500" /> {c.customer_email}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5">
                      <span className="text-stone-300 font-medium">
                        {c.city ? `${c.city}, ${c.state}` : 'India'}
                      </span>
                    </td>

                    <td className="py-3.5 font-bold text-white">
                      <span className="rounded-lg bg-stone-900 border border-stone-800 px-2 py-1 text-[11px]">
                        {c.total_orders} orders
                      </span>
                    </td>

                    <td className="py-3.5 font-black text-emerald-400 text-sm">
                      ₹{c.total_spent?.toLocaleString('en-IN') || 0}
                    </td>

                    <td className="py-3.5 text-stone-400 text-[11px]">
                      {c.last_order_date ? new Date(c.last_order_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </td>

                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => openCustomerModal(c)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 border border-stone-800 px-3 py-1.5 text-xs font-bold text-primary-400 hover:text-white hover:bg-stone-800 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Profile & Orders</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Profile & Order History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl rounded-3xl border border-stone-800 bg-stone-900 p-6 sm:p-8 shadow-2xl text-stone-200 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-primary-600 flex items-center justify-center font-black text-white text-lg shadow-lg">
                  {selectedCustomer.customer_name ? selectedCustomer.customer_name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{selectedCustomer.customer_name}</h3>
                  <p className="text-xs text-stone-400">
                    {selectedCustomer.city}, {selectedCustomer.state} • Total Spent: <strong className="text-emerald-400">₹{selectedCustomer.total_spent}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="rounded-full p-2 text-stone-400 hover:text-white bg-stone-800/80"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Contact Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl bg-stone-950 p-4 border border-stone-800 text-xs">
              <div>
                <span className="text-[10px] font-bold text-stone-500 uppercase block">Phone Number</span>
                <a href={`tel:${selectedCustomer.customer_phone}`} className="font-bold text-primary-400 hover:underline">
                  {selectedCustomer.customer_phone || 'No phone recorded'}
                </a>
              </div>
              <div>
                <span className="text-[10px] font-bold text-stone-500 uppercase block">Email Address</span>
                <a href={`mailto:${selectedCustomer.customer_email}`} className="font-bold text-primary-400 hover:underline">
                  {selectedCustomer.customer_email || 'No email recorded'}
                </a>
              </div>
            </div>

            {/* Orders History */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Purchase History ({customerOrders.length} Orders)
              </span>

              {ordersLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-primary-400 animate-spin" />
                </div>
              ) : customerOrders.length === 0 ? (
                <p className="py-6 text-center text-stone-500 text-xs">No orders found for this user.</p>
              ) : (
                <div className="space-y-3">
                  {customerOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-2xl bg-stone-950 p-4 border border-stone-800 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-800/80">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-primary-400">{order.order_number}</span>
                          <span className="text-stone-500">•</span>
                          <span className="text-stone-400">{new Date(order.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white">₹{order.total_amount}</span>
                          <span className="rounded bg-stone-900 border border-stone-800 px-2 py-0.5 text-[10px] font-bold uppercase text-stone-300">
                            {order.order_status}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5">
                        {order.items && order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 text-xs">
                            <img src={item.custom_photo_url || item.product_image} alt="" className="h-8 w-8 rounded-lg object-cover bg-stone-900 border border-stone-800" />
                            <div className="flex-1 truncate">
                              <span className="font-semibold text-white block truncate">{item.product_title} ({item.shape_selected})</span>
                              {item.custom_text && <span className="text-[10px] text-stone-400 italic block">Engraving: &ldquo;{item.custom_text}&rdquo;</span>}
                            </div>
                            <span className="text-stone-400 text-xs">Qty {item.quantity} • ₹{item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

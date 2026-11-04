'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Trash2, Edit, Shield, Check, X } from 'lucide-react';
import { settingsService } from '@/services/settingsService';
import { AdminUser } from '@/types';
import { useToast } from '@/components/ui/Toast';

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [editingUser, setEditingUser] = useState<Partial<AdminUser> | null>(null);

  useEffect(() => {
    setUsers(settingsService.getAdminUsers());
    settingsService.fetchAdminUsers().then((remote) => {
      if (remote) setUsers(remote);
    });
  }, []);

  const handleSave = () => {
    if (!editingUser?.name || !editingUser?.email) return;
    if (editingUser.id) {
      settingsService.updateAdminUser(editingUser.id, editingUser);
      toast(`User ${editingUser.name} updated`, 'success');
    } else {
      settingsService.addAdminUser({
        name: editingUser.name,
        email: editingUser.email,
        avatar: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=70&w=200&auto=format&fit=crop',
        role: editingUser.role || 'Order Specialist',
        status: 'Active',
        permissions: ['orders_manage'],
      });
      toast(`User ${editingUser.name} added`, 'success');
    }
    setUsers(settingsService.getAdminUsers());
    setEditingUser(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Remove admin access for ${name}?`)) {
      settingsService.deleteAdminUser(id);
      setUsers(settingsService.getAdminUsers());
      toast(`User ${name} removed`, 'info');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E8E3D9] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-[0.2em] text-[#B39458] font-bold">
              Access Control
            </span>
            <span className="text-[10px] bg-[#F4EEDF] text-[#9B7940] px-2 py-0.5 rounded-full font-semibold">
              {users.length} Active Operators
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#24221E] mt-1">
            Admin Operators & Staff
          </h1>
          <p className="text-xs md:text-sm text-[#77736C] mt-1">
            Manage administrative privileges across catalog curators, order specialists, and master tailors.
          </p>
        </div>

        <button
          onClick={() =>
            setEditingUser({
              name: '',
              email: '',
              role: 'Order Specialist',
              status: 'Active',
            })
          }
          className="flex items-center space-x-2 bg-[#B39458] hover:bg-[#9B7940] text-white text-xs font-semibold px-4 py-2.5 rounded-sm transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Admin User</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {users.map((u) => (
          <div key={u.id} className="luxury-card p-5 rounded-sm flex items-start space-x-4 luxury-card-hover">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-[#E8E3D9] shrink-0 bg-[#F7F5F0]">
              <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-1 text-xs flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-[#24221E]">{u.name}</h3>
                <span className="text-[10px] font-semibold bg-[#FAF7F0] text-[#9B7940] border border-[#B39458]/30 px-2 py-0.5 rounded-full">
                  {u.role}
                </span>
              </div>
              <p className="text-[#77736C]">{u.email}</p>
              <div className="text-[11px] text-[#A8A49C] pt-1" suppressHydrationWarning>
                Last Active: {new Date(u.lastLogin).toLocaleDateString()}
              </div>

              <div className="pt-3 border-t border-[#E8E3D9] flex items-center justify-between">
                <span className="text-[10px] text-[#3E7B54] font-semibold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-[#3E7B54] rounded-full inline-block" />
                  <span>{u.status}</span>
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingUser(u)}
                    className="p-1 text-[#77736C] hover:text-[#B39458]"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  {u.role !== 'Super Admin' && (
                    <button
                      onClick={() => handleDelete(u.id, u.name)}
                      className="p-1 text-[#77736C] hover:text-[#A63A3A]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-sm p-6 space-y-4 shadow-2xl border border-[#E8E3D9]">
            <h3 className="font-serif font-bold text-lg text-[#24221E]">
              {editingUser.id ? `Edit User: ${editingUser.name}` : 'Register Admin Operator'}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#24221E] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-[#24221E] block mb-1">Email Address</label>
                <input
                  type="email"
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-[#24221E] block mb-1">Assigned Role</label>
                <select
                  value={editingUser.role || 'Order Specialist'}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E8E3D9] rounded-sm text-xs"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Catalog Director">Catalog Director</option>
                  <option value="Order Specialist">Order Specialist</option>
                  <option value="Concierge Lead">Concierge Lead</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#E8E3D9] text-xs font-semibold">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-[#F7F5F0] text-[#77736C] rounded-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#B39458] text-white rounded-sm"
              >
                Save Operator
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

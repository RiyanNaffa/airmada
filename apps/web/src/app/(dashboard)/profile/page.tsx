'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Edit2, Save, X, AlertCircle } from 'lucide-react'
import { useUserProfile } from '@/hooks/useUserProfile'

export default function ProfilePage() {
  const { user, loading, error, updateProfile } = useUserProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    short_name: '',
    cell_phone: '',
    role: '',
  })

  // Update form data when user data is loaded
  if (user && formData.full_name === '') {
    setFormData({
      full_name: user.user.full_name,
      short_name: user.user.short_name,
      cell_phone: user.user.cell_phone,
      role: user.user.role,
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      setSaveError(null)
      setIsSaving(true)
      await updateProfile({
        full_name: formData.full_name,
        short_name: formData.short_name,
        cell_phone: formData.cell_phone,
        role: formData.role,
      })
      setIsEditing(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        full_name: user.user.full_name,
        short_name: user.user.short_name,
        cell_phone: user.user.cell_phone,
        role: user.user.role,
      })
    }
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-screen-xl space-y-6 p-5 lg:p-7">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-48 rounded-lg bg-slate-200" />
          <div className="h-48 rounded-2xl bg-slate-200" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-screen-xl space-y-6 p-5 lg:p-7">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Error loading user profile</p>
              <p className="mt-1 text-sm">{error || 'Unable to load profile data'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // const initials = user.user.short_name?.substring(0, 2).toUpperCase() || user.user.full_name?.substring(0, 2).toUpperCase() || 'AN'

  return (
    <div className="mx-auto max-w-screen-xl space-y-6 p-5 lg:p-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 lg:text-3xl">
            User Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isEditing ? 'Edit your account information' : 'View and manage your account'}
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:p-8">
        {/* Profile Header Section */}
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          {/* Profile Image */}
          <Image
            src="/dummy/doctor.jpg"
            alt={user.user.full_name}
            width={80}
            height={80}
            className="h-20 w-20 shrink-0 rounded-full object-cover shadow-lg"
          />

          {/* Commented: Initials Avatar */}
          {/* <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-2xl font-bold text-white shadow-lg">
            {initials}
          </div> */}

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-800">{user.user.full_name}</h2>
            <div className="mt-2 flex items-center gap-3">
              <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                {user.user.role}
              </span>
              <span className="text-sm text-slate-500">ID: {user.user.id}</span>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={[
              'flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-all duration-200',
              isEditing
                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
            ].join(' ')}
          >
            {isEditing ? (
              <>
                <X size={16} />
                Cancel
              </>
            ) : (
              <>
                <Edit2 size={16} />
                Edit Profile
              </>
            )}
          </button>
        </div>

        <div className="border-t border-slate-100" />

        {/* Profile Information */}
        {!isEditing ? (
          // View Mode
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Full Name */}
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Full Name
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-800">{user.user.full_name}</p>
              </div>

              {/* Short Name */}
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Short Name
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-800">{user.user.short_name}</p>
              </div>

              {/* Email */}
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Email Address
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-800">{user.email}</p>
              </div>

              {/* Phone */}
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Cell Phone
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-800">{user.user.cell_phone}</p>
              </div>

              {/* Role */}
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Role
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-800">{user.user.role}</p>
              </div>

              {/* Member Since */}
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Member Since
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-800">
                  {new Date(user.loginTime).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <form className="space-y-6">
            {saveError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p className="text-sm font-medium">{saveError}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none"
                />
              </div>

              {/* Short Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Short Name</label>
                <input
                  type="text"
                  name="short_name"
                  value={formData.short_name}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none"
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="mt-2 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-500"
                />
              </div>

              {/* User ID (Read-only) */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">User ID</label>
                <input
                  type="text"
                  value={user.user.id}
                  disabled
                  className="mt-2 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Cell Phone</label>
                <input
                  type="tel"
                  name="cell_phone"
                  value={formData.cell_phone}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-slate-700">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:outline-none"
                >
                  <option value="Manager">Manager</option>
                  <option value="Driver">Driver</option>
                  <option value="Dispatcher">Dispatcher</option>
                </select>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="rounded-lg border border-slate-200 px-6 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-400"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-orange-400" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 lg:p-6">
          <h3 className="font-semibold text-blue-900">Account Information</h3>
          <ul className="mt-3 space-y-2 text-sm text-blue-800">
            <li>• Your User ID is unique and cannot be changed</li>
            <li>• Email address is verified and linked to your account</li>
            <li>• Role determines your access level and features</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 lg:p-6">
          <h3 className="font-semibold text-amber-900">Contact Information</h3>
          <ul className="mt-3 space-y-2 text-sm text-amber-800">
            <li>• Keep your phone number up to date</li>
            <li>• Phone must include country code (+62)</li>
            <li>• We use this for critical notifications</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

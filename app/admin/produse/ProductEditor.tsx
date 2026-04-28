'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'

type Product = {
  id: string
  name: string
  slug: string
  price: number
  stock: number
  purity: string | null
  category: string | null
  short_desc: string | null
  description: string | null
  image_url: string | null
  is_active: boolean
}

type FormData = Omit<Product, 'id'>

const EMPTY: FormData = {
  name: '', slug: '', price: 0, stock: 0,
  purity: '', category: 'Peptide',
  short_desc: '', description: '', image_url: '', is_active: true,
}

function slugify(name: string) {
  return name.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function ProductEditor({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [products, setProducts] = useState(initialProducts)
  const [editing, setEditing] = useState<string | null>(null) // id or 'new'
  const [form, setForm] = useState<FormData>(EMPTY)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  function openNew() {
    setForm(EMPTY)
    setEditing('new')
    setError('')
  }

  function openEdit(p: Product) {
    const { id, ...rest } = p
    setForm(rest)
    setEditing(id)
    setError('')
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked
      : type === 'number' ? Number(value) : value
    setForm(f => ({
      ...f,
      [name]: val,
      ...(name === 'name' && editing === 'new' ? { slug: slugify(value) } : {}),
    }))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}-${form.slug || 'product'}.${ext}`
    const { data, error: uploadErr } = await supabase.storage
      .from('product-images')
      .upload(path, file, { upsert: true })
    if (uploadErr || !data) {
      setError('Eroare la upload imagine: ' + (uploadErr?.message ?? 'necunoscut'))
      setUploading(false)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(data.path)
    setForm(f => ({ ...f, image_url: publicUrl }))
    setUploading(false)
  }

  async function handleSave() {
    if (!form.name || !form.slug || form.price <= 0) {
      setError('Completează cel puțin: Nume, Slug și Preț.')
      return
    }
    setSaving(true)
    setError('')
    const method = editing === 'new' ? 'POST' : 'PUT'
    const body = editing === 'new' ? form : { id: editing, ...form }
    const res = await fetch('/api/admin/products', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? 'Eroare la salvare.')
      setSaving(false)
      return
    }
    setSaving(false)
    setEditing(null)
    router.refresh()
  }

  async function handleDelete(id: string) {
    const res = await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setDeleteConfirm(null)
      router.refresh()
    }
  }

  async function handleToggleActive(p: Product) {
    await fetch('/api/admin/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id, is_active: !p.is_active }),
    })
    router.refresh()
  }

  const inputCls = 'w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Produse ({products.length})</h1>
        <button onClick={openNew}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors">
          + Produs nou
        </button>
      </div>

      {/* Form add/edit */}
      {editing && (
        <div className="mb-8 bg-white border border-blue-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-900 mb-4">
            {editing === 'new' ? 'Produs nou' : 'Editează produs'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-neutral-600 mb-1">Nume *</label>
              <input name="name" value={form.name} onChange={handleChange} className={inputCls} placeholder="Kit BPC-157 10mg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Slug * (URL)</label>
              <input name="slug" value={form.slug} onChange={handleChange} className={inputCls} placeholder="bpc-157-10mg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Categorie</label>
              <input name="category" value={form.category ?? ''} onChange={handleChange} className={inputCls} placeholder="Peptide" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Preț (RON) *</label>
              <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Stoc</label>
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Puritate</label>
              <input name="purity" value={form.purity ?? ''} onChange={handleChange} className={inputCls} placeholder="99.743%" />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="is_active" name="is_active" checked={form.is_active} onChange={handleChange}
                className="h-4 w-4 rounded border-neutral-300 text-blue-600" />
              <label htmlFor="is_active" className="text-sm font-medium text-neutral-700">Activ (vizibil în magazin)</label>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-neutral-600 mb-1">Descriere scurtă</label>
              <input name="short_desc" value={form.short_desc ?? ''} onChange={handleChange} className={inputCls} placeholder="Peptidă liofilizată..." />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-neutral-600 mb-1">Descriere completă</label>
              <textarea name="description" value={form.description ?? ''} onChange={handleChange} rows={4}
                className={inputCls} placeholder="Descriere detaliată..." />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-neutral-600 mb-2">Imagine produs</label>
              <div className="flex items-center gap-4">
                {form.image_url && (
                  <div className="relative h-16 w-16 rounded-md overflow-hidden border border-neutral-200 flex-shrink-0">
                    <Image src={form.image_url} alt="preview" fill className="object-contain p-1" />
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload}
                    className="text-xs text-neutral-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  {uploading && <p className="text-xs text-blue-600">Se încarcă...</p>}
                  <input name="image_url" value={form.image_url ?? ''} onChange={handleChange}
                    className={`${inputCls} text-xs`} placeholder="sau introdu URL manual" />
                </div>
              </div>
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-md p-2">{error}</p>}

          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {saving ? 'Se salvează...' : 'Salvează'}
            </button>
            <button onClick={() => setEditing(null)}
              className="px-5 py-2 bg-neutral-100 text-neutral-700 text-sm font-semibold rounded-md hover:bg-neutral-200 transition-colors">
              Anulează
            </button>
          </div>
        </div>
      )}

      {/* Products table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-neutral-600">Produs</th>
              <th className="px-4 py-3 text-right font-medium text-neutral-600">Preț</th>
              <th className="px-4 py-3 text-right font-medium text-neutral-600">Stoc</th>
              <th className="px-4 py-3 text-center font-medium text-neutral-600">Activ</th>
              <th className="px-4 py-3 text-right font-medium text-neutral-600">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.image_url && (
                      <div className="relative h-10 w-10 rounded overflow-hidden border border-neutral-100 flex-shrink-0">
                        <Image src={p.image_url} alt={p.name} fill className="object-contain" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-neutral-900">{p.name}</p>
                      <p className="text-xs text-neutral-400">{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-medium">{Number(p.price).toFixed(2)} RON</td>
                <td className="px-4 py-3 text-right">
                  <span className={p.stock > 0 ? 'text-green-700 font-medium' : 'text-red-500 font-medium'}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => handleToggleActive(p)}
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                      p.is_active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                    }`}>
                    {p.is_active ? 'Da' : 'Nu'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(p)}
                      className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors">
                      Editează
                    </button>
                    {deleteConfirm === p.id ? (
                      <>
                        <button onClick={() => handleDelete(p.id)}
                          className="px-3 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                          Confirmă ștergere
                        </button>
                        <button onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1 text-xs font-medium bg-neutral-100 text-neutral-600 rounded hover:bg-neutral-200 transition-colors">
                          Anulează
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setDeleteConfirm(p.id)}
                        className="px-3 py-1 text-xs font-medium bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors">
                        Șterge
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="text-center py-10 text-neutral-400">Niciun produs.</p>
        )}
      </div>
    </div>
  )
}

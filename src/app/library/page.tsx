'use client'

import { useEffect, useRef, useState } from 'react'
import { Upload, FileText, Trash2, Loader } from 'lucide-react'
import BottomNav from '@/components/BottomNav'
import { createClient } from '@/lib/supabase/client'

interface Doc {
  id: string
  filename: string
  file_size: number | null
  created_at: string
}

export default function LibraryPage() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function loadDocs() {
    const sb = createClient()
    const { data } = await sb
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
    setDocs(data ?? [])
  }

  useEffect(() => { loadDocs() }, [])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadMsg('')
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    const json = await res.json()
    if (res.ok) {
      setUploadMsg(`Processed ${json.chunks} chunks from "${file.name}"`)
      await loadDocs()
    } else {
      setUploadMsg(json.error ?? 'Upload failed.')
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleDelete(id: string) {
    const sb = createClient()
    await sb.from('documents').delete().eq('id', id)
    setDocs(d => d.filter(x => x.id !== id))
  }

  function fmtSize(bytes: number | null) {
    if (!bytes) return ''
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const isError = uploadMsg.includes('failed') || uploadMsg.includes('error') || uploadMsg.includes('Unsupported') || uploadMsg.includes('Could not')

  return (
    <div className="min-h-screen bg-sage pb-24">
      <div className="px-5 pt-10 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">My Library</h1>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 gradient-primary text-white text-sm font-semibold rounded-full px-4 py-2 shadow-card disabled:opacity-60"
        >
          {uploading ? <Loader size={14} className="animate-spin" /> : <Upload size={14} />}
          {uploading ? 'Processing…' : 'Upload'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt,.md"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {uploadMsg && (
        <p className={`mx-5 mb-4 text-sm rounded-xl px-4 py-2 ${isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-primary-dark'}`}>
          {uploadMsg}
        </p>
      )}

      {docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-card flex items-center justify-center mb-4">
            <FileText size={28} className="text-primary" />
          </div>
          <p className="font-semibold text-ink mb-1">No documents yet</p>
          <p className="text-sm text-muted">Upload a PDF, .txt, or .md file to start chatting with your materials.</p>
        </div>
      ) : (
        <ul className="mx-5 space-y-3">
          {docs.map(doc => (
            <li key={doc.id} className="bg-white rounded-2xl shadow-card px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{doc.filename}</p>
                <p className="text-xs text-muted">
                  {fmtSize(doc.file_size)} · {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(doc.id)}
                className="p-2 text-muted hover:text-red-500 transition-colors"
                aria-label={`Delete ${doc.filename}`}
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <BottomNav active="library" />
    </div>
  )
}

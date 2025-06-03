import React, { useState } from 'react'

export const DocumentUpload: React.FC = () => {
  const [frontImage, setFrontImage] = useState<File | null>(null)
  const [backImage, setBackImage] = useState<File | null>(null)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!frontImage) return setError('Front image is required')

    setLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('front_image', frontImage)
    if (backImage) {
      formData.append('back_image', backImage)
    }

    //formData.append('perform_document_liveness', 'true')
    //formData.append('minimum_age', '18')
    //formData.append('expiration_date_not_detected_action', 'DECLINE')
    //formData.append('invalid_mrz_action', 'DECLINE')
    //formData.append('inconsistent_data_action', 'DECLINE')

    try {
      const res = await fetch('https://dexpay-docs.dextrade.com/rize_dev/kyc/id-verification', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Verification failed')
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow space-y-4">
      <h1 className="text-xl font-bold">Upload Identity Document</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Front Image *</label>
          <input type="file" accept="image/*" onChange={(e) => setFrontImage(e.target.files?.[0] || null)} />
        </div>
        <div>
          <label className="block font-medium">Back Image (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setBackImage(e.target.files?.[0] || null)} />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      {error && <p className="text-red-500">Error: {error}</p>}

      {result && (
        <div className="mt-4 bg-green-100 p-4 rounded">
          <h2 className="font-semibold">Verification Result:</h2>
          <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

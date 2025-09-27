import { AlertTriangle } from "lucide-react"

export function SupabaseConfigWarning() {
  return (
    <div className="mx-auto max-w-md p-6">
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-600 mb-4" />
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Supabase Configuration Required
        </h3>
        <p className="text-sm text-yellow-700 mb-4">
          To use the authentication features, please set up your Supabase credentials in the <code>.env.local</code> file.
        </p>
        <div className="text-left bg-white p-4 rounded border text-xs font-mono">
          <div className="text-gray-600"># Add these to your .env.local file:</div>
          <div className="mt-2">
            <div>NEXT_PUBLIC_SUPABASE_URL=your_supabase_url</div>
            <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key</div>
          </div>
        </div>
        <p className="text-xs text-yellow-600 mt-4">
          Get these values from your Supabase project dashboard → Settings → API
        </p>
      </div>
    </div>
  )
}
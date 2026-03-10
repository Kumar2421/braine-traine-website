import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (!mounted) return
        setAuthed(!!data?.session)
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }

    init()

    const { data: subscription } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (!mounted) return
      setAuthed(!!session)
    })

    return () => {
      mounted = false
      subscription?.subscription?.unsubscribe()
    }
  }, [])

  if (loading) return null

  if (!authed) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  return <>{children}</>
}

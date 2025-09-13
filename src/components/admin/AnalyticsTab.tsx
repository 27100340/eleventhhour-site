'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/browser'
import { format } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AnalyticsTab() {
  const [series, setSeries] = useState<{ date: string; total: number; bookings: number }[]>([])

  useEffect(()=>{
    ;(async ()=>{
      const { data, error } = await supabase.rpc('analytics_timeseries')
      if (!error && data) setSeries(data as any)
    })()
  }, [])

  return (
    <div className="rounded-2xl border bg-white p-4">
      <h2 className="font-semibold mb-4">Bookings over time</h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="bookings" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/browser'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AnalyticsTab() {
  const [series, setSeries] = useState<{ date: string; total: number; bookings: number }[]>([])

  useEffect(() => {
    ;(async () => {
      const { data, error } = await supabase.rpc('analytics_timeseries')
      if (!error && data) setSeries(data as any)
    })()
  }, [])

  return (
    <div className="rounded-(--radius-card) border border-line bg-surface p-5">
      <h2 className="mb-4 text-base">Bookings over time</h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E1" />
            <XAxis dataKey="date" stroke="#8A857E" fontSize={12} />
            <YAxis stroke="#8A857E" fontSize={12} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: '1px solid #E8E6E1',
                fontSize: 13,
              }}
            />
            <Line type="monotone" dataKey="bookings" stroke="#1A5C4A" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

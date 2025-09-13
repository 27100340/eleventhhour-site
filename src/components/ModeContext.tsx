'use client'
import { createContext, useContext, useState } from 'react'

type Mode = 'household' | 'commercial'
type Ctx = { mode: Mode; setMode: (m: Mode) => void }

const Context = createContext<Ctx | null>(null)

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>('household')
  return <Context.Provider value={{ mode, setMode }}>{children}</Context.Provider>
}

export const useMode = () => {
  const ctx = useContext(Context)
  if (!ctx) throw new Error('useMode must be used within ModeProvider')
  return ctx
}

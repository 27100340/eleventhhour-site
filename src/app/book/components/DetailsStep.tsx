'use client'

import PhoneInput from 'react-phone-number-input'
import type { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'

type Props = {
  has: (key: string) => boolean
  register: UseFormRegister<any>
  watch: UseFormWatch<any>
  setValue: UseFormSetValue<any>
  onContinue: () => void
}

export function DetailsStep({ has, register, watch, setValue, onContinue }: Props) {
  const hasNamePair = has('first_name') || has('last_name') || has('name')

  return (
    <div className="grid gap-4">
      {has('email') && (
        <input className="input" type="email" placeholder="Email" {...register('email')} />
      )}
      {hasNamePair && (
        <div className="grid gap-4 md:grid-cols-2">
          {(has('first_name') || has('name')) && (
            <input className="input" placeholder="First name" {...register('firstName')} />
          )}
          {(has('last_name') || has('name')) && (
            <input className="input" placeholder="Last name" {...register('lastName')} />
          )}
        </div>
      )}
      {has('phone') && (
        <div className="grid items-center gap-2 md:grid-cols-[100px_1fr] md:gap-4">
          <label className="text-sm font-medium text-ink">Phone</label>
          <PhoneInput
            defaultCountry="GB"
            value={watch('phone') as any}
            onChange={(v) => setValue('phone', v || '', { shouldValidate: true })}
            className="input"
            placeholder="Phone number"
          />
        </div>
      )}
      <button onClick={onContinue} type="button" className="btn-primary mt-2 py-3 text-base">
        Continue
      </button>
    </div>
  )
}

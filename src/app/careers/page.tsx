'use client'
import { useForm } from 'react-hook-form'
import { Upload, Briefcase, Users, Award, TrendingUp, Check } from 'lucide-react'
import { useState } from 'react'

type FormValues = {
  firstName: string
  lastName: string
  address: string
  city: string
  postcode: string
  email: string
  phone: string
  referredBy: string
  // Work Eligibility
  workEligible: string
  driverLicense: string
  publicLiability: string
  dbs: string
  // Work Preferences
  hoursPerWeek: string
  preferredDays: string
  preferredTime: string
  cleaningAreas: string
  // Work History
  employer1Name: string
  employer1Phone: string
  employer1Position: string
  employer1Duties: string
  employer2Name: string
  employer2Phone: string
  employer2Position: string
  employer2Duties: string
  employer3Name: string
  employer3Phone: string
  employer3Position: string
  employer3Duties: string
  // Skills & References
  cleaningExperience: string
  reference1Name: string
  reference1Phone: string
  reference2Name: string
  reference2Phone: string
  // Position Details
  position: string
  experience: string
  availability: string
  coverLetter: string
  resume: File | null
  // Declaration
  declaration: boolean
}

const perks = [
  {
    Icon: TrendingUp,
    title: 'Career growth',
    desc: 'Clear advancement paths and ongoing training opportunities to help you reach your potential.',
  },
  {
    Icon: Award,
    title: 'Competitive pay',
    desc: 'Industry-leading compensation packages with performance bonuses and incentives.',
  },
  {
    Icon: Users,
    title: 'Supportive team',
    desc: 'Work alongside experienced professionals in a collaborative, friendly environment.',
  },
  {
    Icon: Briefcase,
    title: 'Flexible schedule',
    desc: 'Full-time, part-time, and flexible scheduling options to fit your lifestyle.',
  },
]

const openPositions = [
  {
    title: 'Cleaning professionals',
    desc: 'Join our residential and commercial cleaning teams across London.',
    points: ['Full training provided', 'Flexible hours available', 'Competitive hourly rates'],
  },
  {
    title: 'Maintenance technicians',
    desc: 'Skilled tradespeople for plumbing, electrical, and general maintenance.',
    points: ['Certifications preferred', 'Company vehicle provided', 'Premium pay rates'],
  },
  {
    title: 'Customer service representatives',
    desc: 'Help our customers book services and resolve inquiries.',
    points: ['Remote options available', 'Full benefits package', 'Career progression opportunities'],
  },
  {
    title: 'Operations coordinators',
    desc: 'Manage scheduling, logistics, and team coordination.',
    points: ['Office-based role', 'Organizational skills essential', 'Growth into management'],
  },
]

function FormSection({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-line pt-6">
      <legend className="sr-only">{title}</legend>
      <h3 className="text-base">{title}</h3>
      {hint && <p className="mt-1 text-sm text-ink-soft">{hint}</p>}
      <div className="mt-4 grid gap-4">{children}</div>
    </fieldset>
  )
}

export default function CareersPage() {
  const { register, handleSubmit, reset, formState: { isSubmitting, isSubmitSuccessful, errors } } = useForm<FormValues>()
  const [fileName, setFileName] = useState<string>('')
  const [submitError, setSubmitError] = useState<string>('')

  const onSubmit = async (data: FormValues) => {
    try {
      setSubmitError('')
      const FORM_ID = process.env.NEXT_PUBLIC_FORMSPARK_CAREERS_ID || 'J4MBLqxwy'

      // Formspark expects JSON, not FormData
      const submissionData: Record<string, any> = {
        // Personal Information
        firstName: data.firstName,
        lastName: data.lastName,
        address: data.address,
        city: data.city,
        postcode: data.postcode,
        email: data.email,
        phone: data.phone,
        referredBy: data.referredBy,
        // Work Eligibility
        workEligible: data.workEligible,
        driverLicense: data.driverLicense,
        publicLiability: data.publicLiability,
        dbs: data.dbs,
        // Work Preferences
        hoursPerWeek: data.hoursPerWeek,
        preferredDays: data.preferredDays,
        preferredTime: data.preferredTime,
        cleaningAreas: data.cleaningAreas,
        // Work History
        employer1Name: data.employer1Name,
        employer1Phone: data.employer1Phone,
        employer1Position: data.employer1Position,
        employer1Duties: data.employer1Duties,
        employer2Name: data.employer2Name,
        employer2Phone: data.employer2Phone,
        employer2Position: data.employer2Position,
        employer2Duties: data.employer2Duties,
        employer3Name: data.employer3Name,
        employer3Phone: data.employer3Phone,
        employer3Position: data.employer3Position,
        employer3Duties: data.employer3Duties,
        // Skills & References
        cleaningExperience: data.cleaningExperience,
        reference1Name: data.reference1Name,
        reference1Phone: data.reference1Phone,
        reference2Name: data.reference2Name,
        reference2Phone: data.reference2Phone,
        // Position Details
        position: data.position,
        experience: data.experience,
        availability: data.availability,
        coverLetter: data.coverLetter,
      }

      const fileInput = document.querySelector('input[name="resume"]') as HTMLInputElement
      if (fileInput?.files?.[0]) {
        submissionData.resumeFileName = fileInput.files[0].name
        submissionData.note = 'Resume attached - please contact applicant for file'
      }

      const response = await fetch(`https://submit-form.com/${FORM_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(submissionData),
      })

      if (!response.ok) {
        let errorMessage = 'Form submission failed'
        try {
          const responseData = await response.json()
          errorMessage = responseData.error || responseData.message || errorMessage
        } catch {
          await response.text()
        }
        throw new Error(errorMessage)
      }

      await response.json()
      reset()
      setFileName('')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'There was an error submitting your application. Please try again.')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
    }
  }

  const fieldError = (message?: string) =>
    message ? <p className="mt-1 text-sm font-medium text-red-700">{message}</p> : null

  return (
    <div>
      {/* Hero */}
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
          <div className="max-w-3xl">
            <p className="eyebrow">Careers</p>
            <h1 className="mt-4">Join our team</h1>
            <p className="mt-6 text-xl leading-relaxed text-ink-soft">
              Build your career with London&rsquo;s most trusted cleaning and maintenance service.
              We&rsquo;re looking for passionate professionals to join our growing team.
            </p>
          </div>
        </div>
        <div aria-hidden="true" className="tick-rule" />
      </section>

      {/* Why join */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="eyebrow">Why Eleventh Hour</p>
            <h2 className="mt-3">Work that works for you</h2>
          </div>
          <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map(({ Icon, title, desc }) => (
              <div key={title}>
                <div className="flex h-10 w-10 items-center justify-center rounded-(--radius-ctl) bg-accent-tint">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="mt-4 text-base">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open positions */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="eyebrow">Open positions</p>
            <h2 className="mt-3">Where you could fit in</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {openPositions.map(({ title, desc, points }) => (
              <div key={title} className="card p-7">
                <h3>{title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{desc}</p>
                <ul className="mt-4 space-y-2 text-sm text-ink-soft">
                  {points.map((point) => (
                    <li key={point} className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 shrink-0 text-accent" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application form */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="card p-7 md:p-10">
            <p className="eyebrow">Application</p>
            <h2 className="mt-3">Apply now</h2>
            <p className="mt-3 text-ink-soft">
              Complete the form below to submit your application. We review all applications and will
              contact qualified candidates within 5 business days.
            </p>

            {isSubmitSuccessful ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-tint">
                  <Check className="h-8 w-8 text-accent" />
                </div>
                <h3 className="mt-6 text-2xl">Application submitted</h3>
                <p className="mt-3 text-ink-soft">
                  Thank you for your interest in joining Eleventh Hour. We&rsquo;ve received your
                  application and will review it carefully.
                </p>
                <p className="mt-4 text-sm text-ink-faint">
                  We&rsquo;ll be in touch within 5 business days if your qualifications match our
                  current openings.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-8">
                <FormSection title="Personal information">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <input
                        {...register('firstName', { required: 'First name is required' })}
                        placeholder="First name *"
                        className="input"
                      />
                      {fieldError(errors.firstName?.message)}
                    </div>
                    <div>
                      <input
                        {...register('lastName', { required: 'Last name is required' })}
                        placeholder="Last name *"
                        className="input"
                      />
                      {fieldError(errors.lastName?.message)}
                    </div>
                  </div>
                  <div>
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      placeholder="Email address *"
                      type="email"
                      className="input"
                    />
                    {fieldError(errors.email?.message)}
                  </div>
                  <div>
                    <input
                      {...register('phone', { required: 'Phone number is required' })}
                      placeholder="Phone number *"
                      type="tel"
                      className="input"
                    />
                    {fieldError(errors.phone?.message)}
                  </div>
                </FormSection>

                <FormSection title="Position details">
                  <div>
                    <select
                      {...register('position', { required: 'Please select a position' })}
                      className="input"
                    >
                      <option value="">Select position of interest *</option>
                      <option value="Cleaning Professional">Cleaning Professional</option>
                      <option value="Maintenance Technician">Maintenance Technician</option>
                      <option value="Plumber">Plumber</option>
                      <option value="Electrician">Electrician</option>
                      <option value="Gas Engineer">Gas Engineer / Boiler Specialist</option>
                      <option value="Handyman">Handyman</option>
                      <option value="Gardener">Gardener / Landscaper</option>
                      <option value="Pest Control Technician">Pest Control Technician</option>
                      <option value="Locksmith">Locksmith</option>
                      <option value="Customer Service">Customer Service Representative</option>
                      <option value="Operations Coordinator">Operations Coordinator</option>
                      <option value="Other">Other</option>
                    </select>
                    {fieldError(errors.position?.message)}
                  </div>
                  <div>
                    <select
                      {...register('experience', { required: 'Please select your experience level' })}
                      className="input"
                    >
                      <option value="">Years of relevant experience *</option>
                      <option value="Less than 1 year">Less than 1 year</option>
                      <option value="1-2 years">1-2 years</option>
                      <option value="3-5 years">3-5 years</option>
                      <option value="5-10 years">5-10 years</option>
                      <option value="10+ years">10+ years</option>
                    </select>
                    {fieldError(errors.experience?.message)}
                  </div>
                  <div>
                    <select
                      {...register('availability', { required: 'Please select your availability' })}
                      className="input"
                    >
                      <option value="">Availability *</option>
                      <option value="Full-time">Full-time (40+ hours/week)</option>
                      <option value="Part-time">Part-time (20-30 hours/week)</option>
                      <option value="Flexible">Flexible hours</option>
                      <option value="Weekends only">Weekends only</option>
                      <option value="Immediate">Available immediately</option>
                      <option value="2 weeks">Available in 2 weeks</option>
                      <option value="1 month">Available in 1 month</option>
                    </select>
                    {fieldError(errors.availability?.message)}
                  </div>
                </FormSection>

                <FormSection title="Address">
                  <input {...register('address')} placeholder="Address" className="input" />
                  <div className="grid gap-4 md:grid-cols-2">
                    <input {...register('city')} placeholder="City" className="input" />
                    <input {...register('postcode')} placeholder="Postcode" className="input" />
                  </div>
                  <input {...register('referredBy')} placeholder="Referred by (optional)" className="input" />
                </FormSection>

                <FormSection title="Work eligibility">
                  {(
                    [
                      { name: 'workEligible', label: 'Are you legally eligible to work in the U.K.?' },
                      { name: 'driverLicense', label: 'Do you have a valid driver’s license?' },
                      { name: 'publicLiability', label: 'Do you have public liability insurance?' },
                      { name: 'dbs', label: 'Do you have a valid DBS (Disclosure and Barring Service) check?' },
                    ] as const
                  ).map(({ name, label }) => (
                    <div key={name}>
                      <p className="mb-2 text-sm font-medium text-ink">{label}</p>
                      <div className="flex gap-5">
                        {['Yes', 'No'].map((option) => (
                          <label key={option} className="flex items-center gap-2 text-sm">
                            <input type="radio" {...register(name)} value={option} className="h-4 w-4 accent-(--color-accent)" />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </FormSection>

                <FormSection title="Work preferences">
                  <div>
                    <p className="mb-2 text-sm font-medium text-ink">Hours per week desired</p>
                    <div className="flex flex-wrap gap-4">
                      {['0-10', '10-20', '20-30', '30-40', '40+'].map((range) => (
                        <label key={range} className="flex items-center gap-2 text-sm">
                          <input type="checkbox" {...register('hoursPerWeek')} value={range} className="h-4 w-4 accent-(--color-accent)" />
                          <span>{range}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-ink">Preferred days</p>
                    <div className="flex gap-5">
                      {['Weekdays', 'Weekends'].map((day) => (
                        <label key={day} className="flex items-center gap-2 text-sm">
                          <input type="checkbox" {...register('preferredDays')} value={day} className="h-4 w-4 accent-(--color-accent)" />
                          <span>{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-ink">Preferred time</p>
                    <div className="flex flex-wrap gap-5">
                      {['Morning', 'Afternoon', 'Evening'].map((time) => (
                        <label key={time} className="flex items-center gap-2 text-sm">
                          <input type="checkbox" {...register('preferredTime')} value={time} className="h-4 w-4 accent-(--color-accent)" />
                          <span>{time}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <textarea
                    {...register('cleaningAreas')}
                    placeholder="Areas of preference for cleaning jobs (optional)"
                    className="input min-h-[100px]"
                  />
                </FormSection>

                <FormSection title="Work history" hint="Please list your 3 most recent employers below.">
                  {(
                    [
                      { prefix: 'employer1', label: 'Employer 1' },
                      { prefix: 'employer2', label: 'Employer 2' },
                      { prefix: 'employer3', label: 'Employer 3' },
                    ] as const
                  ).map(({ prefix, label }, index, all) => (
                    <div key={prefix} className={index < all.length - 1 ? 'border-b border-line pb-5' : ''}>
                      <h4 className="mb-3 text-sm font-semibold text-ink">{label}</h4>
                      <div className="grid gap-3">
                        <div className="grid gap-3 md:grid-cols-2">
                          <input {...register(`${prefix}Name`)} placeholder="Employer's name" className="input" />
                          <input {...register(`${prefix}Phone`)} placeholder="Phone" className="input" />
                        </div>
                        <input {...register(`${prefix}Position`)} placeholder="Position held" className="input" />
                        <textarea {...register(`${prefix}Duties`)} placeholder="Duties" className="input min-h-[80px]" />
                      </div>
                    </div>
                  ))}
                </FormSection>

                <FormSection title="Cleaning knowledge & skills">
                  <textarea
                    {...register('cleaningExperience')}
                    placeholder="Describe your cleaning experience and what makes you a true professional cleaner"
                    className="input min-h-[150px]"
                  />
                </FormSection>

                <FormSection title="References" hint="Please provide two professional references (no family members).">
                  {(['reference1', 'reference2'] as const).map((prefix, index) => (
                    <div key={prefix} className="grid gap-4 md:grid-cols-2">
                      <input {...register(`${prefix}Name`)} placeholder={`Reference ${index + 1} name`} className="input" />
                      <input {...register(`${prefix}Phone`)} placeholder={`Reference ${index + 1} phone`} className="input" />
                    </div>
                  ))}
                </FormSection>

                <FormSection title="Cover letter">
                  <div>
                    <textarea
                      {...register('coverLetter', {
                        required: 'Please tell us why you\'d be a great fit',
                        minLength: {
                          value: 100,
                          message: 'Please provide at least 100 characters'
                        }
                      })}
                      placeholder="Tell us why you'd be a great fit for this role and what makes you passionate about this work. *"
                      className="input min-h-[180px]"
                    />
                    {fieldError(errors.coverLetter?.message)}
                  </div>
                </FormSection>

                <FormSection title="Resume/CV">
                  <label className="block">
                    <div className="cursor-pointer rounded-(--radius-card) border-2 border-dashed border-line p-8 text-center transition-colors duration-150 hover:border-accent hover:bg-accent-tint/40">
                      <Upload className="mx-auto mb-3 h-10 w-10 text-ink-faint" />
                      <p className="font-medium text-ink">
                        {fileName ? fileName : 'Click to upload your resume/CV'}
                      </p>
                      <p className="mt-1 text-sm text-ink-faint">PDF, DOC, or DOCX (max 5MB)</p>
                      <input
                        type="file"
                        name="resume"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  </label>
                </FormSection>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full py-3.5 text-base"
                >
                  {isSubmitting ? 'Submitting application…' : 'Submit application'}
                </button>

                {submitError && (
                  <p className="text-center font-medium text-red-700">{submitError}</p>
                )}

                <p className="text-center text-sm text-ink-faint">
                  By submitting this form, you agree to our{' '}
                  <a href="/privacy" className="font-medium text-accent hover:text-accent-dark">Privacy policy</a> and{' '}
                  <a href="/terms" className="font-medium text-accent hover:text-accent-dark">Terms of service</a>.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Equal opportunity */}
      <section className="bg-surface py-14">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h3 className="text-base">Equal opportunity employer</h3>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Eleventh Hour is committed to creating a diverse and inclusive workplace. We are an equal
            opportunity employer and do not discriminate on the basis of race, national origin, gender,
            gender identity, sexual orientation, protected veteran status, disability, age, or other
            legally protected status.
          </p>
        </div>
      </section>
    </div>
  )
}

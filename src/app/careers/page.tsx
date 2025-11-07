'use client'
import { useForm } from 'react-hook-form'
import { Upload, Briefcase, Users, Award, TrendingUp } from 'lucide-react'
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

export default function CareersPage() {
  const { register, handleSubmit, reset, formState: { isSubmitting, isSubmitSuccessful, errors } } = useForm<FormValues>()
  const [fileName, setFileName] = useState<string>('')
  const [submitError, setSubmitError] = useState<string>('')

  const onSubmit = async (data: FormValues) => {
    try {
      setSubmitError('')
      const FORM_ID = process.env.NEXT_PUBLIC_FORMSPARK_CAREERS_ID || 'J4MBLqxwy'

      console.log('Submitting to Formspark with ID:', FORM_ID)

      // Prepare submission data as JSON (Formspark expects JSON, not FormData)
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

      // Check if file was uploaded
      const fileInput = document.querySelector('input[name="resume"]') as HTMLInputElement
      if (fileInput?.files?.[0]) {
        console.log('File selected:', fileInput.files[0].name)
        submissionData.resumeFileName = fileInput.files[0].name
        submissionData.note = 'Resume attached - please contact applicant for file'
      }

      console.log('Submission data:', submissionData)

      const response = await fetch(`https://submit-form.com/${FORM_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(submissionData),
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        let errorMessage = 'Form submission failed'
        try {
          const responseData = await response.json()
          console.log('Error response:', responseData)
          errorMessage = responseData.error || responseData.message || errorMessage
        } catch (e) {
          const text = await response.text()
          console.log('Error response text:', text)
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('Success response:', result)

      // Reset form on success
      reset()
      setFileName('')
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitError(error instanceof Error ? error.message : 'There was an error submitting your application. Please try again.')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-sage/10">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-cream to-sage/20 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-charcoal">Join Our Team</h1>
          <p className="mt-4 text-lg md:text-xl text-charcoal max-w-3xl">
            Build your career with London's most trusted cleaning and maintenance service. We're looking for passionate professionals to join our growing team.
          </p>
        </div>
      </div>

      {/* Why Join Us Section */}
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Work With Eleventh Hour?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-amber/10 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-amber" />
            </div>
            <h3 className="font-bold text-lg mb-2">Career Growth</h3>
            <p className="text-gray-600 text-sm">
              Clear advancement paths and ongoing training opportunities to help you reach your potential.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-amber/10 rounded-full flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-amber" />
            </div>
            <h3 className="font-bold text-lg mb-2">Competitive Pay</h3>
            <p className="text-gray-600 text-sm">
              Industry-leading compensation packages with performance bonuses and incentives.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-amber/10 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-amber" />
            </div>
            <h3 className="font-bold text-lg mb-2">Supportive Team</h3>
            <p className="text-gray-600 text-sm">
              Work alongside experienced professionals in a collaborative, friendly environment.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-amber/10 rounded-full flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-amber" />
            </div>
            <h3 className="font-bold text-lg mb-2">Flexible Schedule</h3>
            <p className="text-gray-600 text-sm">
              Full-time, part-time, and flexible scheduling options to fit your lifestyle.
            </p>
          </div>
        </div>
      </div>

      {/* Open Positions */}
      <div className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Open Positions</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-xl mb-2">Cleaning Professionals</h3>
              <p className="text-gray-600 mb-4">Join our residential and commercial cleaning teams across London.</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Full training provided</li>
                <li>• Flexible hours available</li>
                <li>• Competitive hourly rates</li>
              </ul>
            </div>
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-xl mb-2">Maintenance Technicians</h3>
              <p className="text-gray-600 mb-4">Skilled tradespeople for plumbing, electrical, and general maintenance.</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Certifications preferred</li>
                <li>• Company vehicle provided</li>
                <li>• Premium pay rates</li>
              </ul>
            </div>
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-xl mb-2">Customer Service Representatives</h3>
              <p className="text-gray-600 mb-4">Help our customers book services and resolve inquiries.</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Remote options available</li>
                <li>• Full benefits package</li>
                <li>• Career progression opportunities</li>
              </ul>
            </div>
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-xl mb-2">Operations Coordinators</h3>
              <p className="text-gray-600 mb-4">Manage scheduling, logistics, and team coordination.</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Office-based role</li>
                <li>• Organizational skills essential</li>
                <li>• Growth into management</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Application Form */}
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="card p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-2">Apply Now</h2>
          <p className="text-gray-600 mb-8">
            Complete the form below to submit your application. We review all applications and will contact qualified candidates within 5 business days.
          </p>

          {isSubmitSuccessful ? (
            <div className="text-center py-12">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">Application Submitted!</h3>
              <p className="text-gray-600 mb-6">
                Thank you for your interest in joining Eleventh Hour. We've received your application and will review it carefully.
              </p>
              <p className="text-sm text-gray-500">
                We'll be in touch within 5 business days if your qualifications match our current openings.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
              {/* Personal Information */}
              <div>
                <h3 className="font-bold text-lg mb-4">Personal Information</h3>
                <div className="grid gap-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <input
                        {...register('firstName', { required: 'First name is required' })}
                        placeholder="First name *"
                        className="input w-full"
                      />
                      {errors.firstName && (
                        <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <input
                        {...register('lastName', { required: 'Last name is required' })}
                        placeholder="Last name *"
                        className="input w-full"
                      />
                      {errors.lastName && (
                        <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
                      )}
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
                      className="input w-full"
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <input
                      {...register('phone', { required: 'Phone number is required' })}
                      placeholder="Phone number *"
                      type="tel"
                      className="input w-full"
                    />
                    {errors.phone && (
                      <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Position Details */}
              <div>
                <h3 className="font-bold text-lg mb-4">Position Details</h3>
                <div className="grid gap-4">
                  <div>
                    <select
                      {...register('position', { required: 'Please select a position' })}
                      className="input w-full"
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
                    {errors.position && (
                      <p className="text-red-600 text-sm mt-1">{errors.position.message}</p>
                    )}
                  </div>
                  <div>
                    <select
                      {...register('experience', { required: 'Please select your experience level' })}
                      className="input w-full"
                    >
                      <option value="">Years of relevant experience *</option>
                      <option value="Less than 1 year">Less than 1 year</option>
                      <option value="1-2 years">1-2 years</option>
                      <option value="3-5 years">3-5 years</option>
                      <option value="5-10 years">5-10 years</option>
                      <option value="10+ years">10+ years</option>
                    </select>
                    {errors.experience && (
                      <p className="text-red-600 text-sm mt-1">{errors.experience.message}</p>
                    )}
                  </div>
                  <div>
                    <select
                      {...register('availability', { required: 'Please select your availability' })}
                      className="input w-full"
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
                    {errors.availability && (
                      <p className="text-red-600 text-sm mt-1">{errors.availability.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="font-bold text-lg mb-4">Address Information</h3>
                <div className="grid gap-4">
                  <input
                    {...register('address')}
                    placeholder="Address"
                    className="input w-full"
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      {...register('city')}
                      placeholder="City"
                      className="input w-full"
                    />
                    <input
                      {...register('postcode')}
                      placeholder="Postcode"
                      className="input w-full"
                    />
                  </div>
                  <input
                    {...register('referredBy')}
                    placeholder="Referred By (Optional)"
                    className="input w-full"
                  />
                </div>
              </div>

              {/* Work Eligibility */}
              <div>
                <h3 className="font-bold text-lg mb-4">Work Eligibility</h3>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Are you legally eligible to work in the U.K.?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input type="radio" {...register('workEligible')} value="Yes" className="w-4 h-4" />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" {...register('workEligible')} value="No" className="w-4 h-4" />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Do you have a valid driver&apos;s license?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input type="radio" {...register('driverLicense')} value="Yes" className="w-4 h-4" />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" {...register('driverLicense')} value="No" className="w-4 h-4" />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Do you have public liability insurance?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input type="radio" {...register('publicLiability')} value="Yes" className="w-4 h-4" />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" {...register('publicLiability')} value="No" className="w-4 h-4" />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Do you have a valid DBS (Disclosure and Barring Service) check?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input type="radio" {...register('dbs')} value="Yes" className="w-4 h-4" />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" {...register('dbs')} value="No" className="w-4 h-4" />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Preferences */}
              <div>
                <h3 className="font-bold text-lg mb-4">Work Preferences</h3>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Hours per week desired</label>
                    <div className="flex flex-wrap gap-3">
                      {['0-10', '10-20', '20-30', '30-40', '40+'].map((range) => (
                        <label key={range} className="flex items-center gap-2">
                          <input type="checkbox" {...register('hoursPerWeek')} value={range} className="w-4 h-4" />
                          <span>{range}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred days</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" {...register('preferredDays')} value="Weekdays" className="w-4 h-4" />
                        <span>Weekdays</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" {...register('preferredDays')} value="Weekends" className="w-4 h-4" />
                        <span>Weekends</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred time</label>
                    <div className="flex flex-wrap gap-4">
                      {['Morning', 'Afternoon', 'Evening'].map((time) => (
                        <label key={time} className="flex items-center gap-2">
                          <input type="checkbox" {...register('preferredTime')} value={time} className="w-4 h-4" />
                          <span>{time}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <textarea
                    {...register('cleaningAreas')}
                    placeholder="Areas of preference for cleaning jobs (optional)"
                    className="input min-h-[100px] w-full"
                  />
                </div>
              </div>

              {/* Work History */}
              <div>
                <h3 className="font-bold text-lg mb-4">Work History / Experience</h3>
                <p className="text-sm text-gray-600 mb-4">Please list your 3 most recent employers below.</p>
                {/* Employer 1 */}
                <div className="mb-6 pb-6 border-b">
                  <h4 className="font-semibold text-gray-800 mb-3">Employer 1</h4>
                  <div className="grid gap-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      <input
                        {...register('employer1Name')}
                        placeholder="Employer's Name"
                        className="input w-full"
                      />
                      <input
                        {...register('employer1Phone')}
                        placeholder="Phone"
                        className="input w-full"
                      />
                    </div>
                    <input
                      {...register('employer1Position')}
                      placeholder="Position Held"
                      className="input w-full"
                    />
                    <textarea
                      {...register('employer1Duties')}
                      placeholder="Duties"
                      className="input min-h-[80px] w-full"
                    />
                  </div>
                </div>
                {/* Employer 2 */}
                <div className="mb-6 pb-6 border-b">
                  <h4 className="font-semibold text-gray-800 mb-3">Employer 2</h4>
                  <div className="grid gap-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      <input
                        {...register('employer2Name')}
                        placeholder="Employer's Name"
                        className="input w-full"
                      />
                      <input
                        {...register('employer2Phone')}
                        placeholder="Phone"
                        className="input w-full"
                      />
                    </div>
                    <input
                      {...register('employer2Position')}
                      placeholder="Position Held"
                      className="input w-full"
                    />
                    <textarea
                      {...register('employer2Duties')}
                      placeholder="Duties"
                      className="input min-h-[80px] w-full"
                    />
                  </div>
                </div>
                {/* Employer 3 */}
                <div className="mb-6 pb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Employer 3</h4>
                  <div className="grid gap-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      <input
                        {...register('employer3Name')}
                        placeholder="Employer's Name"
                        className="input w-full"
                      />
                      <input
                        {...register('employer3Phone')}
                        placeholder="Phone"
                        className="input w-full"
                      />
                    </div>
                    <input
                      {...register('employer3Position')}
                      placeholder="Position Held"
                      className="input w-full"
                    />
                    <textarea
                      {...register('employer3Duties')}
                      placeholder="Duties"
                      className="input min-h-[80px] w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Cleaning Knowledge & Skills */}
              <div>
                <h3 className="font-bold text-lg mb-4">Cleaning Knowledge &amp; Skills</h3>
                <textarea
                  {...register('cleaningExperience')}
                  placeholder="Describe your cleaning experience and what makes you a true professional cleaner"
                  className="input min-h-[150px] w-full"
                />
              </div>

              {/* References */}
              <div>
                <h3 className="font-bold text-lg mb-4">References</h3>
                <p className="text-sm text-gray-600 mb-4">Please provide two professional references (no family members).</p>
                {/* Reference 1 */}
                <div className="mb-4 pb-4 border-b">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      {...register('reference1Name')}
                      placeholder="Reference 1 Name"
                      className="input w-full"
                    />
                    <input
                      {...register('reference1Phone')}
                      placeholder="Reference 1 Phone"
                      className="input w-full"
                    />
                  </div>
                </div>
                {/* Reference 2 */}
                <div className="mb-4 pb-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      {...register('reference2Name')}
                      placeholder="Reference 2 Name"
                      className="input w-full"
                    />
                    <input
                      {...register('reference2Phone')}
                      placeholder="Reference 2 Phone"
                      className="input w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <h3 className="font-bold text-lg mb-4">Cover Letter</h3>
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
                    className="input min-h-[180px] w-full"
                  />
                  {errors.coverLetter && (
                    <p className="text-red-600 text-sm mt-1">{errors.coverLetter.message}</p>
                  )}
                </div>
              </div>

              {/* Resume Upload */}
              <div>
                <h3 className="font-bold text-lg mb-4">Resume/CV</h3>
                <div>
                  <label className="block">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-amber hover:bg-amber/5 transition-colors cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="font-medium mb-1">
                        {fileName ? fileName : 'Click to upload your resume/CV'}
                      </p>
                      <p className="text-sm text-gray-500">
                        PDF, DOC, or DOCX (max 5MB)
                      </p>
                      <input
                        type="file"
                        name="resume"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full text-lg py-4"
              >
                {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
              </button>

              {submitError && (
                <p className="text-red-600 text-center font-medium">{submitError}</p>
              )}

              <p className="text-sm text-gray-500 text-center">
                By submitting this form, you agree to our <a href="/privacy" className="text-amber hover:underline">Privacy Policy</a> and <a href="/terms" className="text-amber hover:underline">Terms of Service</a>.
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Equal Opportunity Statement */}
      <div className="bg-gray-50 py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h3 className="font-bold text-xl mb-4">Equal Opportunity Employer</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Eleventh Hour is committed to creating a diverse and inclusive workplace. We are an equal opportunity employer and do not discriminate on the basis of race, national origin, gender, gender identity, sexual orientation, protected veteran status, disability, age, or other legally protected status.
          </p>
        </div>
      </div>
    </div>
  )
}

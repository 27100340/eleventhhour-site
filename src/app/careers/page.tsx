'use client'
import { useForm } from 'react-hook-form'
import { Upload, Briefcase, Users, Award, TrendingUp } from 'lucide-react'
import { useState } from 'react'

type FormValues = {
  firstName: string
  lastName: string
  email: string
  phone: string
  position: string
  experience: string
  availability: string
  coverLetter: string
  resume: File | null
}

const FORM_ID = process.env.NEXT_PUBLIC_FORMSPREE_CAREERS_ID!

export default function CareersPage() {
  const { register, handleSubmit, formState: { isSubmitting, isSubmitSuccessful, errors } } = useForm<FormValues>()
  const [fileName, setFileName] = useState<string>('')

  const onSubmit = async (data: FormValues) => {
    const fd = new FormData()
    fd.append('FirstName', data.firstName)
    fd.append('LastName', data.lastName)
    fd.append('Email', data.email)
    fd.append('Phone', data.phone)
    fd.append('Position', data.position)
    fd.append('Experience', data.experience)
    fd.append('Availability', data.availability)
    fd.append('CoverLetter', data.coverLetter)

    // Handle file upload
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput?.files?.[0]) {
      fd.append('Resume', fileInput.files[0])
    }

    await fetch(`https://formspree.io/f/${FORM_ID}`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: fd,
    })
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
                disabled={isSubmitting}
                className="btn-primary w-full text-lg py-4"
              >
                {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
              </button>

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

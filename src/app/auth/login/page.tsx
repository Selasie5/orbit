"use client"
import React, { useState } from 'react'
import { Formik, Form, Field } from 'formik'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/authContext'


const page = () => {
  const router = useRouter()
  const { signIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  
  
  const initialValues = {
    email: '',
    password: ''
  }

  const handleSubmit = async (values: typeof initialValues) => {
    setIsLoading(true)
    
    try {
      const { data, error } = await signIn(values.email, values.password)
      
      if (error) {
        console.error('Login error:', error)
        alert('Login failed: ' + error.message)
        return
      }
      
      if (data.user) {
        console.log('Login successful:', data.user)
        // Redirect to dashboard after successful login
        router.push('/home')
      }
    } catch (error) {
      console.error('Login process error:', error)
      alert('An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }
  return (
   <main className='flex flex-col justify-center items-center  w-full min-h-screen'>
<div className='flex flex-col justify-center items-start bg-white text-black p-8 rounded-lg shadow-lg w-1/2 h-auto'>
<h1 className='text-2xl font-semibold'>Welcome back to Orbit</h1>
<p className='text-gray-500 text-sm'>Log in to pick up where you left off - your network is waiting for you.</p>
<div className='flex flex-col justify-center items-start w-full mt-4 gap-4'>

  <Formik initialValues={initialValues} onSubmit={handleSubmit}>
    <Form className='flex flex-col gap-4 w-full'>
      <div className='space-y-2'>
        <Label htmlFor="email">Email</Label>
        <Field name="email" type="email" as={Input} placeholder="Email" />
      </div>
      <div className='space-y-2'>
        <Label htmlFor="password">Password</Label>
        <Field name="password" type="password" as={Input} placeholder="Password" />
      </div>
      <button 
        type="submit" 
        disabled={isLoading}
        className='bg-lime-200 text-black p-2 rounded hover:bg-lime-300 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {isLoading ? 'Logging in...' : 'Log In'}
      </button>
    </Form>
  </Formik>
</div>
<div className='mt-4'>
<span className=''>
  Don't have an account? <a href="/auth/signup/profile" className="text-green-950 hover:underline">Sign Up</a>
</span>
</div>

</div>
   </main>
  )
}

export default page



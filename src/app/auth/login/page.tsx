"use client"
import React from 'react'
import { Formik, Form, Field } from 'formik'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/utils/supabase/client'


const page = () => {
  const initialValues = {
    email: '',
    password: ''
  }

  const handleSubmit = async (values: typeof initialValues) => {
  const {data, error} = await createClient().auth.signInWithPassword({
    email: values.email,
    password: values.password
  }
)
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
      <button type="submit" className='bg-lime-200 text-black p-2 rounded hover:bg-lime-300 hover:cursor-pointer'>
        Log In
      </button>
    </Form>
  </Formik>
</div>
<div className='mt-4'>
<span className=''>
  Don't have an account? <a href="/auth/signup" className="text-green-950 hover:underline">Sign Up</a>
</span>
</div>

</div>
   </main>
  )
}

export default page



"use client"
import React from 'react'
import { Form, Field, Formik } from 'formik'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
const page = () => {

  const router = useRouter();
  const initialValues = {
      fullName: '',
      email: '',
      password: ''
    }
  
    const handleSubmit = async (values: typeof initialValues) => {
    const {data, error} = await createClient().auth.signInWithPassword({
      email: values.email,
      password: values.password
    }
  )
  router.push("auth/signup/profile")
}
  return (
     <main className='flex flex-col justify-center items-center  w-full min-h-screen'>
<div className='flex flex-col justify-center items-start bg-white text-black p-8 rounded-lg shadow-lg w-1/2 h-auto'>
<h1 className='text-2xl font-semibold'>Create Your Orbit Account</h1>
<p className='text-gray-500 text-sm'>Takes less than 60 seconds to join. All you need is your student email</p>
<div className='flex flex-col justify-center items-start w-full mt-4 gap-4'>
  <Formik initialValues={initialValues} onSubmit={handleSubmit}>
    <Form className='flex flex-col gap-4 w-full'>
      <div className='space-y-2'>
 <Label htmlFor="email">Full Name</Label>
        <Field name="name" type="name" as={Input} placeholder="e.g.Akoto James" />
      </div>
      <div className='space-y-2'>
        <Label htmlFor="email">Student Email</Label>
        <Field name="email" type="email" as={Input} placeholder="e.g. jkakoto002@st.ug.edu.gh" />
      </div>
      <div className='space-y-2'>
        <Label htmlFor="password">Password</Label>
        <Field name="password" type="password" as={Input} placeholder="Password" />
      </div>
      <button type="submit" className='bg-lime-200 text-black p-2 rounded hover:bg-lime-300 hover:cursor-pointer'>
        Sign up & Connect
      </button>
    </Form>
  </Formik>
</div>
<div className='mt-4'>
<span className=''>
  Already have an account? <a href="/auth/signup" className="text-green-950 hover:underline">Log In</a>
</span>
</div>
</div>
   </main>
  )
}

export default page

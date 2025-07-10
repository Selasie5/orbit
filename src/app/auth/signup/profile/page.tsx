"use client"
import React from 'react'
import { Form, Field, Formik } from 'formik'
import { createClient } from '@/utils/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue,SelectContent, SelectItem } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
// import { SelectContent } from '@radix-ui/react-select'
import { coursesInGhanaUniversities } from "../../../../../data"
const page = () => {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [uploading, setUploading] = React.useState(false)
  
  const initialValues = {
      fullName: '',
      email: '',
      password: '',
      picture:null as File | null,
      course: '',
      skills: [],
      bio: '',
      interests: []
    }
  
    const handleSubmit = async (values: typeof initialValues) => {
    setUploading(true)
    
    try {
      // First, sign up the user
      const {data: authData, error: authError} = await createClient().auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            picture:selectedFile ? selectedFile.name : null,
            course: values.course
          }
        }
      })
      
      if (authError) {
        console.error('Signup error:', authError)
        alert('Signup failed: ' + authError.message)
        setUploading(false)
        return
      }
      
      // If there's a selected file and user was created, upload the avatar
      if (selectedFile && authData.user) {
        console.log('Uploading file for user:', authData.user.id)
        const avatarPath = await uploadFile(selectedFile)
        
        if (avatarPath) {
          // Update user metadata with avatar URL
          const { error: updateError } = await createClient().auth.updateUser({
            data: { avatar_url: avatarPath }
          })
          if (updateError) {
            console.error('Avatar update error:', updateError)
          } else {
            console.log('Avatar uploaded successfully:', avatarPath)
          }
        }
      }
      
      alert('Account created successfully!')
      // Navigate to next step or dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error('Signup process error:', error)
      alert('An error occurred during signup')
    } finally {
      setUploading(false)
    }
}

const uploadFile = async (file: File | null) => {
  if (!file) return null;
  
  try {
    // Create a unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
    
    const { data, error } = await createClient().storage
      .from('profile')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Upload error:', error)
     
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        const { data: publicData, error: publicError } = await createClient().storage
          .from('public')
          .upload(`avatars/${fileName}`, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (publicError) {
          console.error('Public upload error:', publicError)
          return null
        }
        return publicData.path
      }
      return null
    }
    
    console.log('Upload successful:', data)
    return data.path
  } catch (error) {
    console.error('File upload error:', error)
    return null
  }
}
  return (
     <main className='flex flex-col justify-center items-center  w-full min-h-screen'>
<div className='flex flex-col justify-center items-start bg-white text-black p-8 rounded-lg shadow-lg w-1/2 h-auto'>
<h1 className='text-2xl font-semibold'>Let's setup your profile</h1>
<p className='text-gray-500 text-sm'>This is your chance to make a great first impression. Upload a photo , share your interests, help others discover you</p>
<div className='flex flex-col justify-center items-start w-full mt-4 gap-4'>
  <Formik initialValues={initialValues} onSubmit={handleSubmit}>
    <Form className='flex flex-col gap-4 w-full'>
      <div className='space-y-2'>
        <Label htmlFor="picture">Profile Photo</Label>
        <Input 
          id='picture' 
          name='picture' 
          type='file' 
          accept="image/*" 
          onChange={(e) => {
            const file = e.target.files?.[0] || null
            setSelectedFile(file)
            console.log('File selected:', file?.name)
          }}
        />
        {selectedFile && (
          <p className="text-sm text-green-600">✓ Selected: {selectedFile.name}</p>
        )}
      </div>
      <div className='space-y-2'>
        <Label htmlFor="fullName">Course Offered</Label>
      <Select value={initialValues.course} onValueChange={(value: string) => { (initialValues as typeof initialValues).course = value }}>
        <SelectTrigger className="w-full">
        <SelectValue placeholder="What course are you offering" />
        </SelectTrigger>
        <SelectContent>
{coursesInGhanaUniversities.courses_in_ghana_universities.map((course) => (
          <SelectItem key={course} value={course}>
            {course}
          </SelectItem>
)
)
}
        </SelectContent>
   </Select>
          </div>
      <div className='space-y-2'>
        <Label htmlFor="email">Bio</Label>
        <Field name="email" type="email" as={Textarea} placeholder="Tell us a bit about yourself ..." />
      </div>
      <div className='space-y-2'>
        <Label htmlFor="password">Password</Label>
        <Field name="password" type="password" as={Input} placeholder="Password" />
      </div>
      <button 
        type="submit" 
        disabled={uploading}
        className='bg-lime-200 text-black p-2 rounded hover:bg-lime-300 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {uploading ? 'Creating Account...' : 'Sign up & Connect'}
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

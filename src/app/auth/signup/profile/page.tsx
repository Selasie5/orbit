"use client"
import React,{useState} from 'react'
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
  const [selectedFile, setSelectedFile] =useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imageURL, setImageURL] = useState<string|undefined>(undefined);
  const [imageID, setImageID] = useState<string|undefined>(undefined)
  
  
  const initialValues = {
      fullName: '',
      email: '',
      password: '',
      picture:null as File | null,
      course: '',
      skills: '',
      bio: '',
      interests: ''
    }
  
    const handleSubmit = async (values: typeof initialValues) => {
    setUploading(true)
    
    try {
      // Validate required fields
      if (!values.fullName || !values.email || !values.password) {
        alert('Please fill in all required fields')
        setUploading(false)
        return
      }
      
      // First, sign up the user
      const {data: authData, error: authError} = await createClient().auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            avatar_url: imageURL || null
          }
        }
      })
      
      if (authError) {
        console.error('Signup error:', authError)
        alert('Signup failed: ' + authError.message)
        setUploading(false)
        return
      }
      
      if (!authData.user) {
        alert('Account creation failed. Please try again.')
        setUploading(false)
        return
      }
      
      // Create profile in profiles table
      const profileData = {
        id: authData.user.id,
        full_name: values.fullName,
        email: values.email,
        course: values.course,
        skills: values.skills,
        interests: values.interests,
        bio: values.bio,
        avatar_url: imageURL || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { error: profileError } = await createClient()
        .from('profiles')
        .insert([profileData])
      
      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Don't fail the entire process if profile creation fails
        console.warn('Profile data saved to auth metadata instead')
        
        // Update user metadata as fallback
        await createClient().auth.updateUser({
          data: {
            full_name: values.fullName,
            course: values.course,
            skills: values.skills,
            interests: values.interests,
            bio: values.bio,
            avatar_url: imageURL,
            profile_complete: true
          }
        })
      } else {
        console.log('Profile created successfully')
      }
      
      alert('Account and profile created successfully! Please check your email to verify your account.')
      // Navigate to login or dashboard
      router.push("/auth/login?message=Please check your email to verify your account")
    } catch (error) {
      console.error('Signup process error:', error)
      alert('An error occurred during signup. Please try again.')
    } finally {
      setUploading(false)
    }
}

const uploadFile = async (file: File | null) => {
  if (!file) return null;
  
  setUploading(true);
  setSelectedFile(file);
  
  const data = new FormData();
  data.append('file', file);
  data.append('upload_preset',"domus-console")
  
  try {
    const res = await fetch("https://api.cloudinary.com/v1_1/dviigplcx/image/upload", {
      method: 'POST',
      body: data
    });
    
    if (!res.ok) {
      throw new Error(`Server responded with status: ${res.status}`);
    }
    
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Expected JSON response from server');
    }
    
    const result = await res.json();
    if (!result || !result.secure_url) {
      throw new Error('Invalid response from server');
    }
    
    console.log("File uploaded successfully:", result);
    setImageURL(result.secure_url);
    setImageID(result.public_id);
    
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  } finally {
    setUploading(false);
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
        
        {/* Image Preview */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full border-2 border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center">
            {imageURL && imageURL.trim() !== "" ? (
              <img 
                src={imageURL} 
                alt="Profile preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400 text-center">
                <svg className="w-8 h-8 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className="text-xs">No photo</span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <Input 
              id='picture' 
              name='picture' 
              type='file' 
              accept="image/*" 
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (file) {
                  setSelectedFile(file);
                  uploadFile(file);
                }
              }}
              className="mb-2"
            />
            <p className="text-xs text-gray-500">
              Upload a profile photo (JPG, PNG, or GIF)
            </p>
          </div>
        </div>
        
       
        
        {uploading && (
          <p className="text-sm text-blue-600">📤 Uploading...</p>
        )}
      </div>
      
      <div className='space-y-2'>
        <Label htmlFor="fullName">Full Name</Label>
        <Field name="fullName" type="text" as={Input} placeholder="e.g. Akoto James" />
      </div>
      
      <div className='space-y-2'>
        <Label htmlFor="email">Student Email</Label>
        <Field name="email" type="email" as={Input} placeholder="e.g. jkakoto002@st.ug.edu.gh" />
      </div>
      
      <div className='space-y-2'>
        <Label htmlFor="password">Password</Label>
        <Field name="password" type="password" as={Input} placeholder="Create a strong password" />
      </div>
      
      <div className='space-y-2'>
        <Label htmlFor="courses">Course Offered</Label>
        <Field name="course">
          {({ field, form }: any) => (
            <Select 
              value={field.value} 
              onValueChange={(value: string) => form.setFieldValue('course', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="What course are you offering" />
              </SelectTrigger>
              <SelectContent>
                {coursesInGhanaUniversities.courses_in_ghana_universities.map((course) => (
                  <SelectItem key={course} value={course}>
                    {course}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Field>
      </div>
      <div className='space-y-2'>
        <Label htmlFor="skills">Skills</Label>
        <Field name="skills" as={Textarea} placeholder="e.g. JavaScript, Python, Graphic Design..." />
      </div>
      <div className='space-y-2'>
        <Label htmlFor="interests">Interests</Label>
        <Field name="interests" as={Textarea} placeholder="e.g. Technology, Sports, Music, Reading..." />
      </div>
      <div className='space-y-2'>
        <Label htmlFor="bio">Bio(Optional)</Label>
        <Field name="bio" type="bio" as={Textarea} placeholder="Tell us a bit about yourself ..." />
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
  Already have an account? <a href="/auth/login" className="text-green-950 hover:underline">Log In</a>
</span>
</div>
</div>
   </main>
  )
}

export default page

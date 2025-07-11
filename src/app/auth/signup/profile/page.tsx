"use client";
import React, { useState } from "react";
import { Form, Field, Formik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { coursesInGhanaUniversities } from "../../../../../data";
import Link from "next/link";

const initialValues = {
  fullName: "",
  email: "",
  password: "",
  picture: null as File | null,
  course: "",
  skills: "",
  bio: "",
  interests: "",
};

const validationSchema = Yup.object({
  fullName: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Password too short").required("Password is required"),
  course: Yup.string().required("Course is required"),
});

async function uploadFile(file: File | null, setImageURL: (url: string) => void) {
  if (!file) return null;
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "domus-console");
  const res = await fetch("https://api.cloudinary.com/v1_1/dviigplcx/image/upload", {
    method: "POST",
    body: data,
  });
  const result = await res.json();
  if (result.secure_url) {
    setImageURL(result.secure_url);
    return result.secure_url;
  }
  return null;
}

const Page = () => {
  const router = useRouter();
  const { signUp, createProfile } = useAuth();
  const [imageURL, setImageURL] = useState<string | undefined>(undefined);

  const handleSubmit = async (values: typeof initialValues, { setSubmitting }: any) => {
    try {
      const { data: authData, error: authError } = await signUp(values.email, values.password, {
        full_name: values.fullName,
        avatar_url: imageURL || null,
      });
      if (authError) {
        alert("Signup failed: " + authError.message);
        return;
      }
      if (!authData.user) {
        alert("Account creation failed. Please try again.");
        return;
      }
      const profileData = {
        id: authData.user.id,
        full_name: values.fullName,
        email: values.email,
        course: values.course,
        skills: values.skills,
        interests: values.interests,
        bio: values.bio,
        avatar_url: imageURL || null,
      };
      await createProfile(profileData);
      alert("Account and profile saved successfully! Welcome to Orbit!");
      router.push("/dashboard");
    } catch (error) {
      alert("An error occurred during signup. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex flex-col justify-center items-center w-full min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="bg-white text-black p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-2xl">
        <h1 className="text-2xl font-semibold mb-1">Let's setup your profile</h1>
        <p className="text-gray-500 text-sm mb-6">
          This is your chance to make a great first impression. Upload a photo, share your interests, help others discover you.
        </p>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, setFieldValue, errors, touched }) => (
            <Form className="flex flex-col gap-5 w-full">
              <div>
                <Label htmlFor="picture">Profile Photo</Label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2">
                  <div className="w-20 h-20 rounded-full border-2 border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center">
                    {imageURL ? (
                      <img src={imageURL} alt="Profile preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-gray-400 text-center">
                        <svg className="w-8 h-8 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs">No photo</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 w-full">
                    <Input
                      id="picture"
                      name="picture"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0] || null;
                        if (file) await uploadFile(file, setImageURL);
                      }}
                      className="mb-2"
                    />
                    <p className="text-xs text-gray-500">Upload a profile photo (JPG, PNG, or GIF)</p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Field name="fullName" type="text" as={Input} placeholder="e.g. Akoto James" />
                {touched.fullName && errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <Label htmlFor="email">Student Email</Label>
                <Field name="email" type="email" as={Input} placeholder="e.g. jkakoto002@st.ug.edu.gh" />
                {touched.email && errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Field name="password" type="password" as={Input} placeholder="Create a strong password" />
                {touched.password && errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>

              <div>
                <Label htmlFor="courses">Course Offered</Label>
                <Field name="course">
                  {({ field, form }: any) => (
                    <Select value={field.value} onValueChange={(value) => form.setFieldValue("course", value)}>
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
                {touched.course && errors.course && <p className="text-xs text-red-500 mt-1">{errors.course}</p>}
              </div>

              <div>
                <Label htmlFor="skills">Skills</Label>
                <Field name="skills" as={Textarea} placeholder="e.g. JavaScript, Python, Graphic Design..." />
              </div>

              <div>
                <Label htmlFor="interests">Interests</Label>
                <Field name="interests" as={Textarea} placeholder="e.g. Technology, Sports, Music, Reading..." />
              </div>

              <div>
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Field name="bio" as={Textarea} placeholder="Tell us a bit about yourself ..." />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-lime-200 text-black p-2 rounded hover:bg-lime-300 transition disabled:opacity-50 w-full"
              >
                {isSubmitting ? "Creating Account..." : "Sign up & Connect"}
              </button>
            </Form>
          )}
        </Formik>
        <p className="mt-6 text-sm text-center">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-green-950 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </main>
  );
};

export default Page;

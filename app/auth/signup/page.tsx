import { redirect } from 'next/navigation'

// Google OAuth handles both sign-in and sign-up in a single flow.
// Any link to /auth/signup just goes to the login page.
export default function SignupPage() {
  redirect('/auth/login')
}

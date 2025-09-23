'use server';

import { cookies } from 'next/headers';

export async function login(formData: FormData) {
  const password = formData.get('password');

  // IMPORTANT: Use environment variables for sensitive data
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (password === adminPassword) {
    const cookieStore = cookies();
    cookieStore.set('flowstream-auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    return { success: true };
  } else {
    return { success: false, error: 'Incorrect password.' };
  }
}

export async function logout() {
    const cookieStore = cookies();
    cookieStore.delete('flowstream-auth');
}

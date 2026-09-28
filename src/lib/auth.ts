import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  role: 'student' | 'instructor';
}

export async function signUpStudent(
  email: string,
  password: string,
  name: string,
  phone: string,
  school: string,
  weakSubjects: string[],
  availableHours: number
) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/student/callback`,
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('User creation failed');

  const batchRes = await supabase
    .from('batches')
    .select('id')
    .eq('name', 'SSC 2028')
    .single();

  const { error: dbError } = await supabase
    .from('students')
    .insert([
      {
        auth_id: authData.user.id,
        name,
        email,
        phone,
        school,
        weak_subjects: weakSubjects,
        available_hours_per_day: availableHours,
        batch_id: batchRes.data?.id,
        status: 'pending',
        tutor_assignments: {},
      },
    ]);

  if (dbError) throw dbError;

  return authData.user;
}

export async function signUpInstructor(
  email: string,
  password: string,
  name: string,
  phone: string,
  subjects: string[],
  qualifications: string
) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/instructor/callback`,
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('User creation failed');

  const { error: dbError } = await supabase
    .from('instructors')
    .insert([
      {
        auth_id: authData.user.id,
        name,
        email,
        phone,
        subjects_taught: subjects,
        qualifications,
        status: 'pending',
      },
    ]);

  if (dbError) throw dbError;

  return authData.user;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data.user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getAuthSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateRoutine } from '@/lib/routineGenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student_id } = body;

    if (!student_id) {
      return NextResponse.json(
        { error: 'student_id is required' },
        { status: 400 }
      );
    }

    // Fetch student
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', student_id)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Fetch batch
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .select('*')
      .eq('id', student.batch_id)
      .single();

    if (batchError || !batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Generate routine
    const examDate = new Date(batch.exam_date);
    const generatedRoutine = generateRoutine(
      student.available_hours_per_day,
      student.weak_subjects,
      examDate
    );

    generatedRoutine.studentId = student_id;
    generatedRoutine.batchId = student.batch_id;

    // Save to database
    const { data: savedRoutine, error: saveError } = await supabase
      .from('routines')
      .insert([
        {
          student_id,
          batch_id: student.batch_id,
          routine_data: generatedRoutine,
          status: 'draft',
          generated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (saveError) {
      return NextResponse.json(
        { error: `Failed to save routine: ${saveError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        routine: generatedRoutine,
        routineId: savedRoutine.id,
        message: 'Routine generated and saved',
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';

// Temporarily disabled to stop console spam
export async function POST() {
  return NextResponse.json({ success: true });
}

export async function GET() {
  return NextResponse.json({
    tracking: {
      status: 'pending',
      message: 'Tracking service temporarily disabled'
    }
  });
}

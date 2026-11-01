import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import {
  SetupRequiredError,
  SupabaseUnreachableError,
  deleteDesignById,
  fetchDesigns,
  insertDesign,
  isConnectionError,
} from '@/lib/catalog-server';
import { DESIGN_BUCKET, getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB per design
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];

const slugifyFileName = (name: string) =>
  name
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'design';

export async function GET() {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  try {
    const designs = await fetchDesigns();
    return NextResponse.json({ designs, configured: designs !== null });
  } catch (err) {
    if (err instanceof SetupRequiredError) {
      return NextResponse.json({ designs: [], configured: false, setupRequired: true, error: err.message });
    }
    if (err instanceof SupabaseUnreachableError) {
      return NextResponse.json(
        { designs: [], configured: false, unreachable: true, error: err.message },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { designs: null, error: err instanceof Error ? err.message : 'Could not load designs.' },
      { status: 500 }
    );
  }
}

/**
 * Bulk upload. Accepts multipart/form-data with one or more `files` entries,
 * stores each in Supabase Storage and records a design row. The admin never
 * types or pastes an image URL - we derive it from the upload.
 */
export async function POST(request: Request) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json(
      { error: 'Supabase storage is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Expected a multipart form upload.' }, { status: 400 });
  }

  const files = form.getAll('files').filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: 'No files were uploaded.' }, { status: 400 });
  }

  const uploaded = [];
  const failed = [];

  for (const file of files) {
    if (!ALLOWED.includes(file.type)) {
      failed.push({ fileName: file.name, reason: `Unsupported file type (${file.type || 'unknown'}).` });
      continue;
    }
    if (file.size > MAX_BYTES) {
      failed.push({ fileName: file.name, reason: 'File is larger than 12 MB.' });
      continue;
    }

    const extension = file.name.match(/\.[^.]+$/)?.[0]?.toLowerCase() || '.png';
    const storagePath = `${slugifyFileName(file.name)}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}${extension}`;

    try {
      const buffer = await file.arrayBuffer();
      const { error: uploadError } = await db.storage
        .from(DESIGN_BUCKET)
        .upload(storagePath, buffer, {
          contentType: file.type,
          cacheControl: '31536000',
          upsert: false,
        });

      if (uploadError) {
        failed.push({ fileName: file.name, reason: uploadError.message });
        continue;
      }

      const { data: publicUrl } = db.storage.from(DESIGN_BUCKET).getPublicUrl(storagePath);

      try {
        const design = await insertDesign({
          fileName: file.name,
          imageUrl: publicUrl.publicUrl,
          storagePath,
        });
        uploaded.push(design);
      } catch (err) {
        // Roll back the orphaned object so storage stays consistent.
        try {
          await db.storage.from(DESIGN_BUCKET).remove([storagePath]);
        } catch {}
        failed.push({ fileName: file.name, reason: err instanceof Error ? err.message : 'Database insert failed.' });
      }
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : String(err);
      const isUnreachable = isConnectionError(err);
      failed.push({
        fileName: file.name,
        reason: isUnreachable
          ? 'Cannot connect to Supabase storage. Your project may be paused in your Supabase dashboard.'
          : msg || 'Upload failed.',
      });
    }
  }

  const allFailed = failed.length > 0 && uploaded.length === 0;
  return NextResponse.json(
    {
      uploaded,
      failed,
      error: allFailed ? failed[0]?.reason : undefined,
      unreachable: allFailed && failed.some((f) => f.reason.includes('paused') || f.reason.includes('connect')),
    },
    { status: allFailed ? 502 : 200 }
  );
}

export async function DELETE(request: Request) {
  if (!isAdminRequest()) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const storagePath = url.searchParams.get('path');
  if (!id) return NextResponse.json({ error: 'Missing design id.' }, { status: 400 });

  try {
    const db = getSupabaseAdmin();
    if (db && storagePath) {
      await db.storage.from(DESIGN_BUCKET).remove([storagePath]);
    }
    await deleteDesignById(id);
    return NextResponse.json({ deleted: id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not delete the design.' },
      { status: 500 }
    );
  }
}

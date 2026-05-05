import { Router, type IRouter } from "express";
import { db, filesTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "../middlewares/auth";
import {
  RequestUploadUrlBody,
  ListFilesQueryParams,
  GetFileParams,
  DeleteFileParams,
  ConfirmUploadParams,
} from "@workspace/api-zod";
import { ObjectStorageService } from "../lib/objectStorage";

const router: IRouter = Router();
const storage = new ObjectStorageService();

const ALLOWED_TYPES = new Set([
  // Images
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  "image/avif", "image/tiff", "image/bmp", "image/heic", "image/heif",
  // Documents
  "application/pdf", "text/plain", "text/csv", "text/html", "text/markdown",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // Archives
  "application/zip", "application/x-tar", "application/gzip",
  "application/x-7z-compressed", "application/x-rar-compressed",
  // Video
  "video/mp4", "video/webm", "video/quicktime", "video/x-msvideo",
  // Audio
  "audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/flac",
  // Data / code
  "application/json", "application/xml", "text/xml",
  // Catch-all for binary files
  "application/octet-stream",
]);

const MAX_SIZE_BYTES = 5 * 1024 * 1024 * 1024;

router.get("/files", requireAuth, async (req, res): Promise<void> => {
  const qp = ListFilesQueryParams.safeParse({
    limit: req.query.limit,
    offset: req.query.offset,
    type: req.query.type,
    tag: req.query.tag,
  });
  if (!qp.success) {
    res.status(400).json({ error: qp.error.message });
    return;
  }

  const userId = req.session.userId!;
  const limit = Math.min(qp.data.limit ?? 50, 200);
  const offset = qp.data.offset ?? 0;

  let query = db
    .select()
    .from(filesTable)
    .where(and(eq(filesTable.userId, userId), eq(filesTable.status, "confirmed")))
    .orderBy(desc(filesTable.uploadedAt))
    .limit(limit)
    .offset(offset);

  const files = await query;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(filesTable)
    .where(and(eq(filesTable.userId, userId), eq(filesTable.status, "confirmed")));

  const total = countResult?.count ?? 0;

  const mapped = files.map((f) => ({
    fileId: f.fileId,
    name: f.name,
    size: f.size,
    type: f.type,
    description: f.description,
    tags: f.tags,
    status: f.status,
    uploadedAt: f.uploadedAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  }));

  res.json({ files: mapped, count: mapped.length, total });
});

router.post("/files", requireAuth, async (req, res): Promise<void> => {
  const parsed = RequestUploadUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, size, type, description = "", tags = [] } = parsed.data;

  if (!ALLOWED_TYPES.has(type)) {
    res.status(400).json({ error: `File type '${type}' is not allowed` });
    return;
  }
  if (size > MAX_SIZE_BYTES) {
    res.status(400).json({ error: "File exceeds 5 GB maximum size" });
    return;
  }

  const fileId = uuidv4();
  const uploadUrl = await storage.getObjectEntityUploadURL();
  const rawPath = uploadUrl.split("?")[0];
  const objectPath = storage.normalizeObjectEntityPath(rawPath);

  await db.insert(filesTable).values({
    fileId,
    userId: req.session.userId!,
    name,
    size,
    type,
    objectPath,
    status: "pending",
    description,
    tags,
  });

  res.json({ fileId, uploadUrl, objectPath, expiresIn: 900 });
});

router.get("/files/:fileId", requireAuth, async (req, res): Promise<void> => {
  const params = GetFileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const userId = req.session.userId!;
  const [file] = await db
    .select()
    .from(filesTable)
    .where(and(eq(filesTable.fileId, params.data.fileId), eq(filesTable.userId, userId)));

  if (!file) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  const gcsFile = await storage.getObjectEntityFile(file.objectPath);
  const [signedUrl] = await gcsFile.getSignedUrl({
    action: "read",
    expires: Date.now() + 60 * 60 * 1000,
  });

  res.json({
    fileId: file.fileId,
    name: file.name,
    size: file.size,
    type: file.type,
    description: file.description,
    tags: file.tags,
    status: file.status,
    uploadedAt: file.uploadedAt.toISOString(),
    updatedAt: file.updatedAt.toISOString(),
    downloadUrl: signedUrl,
  });
});

router.delete("/files/:fileId", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteFileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const userId = req.session.userId!;
  const [file] = await db
    .select()
    .from(filesTable)
    .where(and(eq(filesTable.fileId, params.data.fileId), eq(filesTable.userId, userId)));

  if (!file) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  try {
    const gcsFile = await storage.getObjectEntityFile(file.objectPath);
    await gcsFile.delete();
  } catch {
    req.log.warn({ fileId: params.data.fileId }, "GCS delete failed, removing record anyway");
  }

  await db.delete(filesTable).where(eq(filesTable.id, file.id));

  res.json({ message: "File deleted successfully" });
});

router.post("/files/:fileId/confirm", requireAuth, async (req, res): Promise<void> => {
  const params = ConfirmUploadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const userId = req.session.userId!;
  const [file] = await db
    .select()
    .from(filesTable)
    .where(and(eq(filesTable.fileId, params.data.fileId), eq(filesTable.userId, userId)));

  if (!file) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  const [updated] = await db
    .update(filesTable)
    .set({ status: "confirmed" })
    .where(eq(filesTable.id, file.id))
    .returning();

  res.json({
    fileId: updated.fileId,
    name: updated.name,
    size: updated.size,
    type: updated.type,
    description: updated.description,
    tags: updated.tags,
    status: updated.status,
    uploadedAt: updated.uploadedAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  });
});

export default router;

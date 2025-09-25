import { postJSON } from "./client";
export async function SendEmail(p: { to: string; subject: string; text?: string; html?: string; replyTo?: string; }) { return postJSON("/send-email", p); }
export async function InvokeLLM(_: any){ return { ok: true, suggestions: [] }; }
export async function UploadFile(_: any){ return { ok: true }; }
export async function GenerateImage(_: any){ return { ok: true }; }
export async function ExtractDataFromUploadedFile(_: any){ return { ok: true }; }
export async function CreateFileSignedUrl(_: any){ return { ok: true }; }
export async function UploadPrivateFile(_: any){ return { ok: true }; }

import { postJSON } from './client';
export const SendEmail = (p) => postJSON('/send-email', p);
export const InvokeLLM = async () => ({ ok: true, suggestions: [] });
export const UploadFile = async () => ({ ok: true });
export const GenerateImage = async () => ({ ok: true });
export const ExtractDataFromUploadedFile = async () => ({ ok: true });
export const CreateFileSignedUrl = async () => ({ ok: true });
export const UploadPrivateFile = async () => ({ ok: true });

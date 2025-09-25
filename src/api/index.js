// Aggregate API surface
export * from "./entities";
export { SendEmail, InvokeLLM, UploadFile, GenerateImage, ExtractDataFromUploadedFile, CreateFileSignedUrl, UploadPrivateFile } from "./integrations";
import * as Entities from "./entities";
import * as Integrations from "./integrations";
const api = { ...Entities, ...Integrations };
if (typeof window !== "undefined") window.__HH_API__ = api;
export default api;

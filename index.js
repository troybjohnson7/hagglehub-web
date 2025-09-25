// Aggregate API surface for legacy imports: `import api from "@/api"` or `import { Vehicle } from "@/api"`.
export * from "./entities";
export { SendEmail, InvokeLLM, UploadFile, GenerateImage, ExtractDataFromUploadedFile, CreateFileSignedUrl, UploadPrivateFile } from "./integrations";
import * as Entities from "./entities";
import * as Integrations from "./integrations";
const api = { ...Entities, ...Integrations };
export default api;

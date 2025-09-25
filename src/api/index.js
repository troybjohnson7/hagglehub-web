// Aggregate API surface; supports `import api from "@/api"` and named imports.
export * from "./entities";
export { SendEmail, InvokeLLM, UploadFile, GenerateImage, ExtractDataFromUploadedFile, CreateFileSignedUrl, UploadPrivateFile } from "./integrations";

import * as Entities from "./entities";
import * as Integrations from "./integrations";

const api = { ...Entities, ...Integrations };

// Expose on window for sanity checks
if (typeof window !== "undefined") {
  // @ts-ignore
  window.__HH_API__ = api;
}

export default api;

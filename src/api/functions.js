import { SendEmail } from './integrations';
export const testReceiver = async (args) => ({ ok: true, args });
export const messageProcessor = async (args) => ({ ok: true, args });
export const sendReply = async ({ to, subject, text, html }) => SendEmail({ to, subject, text, html });
export const emailHandler = async (args) => ({ ok: true, args });

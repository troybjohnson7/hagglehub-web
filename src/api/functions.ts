import { SendEmail } from "./integrations";
export async function testReceiver(args: any){ return { ok: true, args }; }
export async function messageProcessor(args: any){ return { ok: true, args }; }
export async function sendReply({ to, subject, text, html }: any){ return SendEmail({ to, subject, text, html }); }
export async function emailHandler(args: any){ return { ok: true, args }; }

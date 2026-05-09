import type { Request, Response } from 'express';
import { getEnv } from '../lib/env';
import { verifyWebhook } from "@clerk/Backend/webhooks";
import { parseRole } from '../lib/roles';
import { users } from '../DB/schema';
import { db } from '../DB';
import { eq } from 'drizzle-orm';





export async function clerkWebhookHandler(_req: Request, _res: Response) {
    const env = getEnv()

    try{
        if(!env.CLERK_WEBHOOK_SECRET){
            _res.status(503).send('Clerk webhook secret not configured');
            return;
        }

        const payload = _req.body instanceof Buffer ? _req.body.toString('utf-8') : String(_req.body);

        const request = new Request("http://internal/webhook/clerk", {
            
            method: 'POST',
            headers: new Headers(_req.headers as HeadersInit), 
            body: payload,

        });

        const evt = await verifyWebhook(  request, {signingSecret: env.CLERK_WEBHOOK_SECRET});
       
        if(evt.type === 'user.created' || evt.type === 'user.updated'){
            const user = evt.data;
            const email = user.email_addresses.find((email) => email.id === user.primary_email_address_id)?.email_address ?? user.email_addresses?.[0]?.email_address; 

             const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || null;
             
             const role = parseRole(user.public_metadata?.role);
             
            await db.insert(users).values({
              name: displayName || "Unknown User",
              clerkUserId: user.id,
              email: email || "",
              displayName,
               role,
              })
            .onConflictDoUpdate({
                target: users.clerkUserId,
                set: {
                    email,
                    displayName,
                    role,
                    updatedAt: new Date()
                }
            });
        }

            

    if(evt.type === 'user.deleted'){
        const user = evt.data;
        if(user.id){
        await db.delete(users).where(eq(users.clerkUserId, user.id));
    } }
     

    _res.json({ok: true});

    }catch(error){
        console.error('Error processing Clerk webhook:', error);
        _res.status(400).json({error: 'Invalid webhook'});
    }
    
}

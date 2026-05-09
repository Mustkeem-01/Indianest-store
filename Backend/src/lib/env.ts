import {z} from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3000'),
    DATABASE_URL: z.string().default('postgresql://user:password@localhost:5432/mydb'),
   
    CLERK_PUBLISHABLE_KEY: z.string().min(1),
    CLERK_SECRET_KEY: z.string().min(1),
    CLERK_WEBHOOK_SECRET: z.string().min(1),

    FRONTEND_URL:z.string().url(),

    POLAR_ACCESS_TOKEN: z.string().optional(),
    POLAR_WEBHOOK_SECRET: z.string().optional(),
    POLAR_API_BASE:z.string().url().default('https://api.polar.com'),
    POLAR_CHECKOUT_PRODUCT_ID: z.string(),

   STREAM_API_KEY: z.string().min(1),
   STREAM_API_SECRET: z.string().min(1),
   STREAM_APP_ID: z.string().min(1),

   IMAGEKIT_PUBLIC_KEY: z.string().min(1),
   IMAGEKIT_PRIVATE_KEY: z.string().min(1),
   IMAGEKIT_URL_ENDPOINT: z.string().url(),

   SENTRY_DSN: z.string().url().optional(),

})

export type Env = z.infer<typeof envSchema>;

export function loadEnv() {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
        console.error('Invalid environment variables:', parsed.error.format());
        process.exit(1);
    }

    return parsed.data;
}

let cachedEnv: Env | null = null;

export function getEnv() {
    if (!cachedEnv) {
        cachedEnv = loadEnv();
    }   return cachedEnv;
}
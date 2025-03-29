import { Context } from "hono"
import { sign } from "hono/jwt"

declare module 'hono' {
    interface ContextVariables {
      user: {
        id: string
        email: string
      }
    }
}

export const authUtils = {
    generateToken:async(user: {id: string, email: string}, c: Context) =>{

        const JWT = c.env.JWT_SECRET;

        const payload = {
            id: user.id,
            email: user.email,
            exp: Math.floor(Date.now()/1000) + 60 * 60 * 24
        };

        return await sign(payload, JWT);
    },

    setAuthCookie: (c: Context, token: string) => {
        const isProduction = c.env.NODE_ENV === 'production';
        c.header(
          'Set-Cookie',
          `auth_token=${token}; HttpOnly; ${isProduction ? 'Secure;' : ''} SameSite=Strict; Max-Age=${60 * 60 * 24}; Path=/`
        );
    },
}
import { HTTPException } from "hono/http-exception";
import { verify } from "hono/jwt";
export const auth = async (c, next) => {
    const authHeader = c.req.header('Authorization');
    let token;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
    }
    else {
        const cookies = c.req.header('cookie');
        if (cookies) {
            const cookieObj = cookies.split(';').reduce((acc, cookie) => {
                const [key, value] = cookie.trim().split('=');
                acc[key] = value;
                return acc;
            }, {});
            token = cookieObj['auth_token'];
        }
    }
    if (!token) {
        throw new HTTPException(401, { message: 'Unauthorized: No token provided' });
    }
    try {
        const payload = await verify(token, c.env.JWT_SECRET);
        c.set('user', {
            id: payload.id,
            email: payload.email
        });
        await next();
    }
    catch (error) {
        // Invalid token
        throw new HTTPException(401, { message: 'Unauthorized: Invalid token' });
    }
};

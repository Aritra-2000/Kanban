import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { userRouter } from './routes/user';
import { taskRouter } from './routes/task';
import { sectionRouter } from './routes/section';

const app = new Hono()

app.use('*', cors({
    
    origin: (origin) => {
      return origin || '*'
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposeHeaders: ['Content-Length', 'X-Content-Length'],
    maxAge: 86400,
}))
  

app.route("/api/v1/auth", userRouter);
app.route("/api/v1/task", taskRouter);
app.route("/api/v1/section", sectionRouter);

export default app;

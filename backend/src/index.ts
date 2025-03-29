import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { userRouter } from './routes/user';
import { taskRouter } from './routes/task';
import { sectionRouter } from './routes/section';

const app = new Hono()

app.use("*", cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.route("/api/v1/auth", userRouter);
app.route("/api/v1/task", taskRouter);
app.route("/api/v1/section", sectionRouter);

export default app;

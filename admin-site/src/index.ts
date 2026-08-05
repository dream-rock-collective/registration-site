import { Hono } from 'hono';
import { healthRoute } from './routes/health';

const app = new Hono();
app.route('/', healthRoute);

// TODO: Postgres connection setup
// TODO: CORS config for registration-site's origin

const port = 3000;

export default {
  port,
  fetch: app.fetch,
};

console.log(`Server running on port ${port}`);

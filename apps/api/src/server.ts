import { env } from './config.js';
import { app } from './app.js';

const port = env.PORT;

app.listen(port, () => {
  console.log(`🚀 API server running on http://localhost:${port}`);
});

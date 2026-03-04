import express from 'express';
import { mountNarrativeApi } from './narrative.js';

const app = express();
app.use(express.json({ limit: '200kb' }));

mountNarrativeApi(app);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Narrative server listening on http://127.0.0.1:${PORT}`);
});

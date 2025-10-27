import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const PORT = parseInt(process.env.PORT || '10000', 10);
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running on port ${PORT}`);
});

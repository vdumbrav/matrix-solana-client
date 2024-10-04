import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

app.post('/api/matrix-login', async (req, res) => {
  try {
    const matrixResponse = await fetch('https://matrix.org/_matrix/client/v3/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...req.body }),
    });

    const matrixData = await matrixResponse.json();

    if (matrixResponse.ok) {
      res.json({
        matrixAccessToken: matrixData.access_token,
        userId: matrixData.user_id,
      });
    } else {
      console.error('Matrix login failed:', matrixData);
      res.status(500).json({ error: 'Matrix login failed', details: matrixData });
    }
  } catch (error) {
    console.error('Error during Matrix login:', error);
    res.status(500).json({ error: 'Server error during Matrix login' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));

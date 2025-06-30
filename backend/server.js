import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());




//importation des routes ( toutes les routes vous les mettez ici svp)
// import exemple from './routes/exemple.js';
// app.use('/api/exemple', exemple);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
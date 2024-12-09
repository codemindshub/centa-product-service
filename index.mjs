import express from 'express';
import { readdirSync } from 'fs';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

//middlewares
app.use(express.json());
app.use(cors());

//routes
readdirSync('./routes').forEach(async (route) => {
    const module = await import(`./routes/${route}`);
    app.use('/api/v1', module.default);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}
);

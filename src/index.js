import express, { json } from 'express';

const app = express();

app.use(json());

app.get('/ping', (req, res) => {
	res.json('pong');
});

app.listen(5000);

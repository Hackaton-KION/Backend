import express, { json } from 'express';

var app = express();
app.use(json());
app.get('/ping', function (req, res) {
  res.json('pong');
});
app.listen(5000);

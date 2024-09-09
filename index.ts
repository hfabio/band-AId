import Express from 'express';
import cors from 'cors';
import routes from './src/routes';
import crypto from 'node:crypto';


const app = Express()
const port = +(process.env.PORT ?? 2045);

app.use(cors());
app.use(async(req, res, next) => {
  req.requestUuid = crypto.randomUUID();
  next();
})
app.use(routes);

app.listen(port, () => {
  console.clear();
  console.log(`listening on port ${port}`)
})
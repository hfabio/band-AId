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

const server = app.listen(port, () => {
  console.clear();
  console.log(`listening on port ${port}`)
})

process.on('uncaughtException', (error, origin) => {
  console.log(`\n${origin} signal received. \n${error}`)
})

process.on('unhandledRejection', (error) => {
  console.log(`\nunhandledRejection signal received. \n${error}`)
})

const gracefulShutdown = (event: string) => {
  return () => {
    console.log(`\n${event} received`);
    server.getConnections((err, count) => {
      if (err) console.log('error getting connections', err);
      console.log(`current connections to the server: ${count}`)
      if (!count) process.exit(0);

      console.log(`Gracefully shutting down the application`);
      server.close((error) => {
        if (error) console.log(`\nError closing server\n${error}\n`)
        process.exit(0);
      });
    })
  }
}

['SIGINT', 'SIGTERM'].forEach(event => process.on(event, gracefulShutdown(event)));
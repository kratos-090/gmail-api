const authorize = require('./src/auth/auth');
const checkMail = require('./src/crons/cronJob');
const port = process.env.PORT || 3000;

const app = require("./src/app");


app.listen(port, async () => {
  const client = await authorize();
  if (client)
    console.log('Authorized');
  checkMail.start();
  console.log(`Listening on port ${port}`);
});

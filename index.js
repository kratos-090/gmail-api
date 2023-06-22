const app = require("./src/app");

const port = process.env.PORT || 3000;

require('./src/auth/auth')
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

const app = require('./app');
const port = require('getconfig').PORT;

app.listen(port, () => {
  console.info(`Express server listening on port ${port}`);
});

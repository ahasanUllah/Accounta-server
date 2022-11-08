const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
   res.send('Server running');
});

app.listen(port, () => {
   console.log(`Accouta app server is running on ${port}`);
});

const express = require('express');
const apiRoutes = require('./routes/api');
const userRoutes = require('./routes/users');
const cors = require('cors')

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/users', userRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('server is running!');
});


app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

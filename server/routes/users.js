const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db'); 
const jwt = require('jsonwebtoken');
const router = express.Router();
require('dotenv').config()

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body)

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }


  const checkQuery = 'SELECT * FROM users WHERE username = ?';
  db.get(checkQuery, [username], async (err, user) => {
    if (user) return res.status(400).json({ error: 'Username already exists' });


    const hashedPassword = await bcrypt.hash(password, 10);


    const insertQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.run(insertQuery, [username, hashedPassword],  (err) => {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({ message: 'User registered successfully!' });
    });
  });
});

router.post('/login', async(req,res) =>{


const {user, pass} = req.body;
console.log(user)

if (!user || !pass) {
    return res.status(400).json({message:"Must provide a username and a password"});
}


const loginQuery = 'SELECT * FROM users WHERE username =?';
db.get(loginQuery,[user], async(err,dbUser) => {
  
  if(err){
    console.error("Database Error",err)
    return res.status(500).json({message:"Database error"})
  }
if(!dbUser) {res.status(400).json({message:'Invaild Username or Password'})}

const isPassValid = bcrypt.compare(pass,dbUser.password);
if(!isPassValid) {res.status(400).json({message:'Invalid password or username'})}


const secretKey = process.env.JWT_SECRET;

const token = jwt.sign({ id: dbUser.id }, secretKey,{expiresIn:'1h'})

res.json({token})

});


});


module.exports = router;

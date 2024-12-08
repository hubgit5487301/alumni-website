const express = require('express');
const path = require('path');

const router = express();


router.get('/services', (req,res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'protected', 'services.html'));
})

router.get('/job-form', (req, res) => {
  const usertype = req.user.usertype;
  if(usertype === 'alumni') return res.sendFile(path.join(__dirname, '..', '..', 'protected', 'job-form.html'))
  else return res.redirect(`/protected/services`)
})


module.exports = router;
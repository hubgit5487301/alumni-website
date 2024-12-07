const express = require('express');
const path = require('path');

const router = express();
const user = require('../../models/users');
const jobs = require('../../models/jobs');
const events = require('../../models/events');
const { resizeimage } = require('../util');

router.get('/',(req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

router.get('/alumni-directory', (req, res) =>{
  res.sendFile(path.join(__dirname, '..','..', 'protected', 'alumni-directory.html'));
})

router.get('/users', async (req,res) => {
  try {
    const users = await user.find({}, {userid: 1, personname: 1, personimage: 1, usertype: 1 }).sort({personname: 1});
    const filteredUsers = users.filter(user => user.usertype !== 'admin');
    res.status(200).json(filteredUsers);
  }
  catch (err){
    res.status(500).json({error: 'Error getting users',err})
  }
})

router.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'protected', 'profile.html'))
})

router.get(`/users/:userid`, async (req,res) =>{
  try {
    const userid = req.params.userid;
    const founduser = await user.findOne({userid});
    founduser._id = null;
    founduser.salt = null;
    founduser.passwordhash = null;
    if (founduser) {
      res.status(200).json(founduser);
    }
    else {
      res.status(404).json({message: 'user not found'});
    }
  }
  catch (err){
    console.error('error fetching user:',err);
    res.status(501).json({error: 'internal server error'});
  }
})

router.get('/alumni-search', async (req, res) => {
  const {personname, batch, branch } = req.query;
  if(!personname && !batch && !branch) {
    return res.status(200).json([]);
  }
  try{
    const results = await user.find({
      personname: { $regex: `^${personname}`, $options: 'i' },
      "details.batch": {$regex: `^${batch}`, $options: 'i' },
      "details.branch": {$regex: `^${branch}`, $options: 'i'}},
      {personname: 1, personimage: 1,userid: 1 , usertype: 1}
    );
  if(results === undefined){
    return res.status(200).json([]);
  }
  const filteredUsers = results.filter(user => user.usertype !== 'admin');
  res.status(200).json(filteredUsers);
  }
  catch(err) {
    res.status(500).json({error: 'internal servor error'});
  }
});

router.get('/contact-us', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'protected', 'contact-us.html'))
})

router.get('/my-profile-page', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'protected', 'myprofile.html'))
})

router.get('/my-profile', async (req, res) => {
  if(req.isAuthenticated) {
  const data = ({userid: req.user.userid, personname: req.user.personname, personimage: req.user.personimage, details: req.user.details, usertype: req.user.usertype});
  res.status(200).json(data);
  } 
  else {
    res.redirect(`/login?alert=not-logged-in`);
  }
})

router.get('/my-usertype', async (req, res) => {
  if(req.isAuthenticated()) {
    const data = ({ usertype: req.user.usertype });
    res.status(200).json(data);
  }
  else {
    res.redirect(`/login?alert=not-logged-in`);
  }
})

router.get('/my-userid', async (req, res) => {
  if(req.isAuthenticated()) {
    const data = ({ userid: req.user.userid });
    res.status(200).json(data);
  }
  else {
    res.redirect(`/login?alert=not-logged-in`);
  }
})

router.get('/user_logo', (req, res) => {
  if(req.isAuthenticated()) {
    res.status(200).json(req.user.personimage);
  }
  else {
    res.redirect(`/login?alert=not-logged-in`);
  }
});

router.get(`/myprofile-appli`, async (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'protected', 'myprofile-appli.html'));
})

router.get(`/myprofile-posts`, async (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'protected', 'myprofile-posts.html'));
})

router.get('/my-jobs-events-applied/:userid', async (req, res) => {
  try{
    const userid = req.params.userid;
    
    const all_jobs = await jobs.find({'applicants.applicant': userid }).select('_id');
    const all_events = await events.find({'applicants.applicant': userid }).select('_id');
    const data = ({all_jobs, all_events});
    res.status(200).json(data);
  }
  catch(err) {
    console.log(err);
    return res.status(500).json({error: 'internal server error'});
  }
})

router.get('/my-jobs-events-posts/:userid', async (req, res) => {
  try{ 
  const userid = req.params.userid;
  const finduser = await user.findOne({userid}, {data: 1, usertype:1})
  res.status(201).json(finduser);
  }
  catch(err) {
    console.log(err);
    res.status(500).json({error: 'internal server error'})
  }
}),

router.patch('/my-profile/edit-profile-pic', async (req, res) => {
  const {file64, userid} = req.body;
  const new_profile_pic = await resizeimage(file64, 60, 'webp', 100000)
  await user.updateOne(
    {"userid": userid},
    {$set: {"personimage": new_profile_pic}}
  ) ;
  res.status(200).json({message: 'Profile picture changed'});

})

module.exports = router;
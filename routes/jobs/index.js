const express = require('express');
const router = express.Router();
const Job = require('../../schemas/job');

router.post('/create', async (req, res, next) => {
    try {
        const { name, logo, position, salary, jobType, remote, description, about, skills, information } = req.body;

        const user = req.user;
        const userId = user._id;

        const skillsArray = skills.split(",").map(skill => skill.trim()); // convert string to array through split and remove white spaces through trim
        
        const job = new Job({
            ...req.body, 
            skills: skillsArray,
            userId
        });
        await job.save();
        res.status(201).send("Job created");
    }
    catch (err) {
        next(err);
    }
})

router.delete('/delete/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        const userId = req.user._id;
        const defaultJob = await Job.findById(id);
        if (defaultJob.userId.toString() !== userId.toString()) {
            return res.status(403).send("Access denied, unauthorized user");
        }
        if (!id) {
            return res.status(403).send("Wrong request");
        }
        await Job.findByIdAndDelete(id);
        res.status(200).send("Job deleted");
    }
    catch (err) {
        next(err);
    }
});

router.get("/get/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(403).send("Wrong request");
        }
        const job = await Job.findById(id);
        res.status(200).json(job);
    }
    catch (err) {
        next(err);
    }
});

router.get("/all", async (req, res, next) => {
    try {
        const jobs = await Job.find().select("name logo position");
        res.status(200).json(jobs);
    }
    catch (err) {
        next(err);
    }
});

router.patch("/update/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        if(!id) {
            return res.status(403).send("Wrong request");
        }
        const { name, logo, position, salary, jobType, remote, description, about, skills, information } = req.body;
        
        const user = req.user;
        const userId = user._id;
        const defaultJob = await Job.findById(id);
        if (defaultJob.userId.toString() !== userId.toString()) {
            return res.status(403).send("Access Denied");
        }
        
        const skillsArray = skills?.split(",").map(skill => skill.trim()) || defaultJob.skills;

        // This is done beacuse frontend might send all of the information and it might send what is to be updated
        const job = await Job.findByIdAndUpdate(id, {
            name: name || defaultJob.name,
            logo: logo || defaultJob.logo,
            position: position || defaultJob.position,
            salary: salary || defaultJob.salary,
            jobType: jobType || defaultJob.jobType,
            remote: remote || defaultJob.remote,
            description: description || defaultJob.description,
            about: about || defaultJob.about,
            skills: skillsArray,
            information: information || defaultJob.information
        }, { new: true });
        res.status(200).json(job);
    }
    catch(err) {
        next(err);
    }
});

// filtering based on skills
router.get("/filter/:skills", async (req, res, next) => {
    try {
        const { skills } = req.params;
        if(!skills) {
            return res.status(403).send("Wrong request");
        }
        const skillsArray = skills.split(",").map(skill => skill.trim());

        // if we want to filter in an array then there is $in in mongoose
        const jobs = await Job.find({ skills: { $in: skillsArray }}).select("name logo position");
        res.status(200).json(jobs);
    }
    catch (err) {
        next(err);
    }
});

// searching based on name, jobtype, position
router.get("/search/:query", async (req, res, next) => {
    try {
        const { query } = req.params;
        const job = await Job.find({
            $or: [
                { name: { $regex: query, $options: 'i' }},
                { position: { $regex: query, $options: 'i' }},
                { jobType: { $regex: query, $options: 'i' }},
                { description: { $regex: query, $options: 'i' }}
            ]
        }).select("name logo position");
        res.status(200).json(job);
    }
    catch (err) {
        next(err);
    }
});

module.exports = router;

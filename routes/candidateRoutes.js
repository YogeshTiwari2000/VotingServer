const express = require('express');
const router = express.Router();
const Candidates = require('../modals/candidates')
const User = require('../modals/user')
const { jwtAuthMiddleware, generateToken } = require('../jwt')

const checkAdminRole = async (userId) => {
    try {
        const user = await User.findById(userId);
        return user.role === 'admin'
    } catch (err) {
        return false
    }
}

router.post('/', jwtAuthMiddleware, async (req, res) => {

    try {
        if (! await checkAdminRole(req.data.id))
            return res.status(403).json({ message: 'not admin role' })

        const data = req.body; // req.body used to extract data sent by client (typically in JSON format) when hitting this endpoint.

        const newCandidates = new Candidates(data); // this is new and blank using schema of person

        const response = await newCandidates.save();
        res.status(200).json({ response: response });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'internal server error' })
    }

})

router.put('/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try {

        if (!checkAdminRole(req.data.id))
            return res.status(403).json({ message: 'not admin role' });

        const candidateId = req.params.candidateId;
        console.log('candidateId', candidateId);

        const updatecandidateData = req.body;

        // Find and update the person by _id
        const response = await Candidates.findByIdAndUpdate(
            candidateId,
            updatecandidateData,
            {
                new: true,       // Return the updated document
                runValidators: true
            }
        );

        if (!response) {
            return res.status(404).json({ error: 'candidate not found' });
        }

        console.log('candidate updated:', response);
        res.status(200).json({ message: 'candidate updated successfully', user: response });
    } catch (error) {
        console.error('Error updating person:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try {

        if (!checkAdminRole(req.data.id))
            return res.status(403).json({ message: 'not admin role' });

        const candidateId = req.params.candidateId;
        // console.log('candidateId', candidateId);

        // Find and update the person by _id
        const response = await Candidates.findByIdAndDelete(candidateId);
        // console.log('response', response);

        if (!response) {
            return res.status(404).json({ error: 'candidate not found' });
        }

        console.log('candidate Deleted:', response);
        res.status(200).json({ message: 'candidate Deleted successfully', user: response });
    } catch (error) {
        console.error('Error Deleting candidate:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/vote/:candidateId', jwtAuthMiddleware, async (req, res) => {

    const candidateId = req.params.candidateId;
    const userId = req.data.id;

    try {
        // checking where such candidate exist or not by candidate id
        const candidate = await Candidates.findById(candidateId);
        console.log('candidate', candidate);

        if (!candidate) {
            return res.status(404).json({ error: 'candidate not found' });
        }
        // checking for user wherther he has voted or not earlier
        const user = await User.findById(userId); // find user

        if (!user) {
            return res.status(404).json({ error: 'user not found' });
        }
        if (user.isVoted) {
            return res.status(400).json({ error: 'You have already Voted' });
        }
        if (user.role == 'admin') {
            return res.status(403).json({ error: 'You can not vote u are a admin' });
        }

        // dekh jab user vote dega toh user -> { vote:True } and candidate -> { vote++ } and user {add} hojayga candidate -> votes -> user list mei

        user.isVoted = true;
        await user.save();

        candidate.voteCount++;
        candidate.votes.push({ user: userId })
        await candidate.save();

        res.status(200).json({ message: 'Vote Recorded Successfully' })

    } catch (error) {
        console.error('Error Deleting candidate:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/', async (req, res) => {

    try {
        const data = await Candidates.find();
        console.log('Candidates fetched');
        res.status(200).json(data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'internal server error' })
    }
})



module.exports = router
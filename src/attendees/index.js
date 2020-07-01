const express = require ('express')
const {writeFile, readFile} = require("../utitlities")
const { check, param, body, validationResult } = require("express-validator");

const {join} = require('path')
const directory = join(__dirname, "attendees.json")


const uniqueEmail = async (req, resp, next) => {
    const data = await  readFile(directory);
    const { email } = req.body;
    console.log(email )

    if (
        data.filter((user) => user.email === email)
            .length === 0
    ) {
        next();
    } else {

        next("Bad request");
    }
};
const validateBody = () => {
    return [
        check("firstName").exists().withMessage("firstName is required").not().isEmpty(),
        check("surname")
            .exists()
            .withMessage("Surname is required")
            .not()
            .isEmpty(),

        check("email").exists().withMessage("Email is required").isEmail(),
        check("arrivalTime")
            .exists()
            .withMessage("arrivalTime is required")
            .not()
            .isEmpty()
            .isDate(),
    ];
};
const router = express.Router()
router.route("/sendEmail")
.post(validateBody(), uniqueEmail, async(req, res, next)=> {
    try {
        let writtenData = await writeFile(directory, req.body)
        res.send(writtenData)
    }catch (e) {
        e.httpRequestStatusCode = 500;
        next(e);
    }
})

module.exports = router
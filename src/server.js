const express = require("express")
const attendeeRoutes = require('./attendees')

const cors = require ('cors')
const app = express()



app.use(cors())

app.use(express.json())

app.use('/attendee', attendeeRoutes)
const port = process.env.PORT ||3004



//
// app.use((error, request, response, next)=>{
//     if(error.httpRequestStatusCode ===404) {
//         response.status(404).send("Not Found")
//     }
//     else if (error.httpRequestStatusCode === 400) {
//         response.status(400).send("Bad Request")
//     } else{
//         response.status(500).send("Internal server error")
//     }
// })


app.listen(port, ()=> {
    console.log(`Server is running on port ${port}`)
})



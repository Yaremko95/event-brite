const fs= require('fs-extra')
const uniqid = require('uniqid')



const writeFile = async(path, data) => {
    let dataFromFile= await fs.readJson(path)
    dataFromFile.push({...data, _id:uniqid() })
    let json = await fs.writeJson(path, dataFromFile)
    return dataFromFile
}

const readFile = async(path) => {
    let dataFromFile = await fs.readJson(path)
    return dataFromFile
}



module.exports = {writeFile, readFile}
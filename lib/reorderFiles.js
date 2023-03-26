const fs = require('fs');
const { builtinModules } = require('module');
const OTHER_FILES = 'Other';



async function reoderFiles(offset=1,classesPath='force-app/main/default/classes'){

    const files = await fs.promises.readdir(classesPath);

    let filesByPrefix = new Map();
    filesByPrefix.set(OTHER_FILES,[]);

    for( const fileName of files ) {
        
        let fileDetails = parse(fileName);
       
        if(fileDetails.prefix === '' || fileDetails.ignorePrefix){
            filesByPrefix.get(OTHER_FILES).push(fileDetails);
        }
        else{
            if(filesByPrefix.has(fileDetails.prefix)){
                filesByPrefix.get(fileDetails.prefix).push(fileDetails);
            }
            else{
                filesByPrefix.set(fileDetails.prefix,[fileDetails]);
            }
        }
    }

    console.log(filesByPrefix)

    let keys = Array.from(filesByPrefix.keys());

    await Promise.all(keys.map( async (prefix) => {

        let domainFolder = `${classesPath}/${prefix}`;
        let sourceFolder = `${domainFolder}/src`;
        let testFolder = `${domainFolder}/__tests__`;

        try{
            let stat = await fs.promises.stat(domainFolder);
            if (stat.isDirectory()) return;
        }catch(error){
            //if we get an error
            //it means the folder doesn't exist, so it's safe to create it
            await fs.promises.mkdir(domainFolder);
            await fs.promises.mkdir(sourceFolder);
            await fs.promises.mkdir(testFolder);
        }

        let allFiles = filesByPrefix.get(prefix);

        await Promise.all(allFiles.map(async (fileDetails) => {

            let newLocation;
            let originalLocation = `${classesPath}/${fileDetails.fileName}`;

            if(fileDetails.isTest){
                newLocation = `${testFolder}/${fileDetails.fileName}`;
            }
            else{
                newLocation = `${sourceFolder}/${fileDetails.fileName}`;
            }
    
            await fs.promises.rename(originalLocation,newLocation);

        }))
        
    }))
    
    console.log('done');

};

function parse(fileName){
   
    let fileDetails = {
        ignorePrefix : false,
        prefix:'',
        isTest:false,
        fileName:fileName
    }

    if(fileName.toLowerCase().includes('test')){
        fileDetails.isTest = true;
    }

    if(fileName.includes('_')){
        let parts = fileName.split('_');
        let prefix = parts[0];
        let lastPart = parts[parts.length-1];

        //i.e Test_ContactController or ContactController_Test, none of these are valid prefixes
        if(prefix.toLowerCase().includes('test') ){
            fileDetails.ignorePrefix = true;
        }
        else{
            fileDetails.prefix = prefix;
        }
    }

    return fileDetails;

}

function getPrefixByUnderscore(fileName){
    return fileName.split('_')[0];
}

function getPrefixByCamelCase(fileName){
    const regex = /[A-Z]/g;
    return fileName.split(regex)[0]
}

//create random three letter string
function randomString(){
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let charactersLength = characters.length;
    for ( let i = 0; i < 3; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


module.exports = reoderFiles;

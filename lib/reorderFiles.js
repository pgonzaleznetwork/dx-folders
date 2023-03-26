const e = require('express');
const fs = require('fs');
const { builtinModules } = require('module');
const OTHER_FILES = 'Other';



async function reoderFiles(offset=1,classesPath='force-app/main/default/classes'){

    const files = await fs.promises.readdir(classesPath);

    let filesByPrefix = new Map();
    filesByPrefix.set(OTHER_FILES,[]);

    let allFileDetails = files.map(file => parse(file));
    let prefixesToIgnore = allFileDetails.filter(file => file.ignorePrefix).map(file => file.prefix);

    for( const fileDetails of allFileDetails ) {
        
        if(prefixesToIgnore.includes(fileDetails.prefix) || fileDetails.prefix === ''){
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

    let pureName = removeExtension(fileName);

    if(pureName.toLowerCase().includes('test')){
        fileDetails.isTest = true;
    }

    if(pureName.includes('_')){
        let parts = pureName.split('_');
        let prefix = parts[0];
        let lastPart = parts[parts.length-1];

        //i.e Test_ContactController
        if(prefix.toLowerCase().includes('test')){
            fileDetails.ignorePrefix = true;
        }
        else{

            //i.e. ContactController_Test[s]
            if((lastPart.toLowerCase() == 'test' || lastPart.toLowerCase() == 'tests') && parts.length == 2){
                fileDetails.ignorePrefix = true;
            }
            else{
                //SRM_deployer_Test
                fileDetails.prefix = prefix;
            }
        }
    }

    return fileDetails;

}



function getPrefixByCamelCase(fileName){
    const regex = /[A-Z]/g;
    return fileName.split(regex)[0]
}

function removeExtension(fileName){
    return fileName.split('.')[0];
}



module.exports = reoderFiles;

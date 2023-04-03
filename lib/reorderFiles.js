const glob = require("glob");
const fs = require('fs');
const OTHER_FILES = 'Other';
const pino = require('pino')
const logger = pino({
    formatters: {
        level: (label) => {
          return { level: label };
        },
      }
    },
    pino.destination(`${__dirname}/dx-folders.log`)
)



function reoderFiles(classesPath='force-app/main/default/classes'){

    const files = fs.readdirSync(classesPath);

    let filesByPrefix = new Map();
    filesByPrefix.set(OTHER_FILES,[]);

    let allFileDetails = files.map(file => parse(file));

    for( const fileDetails of allFileDetails ) {
        
        if(filesByPrefix.has(fileDetails.prefix)){
            filesByPrefix.get(fileDetails.prefix).push(fileDetails);
        }
        else{
            filesByPrefix.set(fileDetails.prefix,[fileDetails]);
        }
    }

    let keys = Array.from(filesByPrefix.keys());

    for( const prefix of keys ) {

        const domainFolder = `${classesPath}/${prefix}`;

        createIfDoesntExist(domainFolder);

        let allFiles = filesByPrefix.get(prefix);

        for( const fileDetails of allFiles ) {

            let newLocation;
            let originalLocation = `${classesPath}/${fileDetails.fileName}`;

            let sourceFolder = '';
            let testFolder = '';

            if(fileDetails.subPrefix !== ''){

                const subFolder = `${domainFolder}/${fileDetails.subPrefix}`;
                sourceFolder = `${subFolder}/src`;
                testFolder = `${subFolder}/__tests__`;

                createIfDoesntExist(subFolder)       
            }
            else{
                sourceFolder = `${domainFolder}/src`;
                testFolder = `${domainFolder}/__tests__`;
            }

            if(fileDetails.isTest){
                createIfDoesntExist(testFolder)
                newLocation = `${testFolder}/${fileDetails.fileName}`;
            }
            else{
                createIfDoesntExist(sourceFolder)
                newLocation = `${sourceFolder}/${fileDetails.fileName}`;
            }

            if(process.env.DX_FOLDERS_SHOW_OUTPUT){
                logger.info(newLocation);
            }

            fs.renameSync(originalLocation,newLocation);
        }

        
    }

    if(process.env.DX_FOLDERS_SHOW_OUTPUT){
        showPreview(classesPath)
     }
};



function parse(fileName){
   
    let fileDetails = {
        ignorePrefix : false,
        prefix:'',
        subPrefix:'',
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

    let identifier = getMatchingIdentifier(fileDetails.fileName);

    if(identifier){

        if(fileDetails.prefix === ''){
            //triggerhandler becomes the prefix
            fileDetails.prefix = identifier.dirName;
        }
        else{
            //SRM/triggerhandler/fileName 
            fileDetails.subPrefix = identifier.dirName;
        }

    }

    if(fileDetails.prefix === '' || fileDetails.ignorePrefix){
        fileDetails.prefix = OTHER_FILES
    }

    return fileDetails;

}

function getMatchingIdentifier(fileName){
    
    let identifiers = [
        {
            identifier:'triggerhandler',
            dirName:'trigger_handlers'
        },
        {
            identifier:'batch',
            dirName:'batch_apex'
        }
    ]

    let matchingIdentifier = identifiers.find(identifier => fileName.toLowerCase().includes(identifier.identifier));

    return matchingIdentifier;

}

function isTestClass(path,file){
    const contents = fs.readFileSync(path + '/' + file, 'utf8');
    const regex = /@istest/i; 
    return regex.test(contents);
}

function checkStringForTest(str) {
    return splitByUpperCase(str).find(part => part.toLowerCase().includes("test")) !== undefined;
  }

function splitByUpperCase(str){
    return str.split(/(?=[A-Z])/);
}

function getPrefixByCamelCase(fileName){
    const regex = /[A-Z]/g;
    return fileName.split(regex)[0]
}

function removeExtension(fileName){
    return fileName.split('.')[0];
}

function showPreview(path){

    glob(path + '/**/*', function (er, files) {
        console.log(files);
    })    
}

function createIfDoesntExist(path){
    if(!fs.existsSync(path)){
        fs.mkdirSync(path);
    }
}

  


module.exports = reoderFiles;

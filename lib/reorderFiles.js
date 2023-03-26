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



async function reoderFiles(classesPath='force-app/main/default/classes'){

    const files = await fs.promises.readdir(classesPath);

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

    keys.forEach( async (prefix) => {

        let domainFolder = `${classesPath}/${prefix}`;
        let sourceFolder = `${domainFolder}/src`;
        let testFolder = `${domainFolder}/__tests__`;

        if(!fs.existsSync(domainFolder)){
            fs.mkdirSync(domainFolder);
            fs.mkdirSync(sourceFolder);
        }

        let allFiles = filesByPrefix.get(prefix);

        allFiles.forEach(async (fileDetails) => {

            let newLocation;
            let originalLocation = `${classesPath}/${fileDetails.fileName}`;

            if(fileDetails.isTest){

                if(!fs.existsSync(testFolder)){
                    fs.mkdirSync(testFolder);
                }

                newLocation = `${testFolder}/${fileDetails.fileName}`;
            }
            else{

                if(fileDetails.subPrefix !== ''){

                    const subFolder = `${domainFolder}/${fileDetails.subPrefix}`;
                    const subFolderSource = `${subFolder}/src`;
           
                    if(!fs.existsSync(subFolder)){

                        fs.mkdirSync(subFolder);
                        fs.mkdirSync(subFolderSource);
                    }

                    newLocation = `${subFolderSource}/${fileDetails.fileName}`;

                }
                else{
                    newLocation = `${sourceFolder}/${fileDetails.fileName}`;

                }              
            }

            if(process.env.DX_FOLDERS_SHOW_OUTPUT){
                logger.info(newLocation);
            }
           await fs.promises.rename(originalLocation,newLocation);
        })
        
    })
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

       //logger.info(fileDetails)

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


module.exports = reoderFiles;

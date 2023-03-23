const fs = require('fs');
const { builtinModules } = require('module');
const OTHER_FILES = 'Other';


async function reoderFiles(offset=1,classesPath='force-app/main/default/classes'){

    const files = await fs.promises.readdir(classesPath);

    let filesByPrefix = new Map();
    filesByPrefix.set(OTHER_FILES,[]);

    for( const fileName of files ) {

        let prefix = '';
        
        if(type == 'underscore'){
            prefix = getPrefixByUnderscore(fileName);
        }
        else if(type == 'camelcase'){
            prefix = getPrefixByCamelCase(fileName);
        }

        //there wasn't a prefix
        if(prefix == fileName){
            filesByPrefix.get(OTHER_FILES).push(fileName);
        }
        else{
            if(filesByPrefix.has(prefix)){
                filesByPrefix.get(prefix).push(fileName);
            }
            else{
                filesByPrefix.set(prefix,[fileName]);
            }
        }
    }

    let keys = Array.from(filesByPrefix.keys());

    await Promise.all(keys.map( async (prefix) => {

        let domainFolder = `${classesPath}/${prefix}`;
        let sourceFolder = `${domainFolder}/src`;
        let testFolder = `${domainFolder}/tests`;

        try{
            let stat = await fs.promises.stat(domainFolder);
            if (stat.isDirectory()) return;
        }catch(error){
            //if we get an error
            //it means the folder doesn't exist, so it's safe to create it
            fs.mkdirSync(domainFolder);
            fs.mkdirSync(sourceFolder);
            fs.mkdirSync(testFolder);
        }

        let files = filesByPrefix.get(prefix);

        await Promise.all(files.map(async (file) => {

            let newLocation;
            let originalLocation = `${classesPath}/${file}`;

            if(file.toLowerCase().includes('test')){                
                newLocation = `${testFolder}/${file}`;
            }
            else{
                newLocation = `${sourceFolder}/${file}`;
            }
    
            await fs.promises.rename(originalLocation,newLocation);

        }))
        
    }))
    
    console.log('done');

};

function getPrefixByUnderscore(fileName){
    return fileName.split('_')[0];
}

function getPrefixByCamelCase(fileName){
    const regex = /[A-Z]/g;
    return fileName.split(regex)[0]
}

module.exports = reoderFiles;

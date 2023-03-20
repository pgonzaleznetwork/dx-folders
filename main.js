const fs = require('fs');
const OTHER_FILES = 'Other';
const CLASSES_PATH = 'force-app/main/default/classes';

(async function (){

    const files = await fs.promises.readdir(CLASSES_PATH);

    let filesByPrefix = new Map();
    filesByPrefix.set(OTHER_FILES,[]);

    for( const file of files ) {

        //happysoup_className
        let parts = file.split('_');

        if(parts.length > 1){

            let prefix = parts[0];

            if(filesByPrefix.has(prefix)){
                filesByPrefix.get(prefix).push(file);
            }
            else{
                filesByPrefix.set(prefix,[file]);
            }
        }
        else{
            filesByPrefix.get(OTHER_FILES).push(file);
        }
    }

    let keys = Array.from(filesByPrefix.keys());

    await Promise.all(keys.map( async (prefix) => {

        let domainFolder = `${CLASSES_PATH}/${prefix}`;
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
            let originalLocation = `${CLASSES_PATH}/${file}`;

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

})();




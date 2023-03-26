const mock = require('mock-fs');
const fs = require('fs');
const  reoderFiles = require('../../lib/reorderFiles');


describe('All tests', () => {

    const DEFAULT_PATH = 'force-app/main/default/classes/';

    beforeAll(async () => {
        mock(project);
        await reoderFiles();
    });

    test('Top-level folders are created from prefixes', async () => {
                
        let stat = await fs.promises.stat(`${DEFAULT_PATH}SRM`);
       
        expect(stat.isDirectory()).toEqual(true);
    });

    test('A "src" folder is created under top-level prefix folder', async () => {
                
        let stat = await fs.promises.stat(`${DEFAULT_PATH}SRM/src`);
       
        expect(stat.isDirectory()).toEqual(true);
    });


    test(`A "__tests__" folder is created under top-level prefix folder when there are
         prefixed classes that contain the word "test"`, async () => {
                
        let stat = await fs.promises.stat(`${DEFAULT_PATH}SRM/__tests__`);
       
        expect(stat.isDirectory()).toEqual(true);
    });

    test(`Both the .cls and .cls-meta.xml files for non-test classes should be moved
    to the "src" folder under the correct prefix"`, async () => {

        let files = [
            `${DEFAULT_PATH}SRM/src/SRM_deployer.cls`,
            `${DEFAULT_PATH}SRM/src/SRM_deployer.cls-meta.xml`,
            `${DEFAULT_PATH}SRM/src/SRM_retrieve.cls`,
            `${DEFAULT_PATH}SRM/src/SRM_retrieve.cls-meta.xml`

        ]

        files.forEach(file => {

            expect(
                fs.existsSync(file),
                `${file} does not exist`
            ).toEqual(true);

        })

    });

    test(`Both the .cls and .cls-meta.xml files for test classes should be moved
    to the "__tests__" folder under the correct prefix)"`, async () => {

        let files = [
            `${DEFAULT_PATH}SRM/__tests__/SRM_deployerTest.cls`,
            `${DEFAULT_PATH}SRM/__tests__/SRM_deployerTest.cls`
        ]

        files.forEach(file => {

            expect(
                fs.existsSync(file),
                `${file} does not exist`
            ).toEqual(true);

        })

    });

    test(`The Test_ prefix (i.e. Test_PdfCreateService.cls) should not create a Test top-level folder`, async () => {

        expect(
            fs.existsSync(`${DEFAULT_PATH}Test`),
            `${DEFAULT_PATH}Test shouldnt exist as a top-level directory`
        ).toEqual(false);
       

    });

    afterAll(() => {
        mock.restore();
    });
})


const project = {
    'force-app': {
        main: {
            default: {
                classes:{
                    'SRM_deployer.cls':'',
                    'SRM_deployer.cls-meta.xml':'',

                    'SRM_retrieve.cls':'',
                    'SRM_retrieve.cls-meta.xml':'',

                    'FFL_UnitOfWork.cls':'',
                    'FFL_UnitOfWork.cls-meta.xml':'',

                    'SRM_deployerTest.cls':'',
                    'SRM_deployerTest.cls-meta.xml':'',

                    'SRM_retrieve_Tests.cls':'',
                    'SRM_retrieve_Tests.cls-meta.xml':'',

                    'PdfCreateService.cls':'',
                    'PdfCreateService.cls-meta.xml':'',

                    'PdfCreateServiceHttpMock.cls':'',
                    'PdfCreateServiceHttpMock.cls-meta.xml':'',

                    'Test_PdfCreateService.cls':'',
                    'Test_PdfCreateService.cls-meta.xml':''
                }
            }
        }
    }
}

function createRandomThreeLetterString(){
    return Math.random().toString(36).substring(2, 5);
}
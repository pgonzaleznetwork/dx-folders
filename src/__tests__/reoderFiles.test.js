const mock = require('mock-fs');
const fs = require('fs');
const  reoderFiles = require('../../lib/reorderFiles');


describe('reoderFiles', () => {

    beforeAll(() => {
        mock({
            'force-app': {
                main: {
                    default: {
                        classes:{
                            'SRM_deployer':'apex contents...',
                            'SRM_retrieve':'apex contents...',
                        }
                    }
                }
            }
          });
    });

    test('should reoder files', async () => {
        

        await reoderFiles();

        let noDirError = null;
        let stat;

        try {
            stat = await fs.promises.stat('force-app/main/default/classes/SRM');
        } catch (error) {
            noDirError = error;
        }

        //no error means the directory exists
        expect(noDirError).toEqual(null);
        expect(stat.isDirectory()).toEqual(true);

    });

    afterAll(() => {
        mock.restore();
    });
})
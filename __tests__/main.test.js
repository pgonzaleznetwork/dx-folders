const reorderFiles = require('../reorderFiles');
const fs = require('fs');
jest.mock('fs');
const mockFs = jest.requireActual('fs');

describe('reorderFiles', () => {

  test('reorders files and creates new folders', async () => {
    // arrange
    //const sourceDir = './source';
    //const destDir = './dest';
    
    // create a mock file system
    const files = {
      'force-app/main/default/classes/SRM_Deployer': 'class contents',
      'force-app/main/default/classes/SRM_Authentication': 'class contents',
      'force-app/main/default/classes/AccountBatchRemoveOld': 'class contents',
      'force-app/main/default/classes/AccountControllerLwc': 'class contents',
    };

    mockFs.__setMockFiles(files);
    
    // act
    await reorderFiles();
    
    // assert
    expect(fs.existsSync(destDir)).toBe(true);
    expect(fs.existsSync(`${destDir}/folder1`)).toBe(true);
    expect(fs.existsSync(`${destDir}/folder2`)).toBe(true);
    expect(fs.existsSync(`${destDir}/folder1/file3.txt`)).toBe(true);
    expect(fs.existsSync(`${destDir}/folder2/file4.txt`)).toBe(true);
    expect(fs.existsSync(`${destDir}/file1.txt`)).toBe(true);
    expect(fs.existsSync(`${destDir}/file2.txt`)).toBe(true);
  });
});

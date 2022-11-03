const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const upload = async () => {
    try {
        const file = fs.createReadStream('./zip.zip');
        const title = 'GameName';

        const form = new FormData();
        form.append('title', title);
        form.append('file', file);

        const resp = await axios.post('http://localhost:3000/api/games/upload', form, {
            headers: {
                ...form.getHeaders(),
            }
        })

        if (resp.status === 200) {
            console.log("upload complete");
            return 'Upload complete';        
        }
    } catch (err) {
        return new Error(err.message);
    }
}

// upload()
//     .then(resp => console.log(resp))
//     .catch(err => console.log(err));

const jszip = require('jszip');

const fct = async () => {
    const fileContent = fs.readFileSync('d8eb59e2-a9fc-49f8-9fc9-c6897095154b.zip');
    const jszipInstance = new jszip();
    const result = await jszipInstance.loadAsync(fileContent);
    const keys = Object.keys(result.files);

    console.log(keys.filter(key => {
        const keyNameArr = key.split('/');
        return keyNameArr.length === 1 || (keyNameArr.length === 2 && keyNameArr[1].length === 0);
    }).forEach(key => console.log(key.split(['/','\\']).pop())));


    const media = keys.filter(key => {
        const splitKey = key.split('.');
        return !result.files[key].dir && 
            (splitKey[0] === 'icon' || splitKey[0] === 'banner') &&
            (splitKey[1] === 'png' || splitKey[1] === 'jpg' || splitKey[1] === 'jpeg');
    });

    console.log(media);

    const invalidMedia = media.find(key => {
        const splitKey = key.split('.');
        return splitKey[0] !== 'icon' && 
            splitKey[0] !== 'banner' &&
            splitKey[1] !== 'png' &&
            splitKey[1] !== 'jpg' &&
            splitKey[1] !== 'jpeg';
    });

    // create the file to place items in
    //fs.mkdirSync('d8eb59e2-a9fc-49f8-9fc9-c6897095154b');

// for (let key of keys) {
//     const item = result.files[key];
//     if (item.dir) {
//         fs.mkdirSync(`d8eb59e2-a9fc-49f8-9fc9-c6897095154b/${item.name}`);
//     } else {
//         fs.writeFileSync(`d8eb59e2-a9fc-49f8-9fc9-c6897095154b/${item.name}`, Buffer.from(await item.async('arraybuffer')));
//     }
// }
}

//fct();
upload();
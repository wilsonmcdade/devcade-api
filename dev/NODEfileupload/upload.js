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
            return 'Upload complete';        
        }
    } catch (err) {
        return new Error(err.message);
    }
}

upload()
    .then(resp => console.log(resp))
    .catch(err => console.log(err));
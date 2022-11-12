/// Sample Usage in JavaScript using Axios

const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const upload = async () => {
	try {
		const file = fs.createReadStream('./BrickBreaker.zip');
		const title = 'Brick Breaker';

		const form = new FormData();
		form.append('title', title);
		form.append('file', file);

			const response = await axios.post(
				'http://localhost:3200/api/games/upload', 
				form, 
				{ headers: { ...form.getHeaders(), }
		})
			if (response.status === 200) {
			    return 'Upload complete';        
		    } else {
                console.log(response);
            }
	} catch (err) {
		throw err;
	}
}

upload();
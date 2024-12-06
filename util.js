const axios = require('axios');

module.exports = {
    getRequestBody : async function (req) {
        return new Promise((resolve, reject) => {
        let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => resolve(body));
            req.on('error', error => reject(error));
        });
    },

    makeHttpRequest : async function (url, headers, data) {
        try {
            const response = await axios.post(url, data, { headers });
            console.log(`statusCode: ${response.status}`);
            return response.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}
// Native imports
const http = require('http')
const fs = require('fs').promises
const path = require('path')
const httpStatus = require('http-status-codes')
const sendError = require('./errors.js')
// GCP imports
const { Storage, TransferManager } = require('@google-cloud/storage')
const storage = new Storage();


// Using tranfer manager
let bucketName = "videos-de-prueba-01"
const transferManager = new TransferManager(storage.bucket(bucketName))

async function uploadFileInChunksToGCP(chunkSize, filePath) {
	await transferManager.uploadFileInChunks(filePath, {
		chunkSizeBytes: chunkSize,
	})
	console.log(`${filePath} uploaded to ${bucketName}.`)
}


// just for send HTML or static files
async function customReadFile(file_path, res) {
    console.log(`\n---- response file location: ${file_path}`)
    try {
        const data = await fs.readFile(file_path)
        res.write(data)
        res.end()
    } catch (e) {
        console.error(e)
        sendError(res)
    }
}

server = http.createServer(async (request, response) => {
	let url = request.url
	let method = request.method

	console.log(`\n---- request url: ${url} | request method: ${method} ---`)

	if(url === "/") {
		response.writeHead(httpStatus.StatusCodes.OK, {
			"Content-Type": "text/html"
		})
		await customReadFile(path.join(__dirname, 'views', 'index.html'), response)

	} else if(url.indexOf(".css") !== -1) {
		response.writeHead(httpStatus.StatusCodes.OK, {
			"Content-Type": "text/css"
		})
		await customReadFile(path.join(__dirname, url), response)

	} else if(url.indexOf(".js") !== -1 ) {
		response.writeHead(httpStatus.StatusCodes.OK, {
			"Content-Type": "application/javascript"
		})
		await customReadFile(path.join(__dirname, url), response)

	} else if(url==="/upload" && method==='POST') {		/*  ENDPOINT CORRESPONDIENTE AL INTENTO DE CARGA DE ARCHIVO  */

		response.writeHead(httpStatus.StatusCodes.OK, {
			"Content-Type": "application/xml"
		})

		uploadFileInChunksToGCP()
		.catch(console.error)


	} else {
		sendError(response)
	}
})


const PORT = 4242

server.listen(PORT, () =>
	console.log(`server  ->  localhost:${port}`)
})



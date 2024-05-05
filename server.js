// Native imports
const http = require('http')
const fs = require('fs').promises
const fsNoProm = require('fs')
const path = require('path')
// const { Blob } = require('buffer');
const httpStatus = require('http-status-codes')
const sendError = require('./errors.js')
// uuid lib
const { v4: uuidv4 } = require('uuid')
// GCP imports
const { Storage, TransferManager } = require('@google-cloud/storage')
const storage = new Storage()

// Using tranfer manager
let bucketName = "elias-gcp-videos-de-prueba-01"
const transferManager = new TransferManager(storage.bucket(bucketName))
//const res = await transferManager.uploadFileInChunks('large-file.txt')


async function uploadFileInChunksToGCP(filePath) {
	let chunkSize = 4194304
	try {
		let upload_options = {
			uploadId: uuidv4(),
			chunkSizeBytes: chunkSize,
		}
		let r = await transferManager.uploadFileInChunks(filePath, upload_options)
		let j = await r.json()
		console.log(j)

	} catch(err) {
		console.error("err uploading file: ", err)
	}
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

// async function fileToBlob(filePath) {
//     try {
//         // Lee el contenido del archivo
//         const fileContent = await fs.readFile(filePath);

//         // Crea un nuevo blob a partir del contenido del archivo
//         const blob = new Blob([fileContent]);

//         return blob;
//     } catch (error) {
//         console.error('Error al cargar el archivo como un blob:', error);
//         throw error; // Puedes manejar el error según sea necesario
//     }
// }


/*
===========================================================================

	Inicia servidor web

===========================================================================
*/

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

	} else if(url === "/upload" && method === "PUT") {
		let chunks = []
		let fileExtension = request.headers['content-type'].split('/')[1]
		let uniqueId = uuidv4()
		let fileName = `${uniqueId}.${fileExtension}`
		let directory = path.join(__dirname, 'uploads')

        if(!fsNoProm.existsSync(directory)) {
            fsNoProm.mkdirSync(directory, { recursive: true }, (err) => {
                if(err) {
                    console.error('Error al crear el directorio:', err)
                    response.writeHead(httpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
                    response.end()
                } else {
                    console.log('\n       Directorio creado exitosamente\n')
                }
            })
        }

		request.on('data', (chunk) => {
			chunks.push(chunk)
		})

		request.on('end', () => {
			let fileBuffer = Buffer.concat(chunks)
			let newFilePathname = path.join(__dirname, 'uploads', fileName)
			// fileToBlob(newFilePathname)
			// .then((blob) => console.log('Blob:', blob))
			// .catch((error) => console.error('Error on buffer:', error))

			fsNoProm.writeFile(newFilePathname, fileBuffer, (err) => {
				if(err) {
					console.error(err)
					response.writeHead(httpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
					response.end()
				} else {
					uploadFileInChunksToGCP(`${fileName}`)
					response.writeHead(httpStatus.StatusCodes.OK)
					response.end()
				}
			})

		})

	} else {
		sendError(response)
	}
})

const port = 4242
server.listen(port)
console.log(`port ${port}`)



/* else if(url==="/upload" && method==='PUT') {		  ENDPOINT CORRESPONDIENTE AL INTENTO DE CARGA DE ARCHIVO  

		response.writeHead(httpStatus.StatusCodes.OK, {
			"Content-Type": "application/xml"
		})
		//  @params
		//  filePath  : string
		//  chunkSize : num of bytes
		let file_path = "./multimedia/video1.mp4"

		uploadFileInChunksToGCP(file_path)
		.catch(console.error)

	}*/






/*
PUT /paris.jpg?partNumber=1&uploadId=VXBsb2FkIElEIGZvciBlbHZpbmcncyBteS1tb3ZpZS5tMnRzIHVwbG9hZA HTTP/1.1
Host: travel-maps.storage.googleapis.com
Date: Wed, 31 Mar 2021 16:31:08 GMT
Content-Length: 100000000
Content-MD5: Ojk9c3dhfxgoKVVHYwFbHQ==
Authorization: Bearer ya29.AHES6ZRVmB7fkLtd1XTmq6mo0S1wqZZi3-Lh_s-6Uw7p8vtgSwg

***part data omitted***

HTTP/1.1 200 OK
Date:  Wed, 31 Mar 2021 20:34:56 GMT
ETag: "39a59594290b0f9a30662a56d695b71d"
Content-Length: 0
Server: UploadServer
x-goog-hash: crc32c=n03x6A==
x-goog-hash: md5=Ojk9c3dhfxgoKVVHYwFbHQ==



POST /paris.jpg?uploadId=VXBsb2FkIElEIGZvciBlbHZpbmcncyBteS1tb3ZpZS5tMnRzIHVwbG9hZA HTTP/2
Host: travel-maps.storage.googleapis.com
Date: Fri, 2 Apr 2021 18:11:50 GMT
Content-Type: application/xml
Content-Length: 232
Authorization: Bearer ya29.AHES6ZRVmB7fkLtd1XTmq6mo0S1wqZZi3-Lh_s-6Uw7p8vtgSwg

<CompleteMultipartUpload>
  <Part>
    <PartNumber>2</PartNumber>
    <ETag>"7778aef83f66abc1fa1e8477f296d394"</ETag>
  </Part>
  <Part>
    <PartNumber>5</PartNumber>
    <ETag>"aaaa18db4cc2f85cedef654fccc4a4x8"</ETag>
  </Part>
</CompleteMultipartUpload>



HTTP/2 200
Content-Type: application/xml
Content-Length: 324
Date: Fri, 2 Apr 2021 18:11:53 GMT
Server: UploadServer
x-goog-hash: crc32c=n03x6A==

<?xml version="1.0" encoding="UTF-8"?>
<CompleteMultipartUploadResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
  <Location>http://travel-maps.storage.googleapis.com/paris.jpg</Location>
  <Bucket>travel-maps</Bucket>
  <Key>paris.jpg</Key>
  <ETag>"7fc8f92280ac3c975f300cb64412c16f-9"</ETag>
</CompleteMultipartUploadResult>


*/






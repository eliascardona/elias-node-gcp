const calculateChunkSize = (fileSize, maxPartSize, maxPartCount = 20, minPartSize = 2000000) => {
	const maxPartsBasedOnSize = Math.ceil(fileSize / minPartSize);
	const calculatedMaxPartCount = Math.min(maxPartsBasedOnSize, maxPartCount);
	const partSize = Math.ceil(fileSize / calculatedMaxPartCount);
	const finalPartSize = Math.max(minPartSize, Math.min(maxPartSize, partSize));
	const finalPartCount = Math.ceil(fileSize / finalPartSize);

	return finalPartCount;
}
// program as such
let fileSize
let file

const handleFileChange = (evt) => {
	evt.preventDefault()

	file = evt.target.files[0]
	fileSize = file.size
	console.log("file: ", file)
}

const maxPartSizeInBytes = 4 * 1024 * 1024
const maxPartSize = maxPartSizeInBytes / (1024 * 1024)
const partCount = calculateChunkSize(fileSize, maxPartSize)

// upload file func
const upload = (evt) => {
	evt.preventDefault()

	let reader = new FileReader()
	reader.readAsArrayBuffer(file)

	reader.onload = (buff_evt) => {
		let blob = new Blob([buff_evt.target.result], { type: file.type })
		let xhr = new XMLHttpRequest()

		xhr.open("PUT", "/upload", true)
		xhr.setRequestHeader("Content-Type", file.type)
		xhr.onload = function (e) {
			if(xhr.readyState === 4 && xhr.status === 200) {
				console.log(xhr.responseText)
			}
		}
		xhr.send(blob)
	}
}


let file_input = document.getElementById("upload-input")
let btn = document.getElementById("upload-btn")

file_input.addEventListener("change", (e) => {
	console.log('change')
	handleFileChange(e)
})

btn.addEventListener("click", (e) => {
	console.log('click')
	upload(e)
})




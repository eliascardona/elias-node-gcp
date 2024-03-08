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
}

const maxPartSizeInBytes = 4 * 1024 * 1024
const maxPartSize = maxPartSizeInBytes / (1024 * 1024)
const partCount = calculateChunkSize(fileSize, maxPartSize)


// send button func
const upload = (evt) => {
	evt.preventDefault()
	if(!file) return

	let reader = new FileReader()
	reader.readAsArrayBuffer(file)

	reader.onload = (buff_evt) => {
		console.log("buffer reader status: ", buff_evt)
	}

	fetch("/upload", { method: 'POST' })
	.then((res) => res.json())
	.then(data => {
		console.log("data ")
		console.log(data)
	})
	.catch(err => console.log("err ", err))
}

// rest of logic outside any func






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




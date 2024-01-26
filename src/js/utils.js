let body = document.body,
	html = document.documentElement;
export const bodyHeight = Math.max(body.scrollHeight, body.offsetHeight,
	html.clientHeight, html.scrollHeight, html.offsetHeight);
export const bodyWidth = Math.max(body.scrollWidth, body.offsetWidth,
	html.clientWidth, html.scrollWidth, html.offsetWidth);


export const { log } = console

export function getElSizes(el) {

	const width = el.clientWidth || el.offsetWidth || (el.getBoundingClientRect()).width;
	const height = el.clientHeight || el.offsetHeight || (el.getBoundingClientRect()).height;
	return { width, height }
}

// export const capture = async () => {
// 	const canvas = document.createElement("canvas");
// 	const context = canvas.getContext("2d");
// 	const video = document.createElement("video");

// 	try {
// 		const captureStream = await navigator.mediaDevices.getDisplayMedia();
// 		video.srcObject = captureStream;
// 		context.drawImage(video, 0, 0, window.width, window.height);
// 		const frame = canvas.toDataURL("image/png");
// 		captureStream.getTracks().forEach(track => track.stop());
// 		window.location.href = frame;
// 	} catch (err) {
// 		console.error("Error: " + err);
// 	}
// }

export const throttle = (cb, delay) => {
	let timer = null
	return (...args) => {
		if (timer) return
		timer = setTimeout(() => {
			cb(...args)
			clearTimeout(timer)
			timer = null
		}, delay)
	}
}

export const screenShot = () => {

	var element = document.app;

	// Use html2canvas to capture the HTML content as an image
	html2canvas(element).then(function (canvas) {
		// Convert the canvas to a data URL
		var imageData = canvas.toDataURL('image/jpg');

		// Create a link element and trigger a download
		var link = document.createElement('a');
		link.href = imageData;
		link.download = 'puzzle' + Date.now() + '.jpg';
		link.click();
	});
}
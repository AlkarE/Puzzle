let body = document.body,
    html = document.documentElement;
export const bodyHeight = Math.max( body.scrollHeight, body.offsetHeight, 
	html.clientHeight, html.scrollHeight, html.offsetHeight );
export const bodyWidth = Math.max( body.scrollWidth, body.offsetWidth, 
	html.clientWidth, html.scrollWidth, html.offsetWidth );


export const {log} = console

export function getElSizes(el) {

	const width = el.clientWidth || el.offsetWidth || (el.getBoundingClientRect()).width;
	const height = el.clientHeight || el.offsetHeight || (el.getBoundingClientRect()).height;
	return { width, height }
}


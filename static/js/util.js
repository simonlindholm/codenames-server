// From https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob, needed for Safari:
if (!HTMLCanvasElement.prototype.toBlob) {
	Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
		value: function (callback, type, quality) {

			var binStr = atob(this.toDataURL(type, quality).split(',')[1]),
			len = binStr.length,
			arr = new Uint8Array(len);

			for (var i = 0; i < len; i++) {
				arr[i] = binStr.charCodeAt(i);
			}

			callback( new Blob( [arr], {type: type || 'image/png'} ) );
		}
	});
}

// Modified from https://stackoverflow.com/a/32490603, cc by-sa 3.0
// -2 = not jpeg, -1 = no data, 1..8 = orientations
function getExifOrientation(file) {
	// Suggestion from http://code.flickr.net/2012/06/01/parsing-exif-client-side-using-javascript-2/:
	if (file.slice) {
		file = file.slice(0, 131072);
	} else if (file.webkitSlice) {
		file = file.webkitSlice(0, 131072);
	}

	return new Promise(resolve => {
		var reader = new FileReader();
		reader.onload = function(e) {

			var view = new DataView(e.target.result);
			if (view.getUint16(0, false) != 0xFFD8) return resolve(-2);
			var length = view.byteLength, offset = 2;
			while (offset < length) {
				var marker = view.getUint16(offset, false);
				offset += 2;
				if (marker == 0xFFE1) {
					if (view.getUint32(offset += 2, false) != 0x45786966) return resolve(-1);
					var little = view.getUint16(offset += 6, false) == 0x4949;
					offset += view.getUint32(offset + 4, little);
					var tags = view.getUint16(offset, little);
					offset += 2;
					for (var i = 0; i < tags; i++)
						if (view.getUint16(offset + (i * 12), little) == 0x0112)
							return resolve(view.getUint16(offset + (i * 12) + 8, little));
				}
				else if ((marker & 0xFF00) != 0xFF00) break;
				else offset += view.getUint16(offset, false);
			}
			return resolve(-1);
		};
		reader.readAsArrayBuffer(file);
	});
}

// Derived from https://stackoverflow.com/a/40867559, cc by-sa
function imgToCanvasWithOrientation(img, rawWidth, rawHeight, orientation) {
	let canvas = document.createElement('canvas');
	if (orientation > 4) {
		canvas.width = rawHeight;
		canvas.height = rawWidth;
	} else {
		canvas.width = rawWidth;
		canvas.height = rawHeight;
	}

	if (orientation > 1) {
		console.log("EXIF orientation = " + orientation + ", rotating picture");
	}

	var ctx = canvas.getContext('2d');
	switch (orientation) {
		case 2: ctx.transform(-1, 0, 0, 1, rawWidth, 0); break;
		case 3: ctx.transform(-1, 0, 0, -1, rawWidth, rawHeight); break;
		case 4: ctx.transform(1, 0, 0, -1, 0, rawHeight); break;
		case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
		case 6: ctx.transform(0, 1, -1, 0, rawHeight, 0); break;
		case 7: ctx.transform(0, -1, -1, 0, rawHeight, rawWidth); break;
		case 8: ctx.transform(0, -1, 1, 0, 0, rawWidth); break;
	}
	ctx.drawImage(img, 0, 0, rawWidth, rawHeight);
	return canvas;
}

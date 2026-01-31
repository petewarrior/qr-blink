import QRCode from 'https://cdn.jsdelivr.net/npm/qrcode@1.5.4/+esm';

async function getFileObjectFromServer(url, filename, mimeType) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get the data as a Blob
    const blob = await response.blob();

    // Create a File object from the Blob
    const file = new File([blob], filename, { type: mimeType });

    return file;
}


const fileInput = document.getElementById("file");
const domain = document.getElementById("domain");
const mobileSiteQr = document.getElementById('mobile-site-qr');
domain.innerHTML = window.location.origin;
domain.setAttribute('href', window.location.origin);

async function init() {
    const demoFile = await getFileObjectFromServer('/demo/snowprincess.webp', 'snowprincess.webp', 'image/webp');

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(demoFile);

    fileInput.files = dataTransfer.files;
    fileInput.dispatchEvent(new Event('input'));

    QRCode.toCanvas(mobileSiteQr,
        [{ data: window.location.origin }],
        { width: 200 },
        function (error) {
            if (error) {
                console.error(error);
            } else {
            }
        });
}

init();
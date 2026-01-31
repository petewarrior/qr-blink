# QR Blink

Inspired by the [Timex Datalink](https://www.youtube.com/watch?v=64EAfXsX828) from 1994, this little webapp transmits binary data through multiple QR codes displayed sequentially (randomly is also possible with a little modification). Currently only transfers at ~1 kB/s, considering current smartphone QR code processing capabilities. Useful for sharing tiny files (<100 kB) when network is not available.

[**Demo**](https://qr-blink.pages.dev/demo)

It consists of two parts:
- Displayer, where the file is uploaded and the QR codes displayed
- Viewer, uses the camera to scan the QR codes and reconstruct the file

Uses the [Nimiq qr-scanner](https://github.com/nimiq/qr-scanner) and [Soldair's node-qrcode generator](https://github.com/soldair/node-qrcode) libraries.
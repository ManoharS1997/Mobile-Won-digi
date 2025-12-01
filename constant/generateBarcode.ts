export const generateBarcodeHTML = (text: string) => `
  <html>
    <body style="margin:0;padding:0;">
      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
      <svg id="barcode"></svg>
      <script>
        JsBarcode("#barcode", "${text}", {
          format: "CODE128",
          width: 2,
          height: 60,
          displayValue: true
        });
      </script>
    </body>
  </html>
`;

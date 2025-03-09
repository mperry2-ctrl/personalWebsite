// Listen for file selection
document.getElementById('imageInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
      const dataURL = e.target.result;
      const imgPreview = document.getElementById('imagePreview');
      imgPreview.src = dataURL;
      imgPreview.style.display = 'block';
      
      // Store the image data and type globally for later conversion
      window.selectedImageDataURL = dataURL;
      window.selectedImageType = file.type;
    };
    reader.readAsDataURL(file);
  });
  
  // Listen for "Convert to PDF" button click
  document.getElementById('convertButton').addEventListener('click', function() {
    if (!window.selectedImageDataURL) {
      alert('Please upload an image first.');
      return;
    }
    
    // Create an Image object to measure dimensions
    const img = new Image();
    img.onload = function() {
      const width = img.width;
      const height = img.height;
      // Convert pixels to mm (approx. 1px = 0.264583 mm for 96 DPI)
      const pxToMm = 0.264583;
      const pdfWidth = width * pxToMm;
      const pdfHeight = height * pxToMm;
      
      // Use jsPDF to create a PDF document with the same aspect ratio as the image
      const { jsPDF } = window.jspdf;
      const orientation = pdfWidth > pdfHeight ? 'landscape' : 'portrait';
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });
      
      // Determine image type for jsPDF's addImage method
      const imageType = window.selectedImageType.toLowerCase().includes("png") ? 'PNG' : 'JPEG';
      
      pdf.addImage(window.selectedImageDataURL, imageType, 0, 0, pdfWidth, pdfHeight);
      
      // Generate a Data URI string for the PDF
      const pdfDataURL = pdf.output('datauristring');
      
      // Set up the download link
      const downloadLink = document.getElementById('downloadLink');
      downloadLink.href = pdfDataURL;
      downloadLink.style.display = 'inline-block';
      downloadLink.textContent = 'Download PDF';
    };
    img.src = window.selectedImageDataURL;
  });
  
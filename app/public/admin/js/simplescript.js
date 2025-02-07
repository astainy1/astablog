// How to upload and preview images

// Make reference to html elements
const fileInput = document.getElementById('input');
const filePreview = document.getElementById('preview');

// Function to 
fileInput.addEventListener('change', () => {
    const uploadedFile = fileInput.files;
    
    // Check if the upload file exists
    if(uploadedFile){

        const readUploadedFile = new FileReader();

        readUploadedFile.onload = (e) => {
        filePreview.setAttribute('src', e.target.uploadedFile);
    }
    readUploadedFile.readAsDataURL(uploadedFile[0]);
    }
})
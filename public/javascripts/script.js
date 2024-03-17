document.addEventListener('DOMContentLoaded', () => {
  const applicationImgInput = document.querySelector('#upload-application-file');
  const developerImgInput = document.querySelector('#upload-developer-file');
  const genreImgInput = document.querySelector('#upload-genre-file');

  if (applicationImgInput) {
    applicationImgInput.addEventListener('change', (e) => showUploadedImg(e, 'application'));
  }
  
  if (developerImgInput) {
    developerImgInput.addEventListener('change', (e) => showUploadedImg(e, 'developer'));
  }

  if (genreImgInput) {
    genreImgInput.addEventListener('change', (e) => showUploadedImg(e, 'genre'));
  }
})

function showUploadedImg(e, page) {
  const input = e.currentTarget;

  if (input.files && input.files[0]) {
    const reader = new FileReader();

    const img = document.querySelector(`#${page}-image-id`);

    reader.onload = function (e) {
      img.src = e.target.result;
      img.parentElement.classList.add('shown');
    };

    reader.readAsDataURL(input.files[0]);
  }

}
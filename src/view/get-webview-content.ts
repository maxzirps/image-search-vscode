export const getWebviewContent = (
  imageEntries: { previewURL: string; imageURL: string }[]
): string => {
  const imagesPerPage = 20;
  const totalImages = imageEntries.length;
  const totalPages = Math.ceil(totalImages / imagesPerPage);

  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            .image-item {
              border: 2px solid #ccc;
              transition: transform 0.2s;
              margin: 10px;
              width: auto; /* Set a fixed size for consistency */
              height: 150px; /* Set a fixed size for consistency */
              cursor: pointer;
            }
            .image-item:hover {
              transform: scale(1.1);
            }
            #image-container {
              display: flex;
              flex-wrap: wrap;
              justify-content: space-around;
              height: 80vh; /* Fixed height for consistency */
              overflow-y: auto; /* Allow scrolling if images exceed container height */
              align-items: flex-start;
            }
            .pagination {
              display: flex;
              justify-content: center;
              margin-top: 20px;
            }
            .pagination button {
              padding: 10px 20px;
              margin: 0 5px;
              cursor: pointer;
              background-color: #007acc;
              color: white;
              border: none;
              border-radius: 5px;
            }
            .pagination button:disabled {
              background-color: #ccc;
              cursor: not-allowed;
            }
          </style>
        </head>
        <body>
          <div id="image-container">
            <!-- Images will be injected here -->
          </div>
  
          <!-- Pagination controls -->
          <div class="pagination">
            <button id="prevBtn" disabled>Previous</button>
            <span id="pageInfo"></span>
            <button id="nextBtn">Next</button>
          </div>
  
          <script>
            const vscode = acquireVsCodeApi();
            const imageEntries = ${JSON.stringify(
              imageEntries
            )}; // Injected image data
            const imagesPerPage = ${imagesPerPage};
            let currentPage = 1;
            const totalImages = ${totalImages};
            const totalPages = ${totalPages};
  
            // DOM elements
            const imageContainer = document.getElementById('image-container');
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            const pageInfo = document.getElementById('pageInfo');
  
            // Function to render images for the current page
            function renderImages(page) {
              imageContainer.innerHTML = ''; // Clear previous images
              const start = (page - 1) * imagesPerPage;
              const end = page * imagesPerPage;
              const currentImages = imageEntries.slice(start, end);
  
              currentImages.forEach(entry => {
                const imgElement = document.createElement('img');
                imgElement.src = entry.previewURL;
                imgElement.setAttribute('data-url', entry.previewURL);
                imgElement.setAttribute('data-img-url', entry.imageURL);
                imgElement.classList.add('image-item');
  
                imgElement.addEventListener('click', event => {
                  const imageUrl = event.target.getAttribute('data-img-url');
                  vscode.postMessage({
                    command: 'imageClicked',
                    imageUrl: imageUrl
                  });
                });
  
                imageContainer.appendChild(imgElement);
              });
  
              // Update pagination controls and info
              pageInfo.textContent = \`Page \${currentPage} of \${totalPages}\`;
              prevBtn.disabled = currentPage === 1;
              nextBtn.disabled = currentPage === totalPages;
            }
  
            // Event listeners for pagination buttons
            prevBtn.addEventListener('click', () => {
              if (currentPage > 1) {
                currentPage--;
                renderImages(currentPage);
              }
            });
  
            nextBtn.addEventListener('click', () => {
              if (currentPage < totalPages) {
                currentPage++;
                renderImages(currentPage);
              }
            });
  
            // Initial render
            renderImages(currentPage);
          </script>
        </body>
        </html>
      `;
};

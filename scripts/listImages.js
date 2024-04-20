const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '../public/carousel');
const imageFiles = fs.readdirSync(directoryPath)
  .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
  .map(file => {
    const parts = file.split('_');
    const author = parts[0];
    const blogPostName = parts.slice(1, -1).join('_'); // Adjusted to handle blog post names with underscores
    const imageNumber = parts[parts.length - 1].split('.')[0];

    return {
      src: `/carousel/${file}`,
      author: author,
      blogPostTitle: blogPostName.replace(/-/g, ' '),
      blogPostUrl: `/posts/${blogPostName}`,
      imageNumber: imageNumber
    };
  });

fs.writeFileSync(
  path.join(__dirname, '../data/carouselImages.json'),
  JSON.stringify(imageFiles, null, 2)
);

// Generating arrays for Carousel component props
const combinedArray = imageFiles.map(item => ({
  author: item.author,
  blogPostTitle: item.blogPostTitle,
  blogPostUrl: item.blogPostUrl
}));

// Function to shuffle the array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // ES6 destructuring swap
  }
}

// Shuffle the combined array
shuffleArray(combinedArray);

// Extract the data into separate arrays
const authors = combinedArray.map(item => item.author);
const blogTitles = combinedArray.map(item => item.blogPostTitle);
const blogUrls = combinedArray.map(item => item.blogPostUrl);


// Export the arrays
module.exports = { authors, blogTitles, blogUrls };
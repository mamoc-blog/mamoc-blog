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
      blogPostUrl: `/posts/${blogPostName}.mdx`,
      imageNumber: imageNumber
    };
  });

fs.writeFileSync(
  path.join(__dirname, '../data/carouselImages.json'),
  JSON.stringify(imageFiles, null, 2)
);

// Generating arrays for Carousel component props
const authors = imageFiles.map(item => item.author);
const blogTitles = imageFiles.map(item => item.blogPostTitle);
const blogUrls = imageFiles.map(item => item.blogPostUrl);

// Export the arrays (or handle them as needed for your setup)
module.exports = { authors, blogTitles, blogUrls };
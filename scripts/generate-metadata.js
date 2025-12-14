const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const readingTime = require('reading-time');

const postsDirectory = path.join(__dirname, '..', 'posts');
const publicDirectory = path.join(__dirname, '..', 'public');

function generateMetadata() {
    console.log('Generating posts metadata...');

    if (!fs.existsSync(postsDirectory)) {
        console.log('No posts directory found.');
        return;
    }

    const fileNames = fs.readdirSync(postsDirectory).filter(fileName => fileName.match(/\.mdx?$/));

    const metadata = {};

    fileNames.forEach((fileName) => {
        const id = fileName.replace(/\.mdx$/, '').replace(/\.md$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const matterResult = matter(fileContents);

        // Calculate reading time
        const stats = readingTime(matterResult.content);

        metadata[id] = {
            readingTime: stats.text,
            // We can add other heavy calculations here if needed
        };
    });

    fs.writeFileSync(path.join(publicDirectory, 'posts-metadata.json'), JSON.stringify(metadata, null, 2));

    console.log(`Metadata generated for ${Object.keys(metadata).length} posts.`);
}

generateMetadata();

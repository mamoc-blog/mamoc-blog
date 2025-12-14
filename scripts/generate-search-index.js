const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const postsDirectory = path.join(__dirname, '..', 'posts');
const publicDirectory = path.join(__dirname, '..', 'public');

function generateSearchIndex() {
    console.log('Generating search index...');

    // Ensure public directory exists
    if (!fs.existsSync(publicDirectory)) {
        fs.mkdirSync(publicDirectory);
    }

    const fileNames = fs.readdirSync(postsDirectory).filter(fileName => fileName.match(/\.mdx?$/));

    const allPostsData = fileNames.map((fileName) => {
        const id = fileName.replace(/\.mdx$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const matterResult = matter(fileContents);

        return {
            id,
            title: matterResult.data.title,
            description: matterResult.data.description,
            tags: matterResult.data.tags || [],
            date: matterResult.data.date,
        };
    });

    const sortedPosts = allPostsData.sort((a, b) => {
        if (a.date < b.date) {
            return 1;
        } else {
            return -1;
        }
    });

    const outputPath = path.join(publicDirectory, 'search.json');
    fs.writeFileSync(outputPath, JSON.stringify(sortedPosts));

    console.log(`Search index generated at ${outputPath} with ${sortedPosts.length} posts.`);
}

generateSearchIndex();

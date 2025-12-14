const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { Feed } = require('feed');

const postsDirectory = path.join(__dirname, '..', 'posts');
const publicDirectory = path.join(__dirname, '..', 'public');
const siteUrl = 'https://mamoc.net'; // Assuming this is the domain, change if known

function generateRssFeed() {
    console.log('Generating RSS feed...');

    const feed = new Feed({
        title: "MAMOC Blog",
        description: "Technical blog on Machine Learning, NeuroEvolution, and more.",
        id: siteUrl,
        link: siteUrl,
        language: "en",
        image: `${siteUrl}/images/mamoc-text.png`,
        favicon: `${siteUrl}/favicon.ico`,
        copyright: `All rights reserved ${new Date().getFullYear()}, MAMOC`,
        updated: new Date(),
        generator: "Feed for Node.js",
        feedLinks: {
            rss2: `${siteUrl}/rss.xml`,
            json: `${siteUrl}/feed.json`,
            atom: `${siteUrl}/atom.xml`
        },
        author: {
            name: "Cameron Michie & Alexander Cheetham",
            email: "alexandercheetham@example.com", // Replace or omit
            link: siteUrl
        }
    });

    const fileNames = fs.readdirSync(postsDirectory).filter(fileName => fileName.match(/\.mdx?$/));

    const allPosts = fileNames.map((fileName) => {
        const id = fileName.replace(/\.mdx$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const matterResult = matter(fileContents);
        return {
            id,
            ...matterResult.data
        };
    });

    allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    allPosts.forEach((post) => {
        feed.addItem({
            title: post.title,
            id: `${siteUrl}/posts/${post.id}`,
            link: `${siteUrl}/posts/${post.id}`,
            description: post.description || post.summary,
            content: post.summary,
            author: [
                {
                    name: post.author,
                }
            ],
            date: new Date(post.date),
            image: post.imageSrc ? `${siteUrl}${post.imageSrc}` : undefined
        });
    });

    fs.writeFileSync(path.join(publicDirectory, 'rss.xml'), feed.rss2());
    fs.writeFileSync(path.join(publicDirectory, 'atom.xml'), feed.atom1());

    console.log('RSS/Atom feeds generated.');
}

generateRssFeed();

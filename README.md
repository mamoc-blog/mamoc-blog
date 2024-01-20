# mamoc.blog site

## Prerequisites
What things you need to install the software and how to install them:

Node.js (v18.0.0 or higher)
npm (usually comes with Node.js)

## Installation
A step-by-step series of examples that tell you how to get a development environment running:

#### Clone the Repository

`git clone https://github.com/mamoc-blog/mamoc-blog.git`
`cd [local-repository]`

#### Install Dependencies

Run the following command to install the required dependencies:
`brew install sass`
`npm install next@latest react@latest react-dom@latest`
`npm install`

This will install all dependencies listed under dependencies and devDependencies in your package.json.

#### Build the Project

Before starting the development server, you need to build any assets required by the project. Run the build script using:

`npm run build`
This command runs the build:images script to prepare your image assets and then builds your Next.js application.

After building the project, start the development server:

`npm run dev`
This will start the Next.js development server. You can now access your application by navigating to http://localhost:3000 in your browser.

Additional Notes
This project uses Sass for styling. Make sure any Sass files follow the .scss file extension.
The project is configured with a custom script build:images defined in package.json. This script should be executed as part of the build process.








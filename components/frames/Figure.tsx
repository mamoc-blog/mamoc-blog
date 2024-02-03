import React from 'react';

const Figure = ({ src, caption, number }) => {
    // Function to render images or skip rendering if src is empty
    const renderImages = () => {
        // Check if src is an array with at least one non-empty string
        if (Array.isArray(src) && src.some(imageSrc => imageSrc)) {
            return src.map((imageSrc, index) => (
                // Render each non-empty src as an image or GIF
                imageSrc ? <img key={index} src={imageSrc} alt={caption} style={{ maxWidth: '50%', height: 'auto', display: 'inline-block' }} /> : null
            ));
        } else if (src) { // Check if src is a non-empty string
            return <img src={src} alt={caption} style={{ maxWidth: '100%', height: 'auto' }} />;
        }
        // Return null if src is an empty string or an array of empty strings
        return null;
    };

    return (
        <figure>
            {renderImages()}
            <figcaption>Figure {number}: {caption}</figcaption>

            <style>{`
                figure {
                    padding-left: 10rem;
                    padding-right: 10rem;
                    margin: 20px 0;
                    text-align: center; /* Center the caption and images */
                }
                figcaption {
                    margin-top: 8px;
                    font-style: italic;
                }
            `}</style>
        </figure>
    );
};

export default Figure;

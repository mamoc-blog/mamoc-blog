import React from 'react';
import KaTeX from '../utils/KaTeX';

const sizeWidthMap: Record<string, string> = {
    wide: '80%',
    standard: '60%',
    compact: '45%'
};

type FigureProps = {
    src: string | string[];
    caption: string;
    number: number;
    size?: string;
    width?: string;
};

const Figure = ({ src, caption, number, size, width }: FigureProps) => {
    const resolvedWidth = () => {
        if (width) {
            return width;
        }
        if (size) {
            return sizeWidthMap[size] || size;
        }
        return '100%';
    };

    const maxWidth = resolvedWidth();

    const renderImages = () => {
        if (Array.isArray(src) && src.some(imageSrc => imageSrc)) {
            return src.map((imageSrc, index) => (
                imageSrc ? (
                    <img
                        key={index}
                        src={imageSrc}
                        alt={caption}
                        style={{ width: '100%', height: 'auto', maxWidth }}
                    />
                ) : null
            ));
        } else if (src) {
            return (
                <img
                    src={src}
                    alt={caption}
                    style={{ width: '100%', height: 'auto', maxWidth }}
                />
            );
        }
        return null;
    };

    return (
        <figure>
            {renderImages()}
            <figcaption>
                <div style={{ fontWeight: '800', display: 'inline' }}>Figure {number}: </div>
                {caption}
            </figcaption>

            <style>{`
                figure {
                    margin: 20px 0;
                    text-align: center;
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

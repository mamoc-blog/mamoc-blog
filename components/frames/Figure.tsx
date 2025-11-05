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
    const deriveMobileWidth = (value: string) => {
        const match = value.trim().match(/^([\d.]+)(px|%|rem|em)$/);
        if (!match) {
            return '100%';
        }

        const numericValue = parseFloat(match[1]);
        const unit = match[2];

        if (Number.isNaN(numericValue)) {
            return '100%';
        }

        switch (unit) {
            case '%': {
                if (numericValue >= 95) {
                    return `${numericValue}%`;
                }
                return '90%';
            }
            case 'px': {
                const expanded = Math.max(numericValue, 560);
                return `min(100%, ${expanded}px)`;
            }
            case 'rem':
            case 'em': {
                const expanded = Math.max(numericValue, 35);
                return `min(100%, ${expanded}${unit})`;
            }
            default:
                return '100%';
        }
    };

    const mobileMaxWidth = deriveMobileWidth(maxWidth);
    const figureStyle = {
        '--figure-max-width': maxWidth,
        '--figure-mobile-max-width': mobileMaxWidth
    } as React.CSSProperties;

    const imageStyle = {
        width: '100%',
        height: 'auto'
    } as React.CSSProperties;

    const renderImages = () => {
        if (Array.isArray(src) && src.some(imageSrc => imageSrc)) {
            return src.map((imageSrc, index) => (
                imageSrc ? (
                    <img
                        key={index}
                        src={imageSrc}
                        alt={caption}
                        style={imageStyle}
                    />
                ) : null
            ));
        } else if (src) {
            return (
                <img
                    src={src}
                    alt={caption}
                    style={imageStyle}
                />
            );
        }
        return null;
    };

    return (
        <figure data-figure style={figureStyle}>
            {renderImages()}
            <figcaption>
                <div style={{ fontWeight: '800', display: 'inline' }}>Figure {number}: </div>
                {caption}
            </figcaption>

            <style>{`
                figure[data-figure] {
                    margin: 20px 0;
                    text-align: center;
                }
                figure[data-figure] figcaption {
                    margin-top: 8px;
                    font-style: italic;
                }
                figure[data-figure] img {
                    width: 100%;
                    height: auto;
                    max-width: var(--figure-max-width);
                }
                @media (max-width: 900px) {
                    figure[data-figure] img {
                        max-width: var(--figure-mobile-max-width, var(--figure-max-width));
                    }
                }
            `}</style>
        </figure>
    );
};

export default Figure;

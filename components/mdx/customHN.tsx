import Link from "next/link";
import React from "react";

export const CustomH1 = ({ id, ...rest }) => {
    if (id) {
        return (
            <Link href={'#${id}'}>
                <h1 {...rest } />
            </Link>
        );
    }
    return <h1 {...rest} />;
};

export const CustomH2 = ({ id, ...rest }) => {
    if (id) {
        return (
            <Link href={'#${id}'}>
                <h2 {...rest } />
            </Link>
        );
    }
    return <h2 {...rest} />;
};
export const CustomH3 = ({ id, ...rest }) => {
    if (id) {
        return (
            <Link href={'#${id}'}>
                <h3 {...rest } />
            </Link>
        );
    }
    return <h3 {...rest} />;
};
export const CustomH4 = ({ id, ...rest }) => {
    if (id) {
        return (
            <Link href={'#${id}'}>
                <h4 {...rest } />
            </Link>
        );
    }
    return <h4 {...rest} />;
};
export const CustomH5 = ({ id, ...rest }) => {
    if (id) {
        return (
            <Link href={'#${id}'}>
                <h5 {...rest } />
            </Link>
        );
    }
    return <h5 {...rest} />;
};
export const CustomH6 = ({ id, ...rest }) => {
    if (id) {
        return (
            <Link href={'#${id}'}>
                <h6 {...rest } />
            </Link>
        );
    }
    return <h6 {...rest} />;
};

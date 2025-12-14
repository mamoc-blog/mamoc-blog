export const authors = {
    "Cameron Michie": {
        name: "Cameron Michie",
        image: "/images/cam.png",
        links: {
            github: "https://github.com/cameron-michie",
            linkedin: "https://www.linkedin.com/in/cameron-michie/",
            cv: "/cv/cam.pdf"
        }
    },
    "Alex Cheetham": {
        name: "Alex Cheetham",
        image: "/images/alex.png",
        links: {
            github: "https://github.com/alexander-cheetham",
            linkedin: "https://www.linkedin.com/in/alexandercheetham/",
            cv: "/cv/alex.pdf"
        }
    },
    "Alexander Cheetham": { // Alias for full name
        name: "Alexander Cheetham",
        image: "/images/alex.png",
        links: {
            github: "https://github.com/alexander-cheetham",
            linkedin: "https://www.linkedin.com/in/alexandercheetham/",
            cv: "/cv/alex.pdf"
        }
    }
};

export function getAuthorByName(name) {
    // Simple normalization to handle potential inconsistencies if needed, 
    // but direct lookup is preferred if names are consistent.
    return authors[name] || authors["Alex Cheetham"]; // Fallback or throw error in strict mode
}

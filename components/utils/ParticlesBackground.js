import { useCallback, useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useSettingsContext } from "./Theme";

export default function ParticlesBackground() {
    const [init, setInit] = useState(false);
    const { darkTheme } = useSettingsContext();

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const particlesLoaded = useCallback(async (container) => {
        // console.log(container);
    }, []);

    const color = darkTheme ? "#ffffff" : "#000000";

    if (!init) return null;

    return (
        <Particles
            id="tsparticles"
            particlesLoaded={particlesLoaded}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: -1,
                pointerEvents: "none", // Allow clicks to pass through
            }}
            options={{
                fpsLimit: 120,
                interactivity: {
                    events: {
                        onClick: {
                            enable: false,
                            mode: "push",
                        },
                        onHover: {
                            enable: true,
                            mode: "grab",
                        },
                        resize: true,
                    },
                    modes: {
                        push: {
                            quantity: 4,
                        },
                        repulse: {
                            distance: 200,
                            duration: 0.4,
                        },
                        grab: {
                            distance: 140,
                            links: {
                                opacity: 0.5
                            }
                        }
                    },
                },
                particles: {
                    color: {
                        value: color,
                    },
                    links: {
                        color: color,
                        distance: 150,
                        enable: true,
                        opacity: 0.1, // Very subtle opacity
                        width: 1,
                    },
                    move: {
                        direction: "none",
                        enable: true,
                        outModes: {
                            default: "bounce",
                        },
                        random: false,
                        speed: 0.5, // Slow movement
                        straight: false,
                    },
                    number: {
                        density: {
                            enable: true,
                            area: 800,
                        },
                        value: 60, // Moderate number of particles
                    },
                    opacity: {
                        value: 0.1, // Very subtle opacity
                    },
                    shape: {
                        type: "circle",
                    },
                    size: {
                        value: { min: 1, max: 2 },
                    },
                },
                detectRetina: true,
                fullScreen: {
                    enable: true,
                    zIndex: -1
                },
                background: {
                    color: "transparent"
                }
            }}
        />
    );
}

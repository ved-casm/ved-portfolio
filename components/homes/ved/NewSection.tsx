"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollRevealText from "@/components/animations/ScrollRevealText";
import "./NewSection.css";

gsap.registerPlugin(ScrollTrigger);

const ABOUT_TEXT =
    "My Mission is to create next generation designs and make websites that can change the world.";
const ABOUT_QUOTED = `“${ABOUT_TEXT}”`;
const COPY_TEXT = `Web Designer
Frontend Engineer
UI Designer
UX Designer
Design Engineer
E-Com Developer
Virtual Assistant
`;

const NewSection = () => {
    const rootRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const ctx = gsap.context(() => {
            const services = root.querySelector<HTMLElement>(".servicess");
            const copyText = root.querySelector<HTMLElement>(".services-copy h1");
            const headers = gsap.utils.toArray<HTMLElement>(".services-header");
            if (!services || !copyText || headers.length !== 3) return;

            const minScale = () => (window.innerWidth <= 1000 ? 0.3 : 0.1);

            // Layout numbers for the title glide, re-read on every refresh.
            // .services-copy rises from the viewport bottom to the top during the
            // pin's last viewport, so at pin end the paragraph sits at `textTop`.
            const m = { vh: 0, rowH: 0, current: 0, textTop: 0, gap: 0, min: 0.1 };
            const measure = () => {
                m.vh = window.innerHeight;
                m.rowH = headers[1].offsetHeight;
                m.current = headers[1].offsetTop + m.rowH / 2;
                m.textTop = copyText.offsetTop;
                // gap follows the paragraph's fluid font size (clamp in CSS)
                const fontSize = parseFloat(getComputedStyle(copyText).fontSize) || 16;
                m.gap = Math.max(14, fontSize * 0.3);
                m.min = minScale();
            };
            measure();

            const setY = headers.map((h) => gsap.quickSetter(h, "y", "px"));
            // quickSetter has no "scale" shorthand, so set both axes
            const setScale = headers.flatMap((h) => [
                gsap.quickSetter(h, "scaleX"),
                gsap.quickSetter(h, "scaleY"),
            ]);
            const glide = { p: 0 };
            const applyGlide = () => {
                const p = glide.p;
                const scale = 1 - ((1 - Math.cos(Math.PI * p)) / 2) * (1 - m.min);
                const anchorAt = (q: number, s: number) =>
                    m.textTop + m.vh * (1 - q) - m.gap - (m.rowH * s) / 2;
                const g0 = anchorAt(0, 1) - m.current;
                const g = (1 - p) * (1 - p) * ((1 + 2 * p) * g0 - m.vh * p);
                const y = anchorAt(p, scale) - Math.max(0, g) - m.current;
                setScale.forEach((set) => set(scale));
                setY.forEach((set) => set(y));
            };

            // 1. Rows slide in from alternating sides while the section scrolls up
            gsap
                .timeline({
                    defaults: { ease: "none" },
                    scrollTrigger: {
                        trigger: services,
                        start: "top bottom",
                        end: "top top",
                        scrub: 1,
                    },
                })
                .fromTo([headers[0], headers[2]], { xPercent: 100 }, { xPercent: 0 }, 0)
                .fromTo(headers[1], { xPercent: -100 }, { xPercent: 0 }, 0);

            // 2. Pinned: outer rows collapse onto the middle one, then the stack
            //    shrinks and glides onto the paragraph.
            gsap
                .timeline({
                    defaults: { ease: "none" },
                    scrollTrigger: {
                        trigger: services,
                        start: "top top",
                        end: () => `+=${window.innerHeight * 2}`,
                        pin: true,
                        scrub: true,
                        invalidateOnRefresh: true,
                        onRefresh: () => {
                            measure();
                            applyGlide();
                        },
                    },
                })
                .to(headers[0], { yPercent: 100, duration: 1, ease: "power2.inOut" }, 0)
                .to(headers[2], { yPercent: -100, duration: 1, ease: "power2.inOut" }, 0)
                .to(glide, { p: 1, duration: 1, onUpdate: applyGlide }, 1);
        }, root);

        return () => ctx.revert();
    }, []);

    return (
        <div className="newsection" ref={rootRef}>
            <section className="about">
                <ScrollRevealText
                    as="h1"
                    className="animated-text"
                    text={ABOUT_QUOTED}
                    start="top 50%"
                    end="bottom 50%"
                />
            </section>

            <section className="servicess">
                {[0, 1, 2].map((i) => (
                    <div className="services-header" key={i}>
                        <img
                            src="/img/WHO-AM-I.svg"
                            alt={i === 1 ? "Who am I" : ""}
                            aria-hidden={i !== 1}
                            width={2495}
                            height={380}
                            decoding="async"
                        />
                    </div>
                ))}
            </section>

            <section className="services-copy">
                <ScrollRevealText
                    as="h1"
                    className="animated-text"
                    text={COPY_TEXT}
                    start="top 50%"
                    end="bottom 50%"
                />
            </section>
        </div>
    );
};

export default NewSection;

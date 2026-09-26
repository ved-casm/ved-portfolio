"use client";

/* eslint-disable react-hooks/refs -- RefObjects passed to `ref={}`; slotters only touch refs in callbacks */
import type { MutableRefObject } from "react";
import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AutoplayLoopVideo from "@/components/media/AutoplayLoopVideo";
import { videoSources } from "@/lib/lazyVideo";
import { useMxdMenuGsap, useMxdMenuGsapRefs } from "@/hooks/useMxdMenuGsap";
import TextScramble from "@/components/animations/TextScramble";

function normalizePath(p: string): string {
  if (!p) return "/";
  const t = p.endsWith("/") && p.length > 1 ? p.slice(0, -1) : p;
  return t || "/";
}

function pathMatches(pathname: string, href: string): boolean {
  return normalizePath(pathname) === normalizePath(href);
}

function makeSlotters<T>(
  arr: MutableRefObject<(T | null)[]>,
  len: number,
): ((el: T | null) => void)[] {
  return Array.from({ length: len }, (_, i) => (el: T | null) => {
    arr.current[i] = el;
  });
}

type NavProps = {
  navNode: HTMLElement | null;
  toggleNode: HTMLElement | null;
  hamburgerNode: HTMLElement | null;
  setNavNode: (el: HTMLElement | null) => void;
  registerMenuReset: (fn: (() => void) | null) => void;
};

export default function Nav({
  navNode,
  toggleNode,
  hamburgerNode,
  setNavNode,
  registerMenuReset,
}: NavProps) {
  const pathname = usePathname();
  const g = useMxdMenuGsapRefs();
  const menuVideoRef = useRef<HTMLVideoElement>(null);

  // the menu video only downloads once someone reaches for the menu, and only
  // plays while the menu is open (the hamburger carries .active then)
  useEffect(() => {
    const v = menuVideoRef.current;
    if (!hamburgerNode || !v) return;
    const warm = () => {
      if (v.preload === "auto") return;
      v.preload = "auto";
      v.load();
    };
    const sync = () => {
      if (hamburgerNode.classList.contains("active")) {
        warm();
        void v.play().catch(() => {});
      } else {
        v.pause();
      }
    };
    const mo = new MutationObserver(sync);
    mo.observe(hamburgerNode, { attributes: true, attributeFilter: ["class"] });
    hamburgerNode.addEventListener("pointerenter", warm);
    hamburgerNode.addEventListener("focus", warm);
    return () => {
      mo.disconnect();
      hamburgerNode.removeEventListener("pointerenter", warm);
      hamburgerNode.removeEventListener("focus", warm);
    };
  }, [hamburgerNode]);

  const homeSectionActive = pathMatches(pathname, "/");
  const worksSectionActive = pathMatches(pathname, "/works") || pathname.startsWith("/works/");
  const aboutSectionActive = pathMatches(pathname, "/about");
  const servicesSectionActive = pathMatches(pathname, "/services");
  const contactSectionActive = pathMatches(pathname, "/contact");

  const parentItemClass = (current: boolean) =>
    `main-menu__item${current ? " main-menu__item--current" : ""}`;

  const headerSlots = useMemo(() => makeSlotters(g.headerSplitTargets, 3), [g]);
  const mainSlots = useMemo(() => makeSlotters(g.mainMenuLinkSpans, 10), [g]);
  const contactSlots = useMemo(() => makeSlotters(g.contactAnchors, 7), [g]);
  const contactRevealSlots = useMemo(
    () => makeSlotters(g.contactRevealTargets, 7),
    [g],
  );
  const footerSlots = useMemo(() => makeSlotters(g.footerSplitTargets, 4), [g]);
  const dividerSlots = useMemo(() => makeSlotters(g.dividers, 6), [g]);
  const arrowSlots = useMemo(() => makeSlotters(g.arrows, 4), [g]);
  const liSlots = useMemo(() => makeSlotters(g.menuItemLis, 5), [g]);
  const toggleSlots = useMemo(() => makeSlotters(g.menuToggles, 5), [g]);
  const submenuSlots = useMemo(() => makeSlotters(g.menuSubmenus, 5), [g]);

  useMxdMenuGsap(navNode, toggleNode, hamburgerNode, registerMenuReset, g);

  return (
    // The menu was designed on the light theme (its dark look comes from the
    // "opposite" tokens); keep light tokens now that the site is always dark.
    <nav className="mxd-menu mxd-menu--gsap" color-scheme="light" ref={setNavNode}>
      <div ref={g.backdrop} className="mxd-menu__backdrop" />
      {/* Menu Overlay Start */}
      <div ref={g.overlay} className="mxd-menu__overlay">
        <div
          ref={g.content}
          className="mxd-menu__content"
          data-lenis-prevent=""
        >
          {/* Menu Logo Start */}
          <div className="mxd-menu__logo">
            <Link href={`/`} className="menu-logo">
              <img
                className="mxd-logo__image"
                src="/monogram-white-sm.avif"
                alt="VED" />
              {/* logo text */}
              <div className="menu-logo__text">
                <span ref={headerSlots[0]}>Vedank</span>
                <span ref={headerSlots[1]}>Gaur</span>
              </div>
            </Link>
          </div>
          {/* Menu Logo End */}
          {/* Menu Media Start */}
          <div className="mxd-menu__media">
            <div ref={g.mediaWrapper} className="menu-media__wrapper">
              <AutoplayLoopVideo
                ref={menuVideoRef}
                manual
                poster="/video/900x1280_menu-poster.avif"
                sources={videoSources("/video/900x1280_menu.mp4")}
              />
            </div>
          </div>
          {/* Menu Media End */}
          {/* Main Navigation Start */}
          <div className="mxd-menu__navigation">
            <div className="mxd-menu__inner">
              <div className="mxd-menu__shadow shadow-top" />
              <div className="mxd-menu__caption">
                <p ref={headerSlots[2]}>
                  🦄 Unique and creative design
                  <br />
                  and modern web development
                </p>
              </div>
              {/* left side */}
              <div className="mxd-menu__left">
                <div className="main-menu">
                  <div className="main-menu__content">
                    <ul id="main-menu" className="main-menu__accordion">
                      <li
                        ref={liSlots[0]}
                        className={parentItemClass(homeSectionActive)}
                      >
                        <div
                          ref={dividerSlots[0]}
                          className="main-menu__divider divider-top"
                        />
                        <div ref={toggleSlots[0]} className="main-menu__toggle">
                          <Link className="main-menu__link" href="/">
                            <span
                              ref={mainSlots[0]}
                              className="main-menu__number"
                            >
                              / 01
                            </span>
                            <span
                              ref={mainSlots[1]}
                              className="main-menu__caption"
                            >
                              Home
                            </span>
                          </Link>
                        </div>
                        <div
                          ref={dividerSlots[1]}
                          className="main-menu__divider divider-bottom"
                        />
                      </li>
                      <li
                        ref={liSlots[1]}
                        className={parentItemClass(worksSectionActive)}
                      >
                        <div ref={toggleSlots[1]} className="main-menu__toggle">
                          <Link className="main-menu__link" href="/works">
                            <span
                              ref={mainSlots[2]}
                              className="main-menu__number"
                            >
                              / 02
                            </span>
                            <span
                              ref={mainSlots[3]}
                              className="main-menu__caption"
                            >
                              Works
                            </span>
                          </Link>
                        </div>
                        <div
                          ref={dividerSlots[2]}
                          className="main-menu__divider divider-bottom"
                        />
                      </li>
                      <li
                        ref={liSlots[3]}
                        className={parentItemClass(aboutSectionActive)}
                      >
                        <div ref={toggleSlots[3]} className="main-menu__toggle">
                          <Link className="main-menu__link" href="/about">
                            <span
                              ref={mainSlots[6]}
                              className="main-menu__number"
                            >
                              / 03
                            </span>
                            <span
                              ref={mainSlots[7]}
                              className="main-menu__caption"
                            >
                              About Me
                            </span>
                          </Link>
                        </div>
                        <div
                          ref={dividerSlots[4]}
                          className="main-menu__divider divider-bottom"
                        />
                      </li>
                      <li
                        ref={liSlots[2]}
                        className={parentItemClass(servicesSectionActive)}
                      >
                        <div ref={toggleSlots[2]} className="main-menu__toggle">
                          <Link className="main-menu__link" href="/services">
                            <span
                              ref={mainSlots[4]}
                              className="main-menu__number"
                            >
                              / 04
                            </span>
                            <span
                              ref={mainSlots[5]}
                              className="main-menu__caption"
                            >
                              Services
                            </span>
                          </Link>
                        </div>
                        <div
                          ref={dividerSlots[3]}
                          className="main-menu__divider divider-bottom"
                        />
                      </li>
                      <li
                        ref={liSlots[4]}
                        className={parentItemClass(contactSectionActive)}
                      >
                        <div ref={toggleSlots[4]} className="main-menu__toggle">
                          <Link className="main-menu__link" href={`/contact`}>
                            <span
                              ref={mainSlots[8]}
                              className="main-menu__number"
                            >
                              / 05
                            </span>
                            <span
                              ref={mainSlots[9]}
                              className="main-menu__caption"
                            >
                              Contact
                            </span>
                          </Link>
                        </div>
                        <div
                          ref={dividerSlots[5]}
                          className="main-menu__divider divider-bottom"
                        />
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              {/* right side */}
              <div className="mxd-menu__right">
                <div className="menu-contact">
                  <div className="menu-contact__item">
                    <ul className="menu-contact__list">
                      <li>
                        <a
                          ref={contactSlots[0]}
                          className="tag tag-m"
                          href="mailto:vedank0522@gmail.com?subject=Message%20from%20your%20site"
                        >
                          <TextScramble
                            ref={contactRevealSlots[0]}
                            className="mxd-scramble"
                          >
                            vedank0522@gmail.com
                          </TextScramble>
                        </a>
                      </li>
                      <li>
                        <a
                          ref={contactSlots[1]}
                          className="tag tag-m"
                          href="tel:+918302534154"
                        >
                          <TextScramble
                            ref={contactRevealSlots[1]}
                            className="mxd-scramble"
                          >
                            +91 8302534154
                          </TextScramble>
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="menu-contact__item">
                    <ul className="menu-contact__list">
                      <li>
                        <a
                          ref={contactSlots[2]}
                          className="tag tag-m"
                          href="https://goo.gl/maps/nWXKpGaDPuyH6gxRA"
                          target="_blank"
                        >
                          <span ref={contactRevealSlots[2]}>
                            Jaipur
                            <br />
                            Rajasthan
                            <br />
                            302039
                          </span>
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="menu-contact__item">
                    <ul className="menu-contact__list">
                      <li>
                        <a
                          ref={contactSlots[3]}
                          className="tag tag-m"
                          href="https://github.com/ved-casm"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <TextScramble
                            ref={contactRevealSlots[3]}
                            className="mxd-scramble"
                          >
                            GitHub
                          </TextScramble>
                        </a>
                      </li>
                      <li>
                        <a
                          ref={contactSlots[4]}
                          className="tag tag-m"
                          href="https://www.linkedin.com/in/vedank-gaur/"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <TextScramble
                            ref={contactRevealSlots[4]}
                            className="mxd-scramble"
                          >
                            LinkedIn
                          </TextScramble>
                        </a>
                      </li>
                      <li>
                        <a
                          ref={contactSlots[5]}
                          className="tag tag-m"
                          href="https://wa.me/918302534154"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <TextScramble
                            ref={contactRevealSlots[5]}
                            className="mxd-scramble"
                          >
                            WhatsApp
                          </TextScramble>
                        </a>
                      </li>
                      <li>
                        <a
                          ref={contactSlots[6]}
                          className="tag tag-m"
                          href="mailto:vedank0522@gmail.com"
                        >
                          <TextScramble
                            ref={contactRevealSlots[6]}
                            className="mxd-scramble"
                          >
                            Email
                          </TextScramble>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              {/* data bottom line */}
              <div className="mxd-menu__shadow" />
              <div className="mxd-menu__data">
                <div className="menu-data__left">
                  <p ref={footerSlots[0]} className="menu-data__text">
                    Made with{" "}
                    ❤️ &nbsp;
                    {/* <i class="ph-fill ph-heart t-additional"></i> */}
                    by{" "}
                    <Link ref={footerSlots[1]} href="/">
                      <TextScramble className="mxd-scramble">
                        VED
                      </TextScramble>
                    </Link>
                  </p>
                </div>
                <div className="menu-data__right">
                  <p ref={footerSlots[2]} className="menu-data__text">
                    Copyright Vedank
                  </p>
                  <p ref={footerSlots[3]} className="menu-data__text">
                    ©{new Date().getFullYear()}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Main Navigation End */}
        </div>
      </div>
      {/* Menu Overlay End */}
    </nav>
  );
}

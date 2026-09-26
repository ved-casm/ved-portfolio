"use client";

import Link from "next/link";
import { useRef } from "react";
import TextScramble from "@/components/animations/TextScramble";
import { useLenis } from "@/components/common/LenisContext";
import { useHeaderScrollHidden } from "@/hooks/useHeaderScrollHidden";
import CommonLoadAnimation from "@/components/animations/CommonLoadAnimation";
import { usePathname } from "next/navigation";
import "./HeaderMonogram.css";

export default function Header1() {
  const headerRef = useRef<HTMLElement>(null);
  const lenis = useLenis();
  useHeaderScrollHidden(headerRef, lenis);
  const pathname = usePathname();
  const isPermanent = pathname === "/services";
  return (
    <CommonLoadAnimation>
      <header
        id="header"
        ref={headerRef}
        className={`mxd-header ${isPermanent ? "mxd-header-permanent" : ""}`}
      >
        {/* monogram, lined up with the hamburger on the right */}
        {/* the home hero already carries the monogram in this spot */}
        {pathname !== "/" && (
          <div className="mxd-header__logo">
            <Link
              href="/"
              className="ved-header-mono"
              aria-label="Vedank Gaur, home"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/monogram-white-sm.avif" alt="" width={160} height={151} />
            </Link>
          </div>
        )}
      </header>
    </CommonLoadAnimation>
  );
}

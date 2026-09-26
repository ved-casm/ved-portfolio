import type { MenuLinkItem } from "@/types/menu";

export type Footer1NavBlock = {
  title: string;
  links: MenuLinkItem[];
};

export type Footer1NavColumn = {
  className: string;
  blocks: Footer1NavBlock[];
};

export const footer1NavColumns: Footer1NavColumn[] = [
  {
    className: "col-12 col-md-6 mxd-grid-item",
    blocks: [
      {
        title: "/ Navigation",
        links: [
          { href: "/", label: "Home" },
          { href: "/works", label: "Works" },
          { href: "/about", label: "About Me" },
        ],
      },
    ],
  },
  {
    className: "col-12 col-md-6 mxd-grid-item",
    blocks: [
      {
        title: "/ Quick Links",
        links: [
          { href: "/services", label: "Services" },
          { href: "/contact", label: "Contact" },
        ],
      },
    ],
  },
];

export type Footer1PromoItem = {
  href: string;
  iconSrc: string;
  iconAlt: string;
  iconWidth: number;
  iconHeight: number;
  /** Text before the highlighted span */
  textLead: string;
  /** Second line inside `<span>` */
  textSpan: string;
};

export type Footer1BackgroundImage = {
  wrapperClass: string;
  src: string;
  width: number;
  height: number;
  alt: string;
};

export const footer1BackgroundImages: Footer1BackgroundImage[] = [
  {
    wrapperClass: "footer-background__img1",
    src: "/img/demo/clouds-01.avif",
    width: 1400,
    height: 469,
    alt: "Azurio Footer Background Image",
  },
  {
    wrapperClass: "footer-background__img2",
    src: "/img/demo/clouds-02.avif",
    width: 1200,
    height: 401,
    alt: "Azurio Footer Background Image",
  },
];

export const footer1ForegroundImages: Footer1BackgroundImage[] = [
  {
    wrapperClass: "footer-foreground__img1",
    src: "/img/demo/clouds-03.avif",
    width: 1200,
    height: 374,
    alt: "Azurio Footer Foreground Image",
  },
];

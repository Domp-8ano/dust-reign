/* ── CSS / ASSET MODULE DECLARATIONS ─────────────────────────────────────── */
// Allows: import "./index.css" and import styles from "./foo.module.css"
declare module "*.css" {
  const styles: { readonly [className: string]: string };
  export default styles;
}
// Allows: import img from "./hero.png"
declare module "*.png" {
  const src: string;
  export default src;
}
declare module "*.jpg" {
  const src: string;
  export default src;
}
declare module "*.jpeg" {
  const src: string;
  export default src;
}
declare module "*.svg" {
  const src: string;
  export default src;
}
declare module "*.webp" {
  const src: string;
  export default src;
}
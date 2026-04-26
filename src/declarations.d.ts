declare module "*.css" {
  const styles: { readonly [className: string]: string };
  export default styles;
}
declare module "*.png" { const src: string; export default src; }
declare module "*.jpg"  { const src: string; export default src; }
declare module "*.jpeg" { const src: string; export default src; }
declare module "*.svg"  { const src: string; export default src; }
declare module "*.webp" { const src: string; export default src; }
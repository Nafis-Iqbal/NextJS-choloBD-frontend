// Ambient CSS module declarations for side-effect imports like:
//   import "./globals.css";
// Kept in a standalone file (no imports/exports) so TypeScript treats it as
// a global script and picks it up under moduleResolution: "bundler".
declare module "*.css";

declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "@metamask/jazzicon" {
  export default function (diameter: number, seed: number): HTMLElement;
}

import { kebabCase } from "lodash-es";
import styles from "./_var.module.scss";

function toCssVar(styles: { [n: string]: any }) {
  const style = document.createElement("style");

  try {
    let styleNode = "";
    for (const key in styles) {
      styleNode += `--hp-${kebabCase(key)}:${styles[key]};`;
    }
    style.appendChild(document.createTextNode(`body{${styleNode}}`));
  } catch (ex) {
    // @ts-ignore
    style.styleSheet.cssText = `body{${styleNode}}`; // For IE
  }

  const head = document.getElementsByTagName("head")[0];
  head.appendChild(style);
}

export const styleVars = styles;

toCssVar(styleVars);

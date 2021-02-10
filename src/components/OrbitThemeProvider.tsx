import React from "react";
import { ThemeProvider } from "styled-components";
import { fromPlainObject } from "@kiwicom/orbit-design-tokens";

const palette = {
  productLight: "#dddeec",
  productLightHover: "#d3d3f3",
  productLightActive: "#7d81fd",
  productNormal: "#5b60fc",
  productNormalHover: "#353bf5",
  productNormalActive: "#282ffb",
  productDark: "#040cec",
  productDarkHover: "#0910c4",
  productDarkActive: "#050a8c",
  productDarker: "#040645",
};

const theme = fromPlainObject(palette);

type Props = {
  children: React.ReactNode;
};

const OrbitThemeProvider = ({ children }: Props): JSX.Element => (
  <ThemeProvider theme={{ orbit: theme }}>{children}</ThemeProvider>
);

export default OrbitThemeProvider;

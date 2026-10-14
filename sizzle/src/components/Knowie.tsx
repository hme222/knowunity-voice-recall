import React from 'react';
import { Img, staticFile } from 'remotion';

export const Knowie: React.FC<{ src: string; style?: React.CSSProperties }> = ({ src, style }) => (
  <Img src={staticFile(src)} style={{ display: 'block', ...style }} />
);

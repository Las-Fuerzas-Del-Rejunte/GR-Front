//Mock para la clase AreaChartCards

import React from 'react';

export const ResponsiveContainer = ({ children }) =>
  React.createElement('div', null, children);

export const AreaChart = ({ children }) =>
  React.createElement('div', null, children);

export const Area = () =>
  React.createElement('div', { 'data-testid': 'area-chart-line' });

export const Tooltip = () => null;

import ReactDOM from "react-dom";

jest.spyOn(ReactDOM, "createPortal").mockImplementation((element) => element);
import { extent } from "d3-array";
import { AreaClosed } from "@vx/shape";
import { GridColumns, GridRows } from "@vx/grid";
import { curveMonotoneX } from "@vx/curve";
import { scaleTime, scaleLinear } from "@vx/scale";
import { AxisLeft, AxisBottom } from "@vx/axis";
import { Group } from "@vx/group";
import React from "react";

function numberFormat(number: string | number, d: number) {
  let x = ("" + number).length;
  d = Math.pow(10, d);
  x -= x % 3;
  return Math.round((+number * d) / Math.pow(10, x)) / d + " kMB"[x / 3];
}

interface MarginShape {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

type Props = {
  width: number;
  height: number;
  margin?: MarginShape;
  data: { date: string | number; remaining: number }[];
};

export default function Chart({
  width,
  height,
  margin = { top: 10, right: 0, bottom: 23, left: 50 },
  data,
}: Props) {
  if (width < 10) return null;

  const getDate = (d: any) => new Date(d.id);
  const getValue = (d: any) => d.remaining;

  // bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // scales
  const dateScale = scaleTime({
    range: [0, xMax],
    domain: extent(data, getDate) as [Date, Date],
  });
  const valueScale = scaleLinear({
    range: [yMax, 0],
    domain: [0, 2.8e9], //min(data, getValue)
    nice: true,
  });

  return (
    <div>
      <svg width={width} height={height}>
        <Group top={margin.top} left={margin.left}>
          <rect x={0} y={0} width={xMax} height={yMax} fill="#32deaa" rx={14} />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <GridRows<number>
            scale={valueScale}
            width={xMax}
            strokeDasharray="2,2"
            stroke="rgba(255,255,255,0.3)"
            pointerEvents="none"
          />
          <GridColumns<Date>
            scale={dateScale}
            height={yMax}
            strokeDasharray="2,2"
            stroke="rgba(255,255,255,0.3)"
            pointerEvents="none"
          />
          <AreaClosed
            data={data}
            x={(d) => dateScale(getDate(d))}
            y={(d) => valueScale(getValue(d))}
            yScale={valueScale}
            strokeWidth={1}
            stroke="url(#gradient)"
            fill="url(#gradient)"
            curve={curveMonotoneX}
          />
          <AxisLeft
            scale={valueScale}
            top={0}
            left={0}
            stroke={"#1b1a1e"}
            numTicks={10}
            tickFormat={(v) => numberFormat(+v, 2).toString()}
          />
          <AxisBottom
            scale={dateScale}
            top={yMax}
            label={""}
            stroke={"#1b1a1e"}
            numTicks={4}
          />
        </Group>
      </svg>
    </div>
  );
}

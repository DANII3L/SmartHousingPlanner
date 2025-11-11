import React, { useEffect, useMemo, useRef, useState } from "react";
import { Chart } from "react-google-charts";

const ScrollableBarChart = ({
  data = [],
  options = {},
  height = 420,
  minBars = 6,
  barPixelWidth = 120,
  loader = <div className="text-sm text-slate-500">Cargando gráfico…</div>,
}) => {
  const scrollRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }

    const update = () => {
      setContainerWidth(el.clientWidth);
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  const chartPixelWidth = useMemo(() => {
    const rows = Math.max((data?.length ?? 1) - 1, 1);
    const required = Math.max(rows, minBars) * barPixelWidth;
    return Math.max(required, containerWidth || 0);
  }, [data, containerWidth, minBars, barPixelWidth]);

  const mergedOptions = useMemo(
    () => ({
      chartArea: { width: "85%", height: "75%" },
      legend: { position: "bottom", textStyle: { color: "#475569", fontSize: 12 } },
      colors: ["#cbd5f5", "#2563eb"],
      tooltip: {
        textStyle: { color: "#1f2937", fontSize: 12 },
        showColorCode: true,
      },
      explorer: {
        actions: ["dragToPan", "rightClickToReset"],
        axis: "horizontal",
        keepInBounds: true,
        maxZoomOut: 1,
      },
      hAxis: {
        textStyle: { color: "#475569", fontSize: 12 },
        baselineColor: "#e2e8f0",
        gridlines: { color: "#e2e8f0" },
      },
      vAxis: {
        textStyle: { color: "#475569", fontSize: 12 },
      },
      backgroundColor: "transparent",
      ...options,
    }),
    [options],
  );

  const handleMouseDown = (event) => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }

    const startX = event.pageX - el.offsetLeft;
    const startScroll = el.scrollLeft;

    const onMove = (moveEvent) => {
      moveEvent.preventDefault();
      const x = moveEvent.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = startScroll - walk;
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      ref={scrollRef}
      className="w-full overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing"
      style={{ WebkitOverflowScrolling: "touch" }}
      onMouseDown={handleMouseDown}
    >
      <div
        className="inline-block"
        style={{ width: `${chartPixelWidth}px`, minWidth: "100%" }}
      >
        <Chart
          chartType="Bar"
          data={data}
          options={mergedOptions}
          width={`${chartPixelWidth}px`}
          height={`${height}px`}
          loader={loader}
        />
      </div>
    </div>
  );
};

export default ScrollableBarChart;


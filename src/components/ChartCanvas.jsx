import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function ChartCanvas({ type, data, options }) {
  const ref = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(ref.current.getContext("2d"), { type, data, options });
    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data), JSON.stringify(options)]);

  return <canvas ref={ref}></canvas>;
}

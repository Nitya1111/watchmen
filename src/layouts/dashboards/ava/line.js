import { LineChart } from "@opd/g2plot-react";

export default function line({ vibrationData }) {
  const config1 = {
    padding: "auto",
    autoFit: true,
    data: vibrationData,
    xField: "year",
    yField: "value",
    yAxis: {
      label: {
        formatter: (v) => `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`),
      },
    },
    legend: {
      position: "right-top",
    },
    seriesField: "type",
  };

  return (
    <section>
      <LineChart {...config1} />
    </section>
  );
}

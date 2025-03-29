interface KeyMetricsProps {
  selectedTable: string;
}

const KeyMetrics = ({ selectedTable }: KeyMetricsProps) => {
  return <div>{`KeyMetrics ${selectedTable}`}</div>;
};

export default KeyMetrics;

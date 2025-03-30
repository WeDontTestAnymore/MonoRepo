interface PartitionDetailsProps {
  selectedTable: string;
}

const PartitionDetails = ({ selectedTable }: PartitionDetailsProps) => {
  return <div>{`PartitionDetails ${selectedTable}`}</div>;
};

export default PartitionDetails;

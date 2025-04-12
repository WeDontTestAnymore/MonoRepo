interface DeltaTablePropertiesProps {
  selectedTable: string;
}

const DeltaTableProperties = ({
  selectedTable,
}: DeltaTablePropertiesProps) => {
  return <div>{`DeltaTableProperties ${selectedTable}`}</div>;
};

export default DeltaTableProperties;

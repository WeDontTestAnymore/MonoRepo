interface TablePropertiesProps {
  selectedTable: string;
}

const TableProperties = ({ selectedTable }: TablePropertiesProps) => {
  return <div>{`TableProperties ${selectedTable}`}</div>;
};

export default TableProperties;

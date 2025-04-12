interface IcebergVersioningProps {
  selectedTable: string;
}

const IcebergVersioning = ({ selectedTable }: IcebergVersioningProps) => {
  return <div>{`IcebergVersioning ${selectedTable}`}</div>;
};

export default IcebergVersioning;

interface VersioningProps {
  selectedTable: string;
}

const Versioning = ({ selectedTable }: VersioningProps) => {
  return <div>{`Versioning ${selectedTable}`}</div>;
};

export default Versioning;

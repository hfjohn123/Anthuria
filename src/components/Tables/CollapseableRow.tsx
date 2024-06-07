export default function CollapsibleRow({
  data,
  defaultIsOpen = false,
  id,
  children,
}: {
  data: string[] | number[];
  defaultIsOpen?: boolean;
  id: string;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = React.useState(defaultIsOpen);

  return (
    <>
      <tr onClick={() => setIsOpen(!isOpen)}>
        {data.map((d) => (
          <td key={id}>{d} </td>
        ))}
      </tr>
      {isOpen && children}
    </>
  );
}

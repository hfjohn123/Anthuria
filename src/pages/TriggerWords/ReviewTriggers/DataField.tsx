import HighlightWrapper from '../../../components/Basic/HighlightWrapper.tsx';
import clsx from 'clsx';

export default function DataField({
  title,
  children,
  content,
  searchTerm,
  className,
}: {
  title: string | React.ReactNode;
  className?: string;
} & (
  | {
      children?: never;
      content: string;
      searchTerm: string;
    }
  | {
      children?: React.ReactNode;
      content?: never;
      searchTerm?: never;
    }
)) {
  return (
    <div className={clsx('flex flex-col gap-2 ', className)}>
      {typeof title === 'string' ? (
        <h3 className="text-[#7A7A7A]">{title}</h3>
      ) : (
        title
      )}
      {children ? (
        children
      ) : (
        <HighlightWrapper text={content || ''} searchTerm={searchTerm || ''} />
      )}
    </div>
  );
}

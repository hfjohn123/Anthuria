import { Link } from 'react-router-dom';
import SelectInline from '../Forms/SelectGroup/SelectInline';
interface BreadcrumbProps {
  title: string;
  isDropDown?: boolean;
  selectedOption?: string;
  setSelectedOption?: (option: string) => void;
  options?: string[];
}
function Breadcrumb({
  title,
  isDropDown = false,
  selectedOption,
  setSelectedOption,
  options,
}: BreadcrumbProps) {
  return (
    <div className="mb-4 xl:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between order-first">
      <nav>
        <ol className="flex items-center gap-2 select-none">
          <li>
            <Link
              className="font-medium hidden sm:block text-nowrap"
              to="/dashboard"
            >
              NHQI Dashboard /
            </Link>
          </li>
          {isDropDown && selectedOption && setSelectedOption && options ? (
            <SelectInline
              options={options}
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
            />
          ) : (
            <li className="font-medium text-primary">{title}</li>
          )}
        </ol>
      </nav>
    </div>
  );
}

export default Breadcrumb;

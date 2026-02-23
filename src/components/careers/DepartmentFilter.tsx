import { Button } from "@/components/ui/button";

interface DepartmentFilterProps {
  departments: string[];
  selected: string | null;
  onSelect: (dept: string | null) => void;
}

export const DepartmentFilter = ({ departments, selected, onSelect }: DepartmentFilterProps) => {
  if (departments.length <= 1) return null;

  return (
    <div className="flex flex-wrap gap-2 justify-center mb-10">
      <Button
        variant={selected === null ? "default" : "outline"}
        size="sm"
        onClick={() => onSelect(null)}
        className="rounded-full"
      >
        Todas
      </Button>
      {departments.map((dept) => (
        <Button
          key={dept}
          variant={selected === dept ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(dept)}
          className="rounded-full"
        >
          {dept}
        </Button>
      ))}
    </div>
  );
};

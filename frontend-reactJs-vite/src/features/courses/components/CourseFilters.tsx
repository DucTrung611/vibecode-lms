import { Select } from '@/shared/components/Select';
import { useCategories } from '../hooks/useCategories';
import { COURSE_LEVELS, type CourseLevel } from '../types/courses.types';

interface CourseFiltersProps {
  level: CourseLevel | '';
  onLevelChange: (level: CourseLevel | '') => void;
  categoryId: string;
  onCategoryChange: (categoryId: string) => void;
}

export function CourseFilters({
  level,
  onLevelChange,
  categoryId,
  onCategoryChange,
}: CourseFiltersProps) {
  const categories = useCategories();

  const categoryOptions = [
    { value: '', label: 'All categories' },
    ...(categories.data ?? []).map((category) => ({
      value: category.id,
      label: category.name,
    })),
  ];

  const levelOptions = [
    { value: '', label: 'All levels' },
    ...COURSE_LEVELS.map((value) => ({
      value,
      label: value.charAt(0) + value.slice(1).toLowerCase(),
    })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Select
        label="Category"
        value={categoryId}
        options={categoryOptions}
        onChange={onCategoryChange}
      />
      <Select
        label="Level"
        value={level}
        options={levelOptions}
        onChange={(value) => onLevelChange(value as CourseLevel | '')}
      />
    </div>
  );
}

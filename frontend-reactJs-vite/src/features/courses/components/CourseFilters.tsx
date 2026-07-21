import { COURSE_LEVELS, type CourseLevel } from '../types/courses.types';

interface CourseFiltersProps {
  level: CourseLevel | '';
  onLevelChange: (level: CourseLevel | '') => void;
}

export function CourseFilters({ level, onLevelChange }: CourseFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="level-filter" className="text-sm font-medium text-gray-700">
        Level
      </label>
      <select
        id="level-filter"
        value={level}
        onChange={(e) => onLevelChange(e.target.value as CourseLevel | '')}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
      >
        <option value="">All levels</option>
        {COURSE_LEVELS.map((value) => (
          <option key={value} value={value}>
            {value.charAt(0) + value.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
    </div>
  );
}

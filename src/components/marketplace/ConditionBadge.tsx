import React from 'react';
import { ListingCondition } from '../../types';
import { CONDITION_BADGE_STYLES } from '../../services/conditionOptions';

interface ConditionBadgeProps {
  condition: ListingCondition;
  size?: 'sm' | 'md';
  className?: string;
}

/** Single source of truth for the condition badge so it looks identical on every card and page. */
export const ConditionBadge: React.FC<ConditionBadgeProps> = ({ condition, size = 'sm', className = '' }) => {
  const style = CONDITION_BADGE_STYLES[condition] || CONDITION_BADGE_STYLES.Good;
  const sizing = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[10px]';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-wider backdrop-blur-md border shadow-sm ${sizing} ${style} ${className}`}
      title={`Condition: ${condition}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {condition}
    </span>
  );
};

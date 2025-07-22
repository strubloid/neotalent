import { BreadcrumbItem } from '../types';

interface BreadcrumbsSectionProps {
  breadcrumbs: BreadcrumbItem[];
  onBreadcrumbClick: (searchId: string) => void;
  onClearHistory: () => void;
}

const BreadcrumbsSection = ({ breadcrumbs, onBreadcrumbClick, onClearHistory }: BreadcrumbsSectionProps) => {
  return null; // Temporary placeholder
};

export default BreadcrumbsSection;

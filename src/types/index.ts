export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive" | "Pending";
  avatar?: string;
  lastLogin?: Date;
  dateJoined?: Date;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  change?: string;
  changeType?: 'positive' | 'negative';
  description?: string;
}

import { Link } from "react-router-dom";
import { MapPin, Briefcase, ArrowRight } from "lucide-react";

interface JobCardProps {
  id: string;
  title: string;
  location: string;
  employment_type: string;
}

export const JobCard = ({ id, title, location, employment_type }: JobCardProps) => {
  return (
    <Link
      to={`/carreiras/${id}`}
      className="group flex items-center justify-between p-5 rounded-xl border border-border bg-card hover:shadow-elegant transition-smooth"
    >
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground group-hover:text-secondary transition-smooth">
          {title}
        </h3>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {location}
          </span>
          <span className="flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5" />
            {employment_type}
          </span>
        </div>
      </div>
      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-smooth shrink-0" />
    </Link>
  );
};

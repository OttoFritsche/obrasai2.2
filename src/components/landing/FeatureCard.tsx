
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const FeatureCard = ({ title, description, icon: Icon }: FeatureCardProps) => {
  return (
    <Card className="border-construction-dark/10 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="bg-construction-dark/5 p-3 rounded-full w-12 h-12 flex items-center justify-center text-construction-accent">
          <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold text-construction-dark">{title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-construction-dark/80">{description}</p>
      </CardContent>
    </Card>
  );
};

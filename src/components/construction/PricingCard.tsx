
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  highlighted?: boolean;
}

export const PricingCard = ({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  highlighted = false,
}: PricingCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className={`border ${
        highlighted 
          ? 'border-construction-accent shadow-lg relative' 
          : 'border-construction-dark/10'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-0 right-0 flex justify-center">
          <span className="bg-construction-accent text-white text-xs font-bold px-3 py-1 rounded-full">
            RECOMENDADO
          </span>
        </div>
      )}
      <CardHeader className="text-center pb-2">
        <h3 className={`text-xl font-bold ${highlighted ? 'text-construction-accent' : 'text-construction-dark'}`}>
          {title}
        </h3>
        <div className="mt-4">
          <span className="text-3xl font-bold text-construction-dark">{price}</span>
          <span className="text-construction-dark/60">{period}</span>
        </div>
        <p className="mt-2 text-sm text-construction-dark/60">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className={`h-5 w-5 ${highlighted ? 'text-construction-accent' : 'text-green-500'}`} />
              <span className="text-construction-dark/80 text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-4">
        <Button 
          onClick={() => navigate("/register")}
          className={`w-full ${
            highlighted 
              ? 'bg-construction-accent hover:bg-construction-accent/90 text-white' 
              : 'border-construction-accent text-construction-accent bg-white hover:bg-construction-accent/10'
          }`}
          variant={highlighted ? "default" : "outline"}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

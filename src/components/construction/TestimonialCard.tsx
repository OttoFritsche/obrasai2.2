
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface TestimonialCardProps {
  quote: string;
  author: string;
  position: string;
  companyLogo?: string;
}

export const TestimonialCard = ({ quote, author, position, companyLogo }: TestimonialCardProps) => {
  return (
    <Card className="border-construction-dark/10 shadow-lg">
      <CardContent className="pt-6">
        <svg className="h-8 w-8 text-construction-accent mb-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
        <p className="text-construction-dark/80 italic mb-4">{quote}</p>
      </CardContent>
      <CardFooter className="border-t pt-4 flex items-center gap-4">
        {companyLogo && (
          <img src={companyLogo} alt="Company logo" className="h-8 w-auto" />
        )}
        <div>
          <p className="font-bold text-construction-dark">{author}</p>
          <p className="text-construction-dark/60 text-sm">{position}</p>
        </div>
      </CardFooter>
    </Card>
  );
};

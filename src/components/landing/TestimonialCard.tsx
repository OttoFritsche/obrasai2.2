
import { Card, CardContent } from "@/components/ui/card";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company: string;
}

export const TestimonialCard = ({ quote, author, role, company }: TestimonialCardProps) => {
  return (
    <Card className="border-construction-dark/10 shadow-lg">
      <CardContent className="pt-6">
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-construction-accent"
            >
              <path d="M10 11h-4a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2.667 -1.333 4.333 -4 5" />
              <path d="M19 11h-4a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v6c0 2.667 -1.333 4.333 -4 5" />
            </svg>
          </div>
          <p className="text-construction-dark/80 mb-6 italic flex-1">{quote}</p>
          <div className="mt-auto">
            <p className="font-semibold text-construction-dark">{author}</p>
            <p className="text-sm text-construction-dark/60">{role}, {company}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
